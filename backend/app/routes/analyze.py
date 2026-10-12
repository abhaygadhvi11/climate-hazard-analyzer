import logging
from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List

from app.config import settings
from app.models import AnalyzeRequest, AnalyzeResponse
from app.services.weather_service import snap_to_grid
from app.services.cache_service import get_or_fetch_weather_data
from app.services.climate_engine import analyze_climate_hazard
from app.services.statistics import compute_trend_statistics
from app.db import db_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyze", tags=["analyze"])

@router.post("", response_model=AnalyzeResponse)
async def analyze_hazard(request: AnalyzeRequest):
    """
    Core Climate Hazard Analysis Endpoint:
    1. Snaps input lat/lon to nearest 0.25° grid node.
    2. Identifies required years (user range + 1991-2020 WMO baseline).
    3. Fetches from NoSQL cache or retrieves missing years from Open-Meteo.
    4. Computes Day-Of-Year 95th percentile baseline (±7-day window).
    5. Detects 3+ consecutive day heatwaves with strict gap protection.
    """
    try:
        target_lat = request.latitude
        target_lon = request.longitude
        loc_name = None

        if request.selection_type == "bounding_box" and request.bounding_box:
            bbox = request.bounding_box
            target_lat = (bbox.min_latitude + bbox.max_latitude) / 2.0
            target_lon = (bbox.min_longitude + bbox.max_longitude) / 2.0
            loc_name = f"Custom Box [{bbox.min_latitude:.2f}°-{bbox.max_latitude:.2f}°N, {bbox.min_longitude:.2f}°-{bbox.max_longitude:.2f}°E]"

        snapped_lat, snapped_lon, grid_id = snap_to_grid(
            target_lat, target_lon, settings.GRID_STEP
        )

        # Baseline years (1991-2020) + User-requested analysis years
        baseline_years = list(range(settings.BASELINE_START_YEAR, settings.BASELINE_END_YEAR + 1))
        analysis_years = list(range(request.start_year, request.end_year + 1))
        all_required_years = sorted(list(set(baseline_years + analysis_years)))

        # Retrieve/cache weather data
        grid_id, weather_data, cache_hits, api_fetches = await get_or_fetch_weather_data(
            lat=snapped_lat,
            lon=snapped_lon,
            required_years=all_required_years
        )

        # Partition baseline vs analysis sets
        baseline_subset = {y: weather_data[y] for y in baseline_years if y in weather_data}
        analysis_subset = {y: weather_data[y] for y in analysis_years if y in weather_data}

        if len(baseline_subset) < 15:
            raise HTTPException(
                status_code=502,
                detail=f"Insufficient baseline data available for grid {grid_id} to compute climatological normal."
            )

        if len(analysis_subset) < 4:
            raise HTTPException(
                status_code=400,
                detail="At least 4 years of data required to compute trend metrics."
            )

        # Run domain climate logic
        yearly_metrics, baseline_info, recent_events = analyze_climate_hazard(
            analysis_data=analysis_subset,
            baseline_data=baseline_subset,
            percentile=request.percentile,
            consecutive_days=request.consecutive_days,
            grid_lat=snapped_lat,
            grid_lon=snapped_lon
        )

        # Compute trend regression & Mann-Kendall statistics
        trend_stats = compute_trend_statistics(yearly_metrics)

        return AnalyzeResponse(
            grid_id=grid_id,
            location_name=loc_name,
            cache_hit_years=cache_hits,
            api_fetched_years=api_fetches,
            storage_mode=db_manager.mode,
            baseline_info=baseline_info,
            yearly_metrics=yearly_metrics,
            trend_statistics=trend_stats,
            recent_events=recent_events
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error during climate analysis: %s", e)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while analyzing climate trends: {str(e)}"
        )
