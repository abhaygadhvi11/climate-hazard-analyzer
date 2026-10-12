import logging
from typing import Dict, List, Set, Tuple, Any
import httpx

from app.config import settings
from app.db import db_manager
from app.services.weather_service import (
    snap_to_grid,
    fetch_open_meteo_chunk,
    split_into_yearly_dictionaries
)

logger = logging.getLogger(__name__)

def find_contiguous_intervals(years: List[int]) -> List[Tuple[int, int]]:
    """
    Groups a sorted list of years into contiguous intervals [start, end].
    Example: [1990, 1991, 1992, 1995, 1996] -> [(1990, 1992), (1995, 1996)]
    """
    if not years:
        return []
    sorted_years = sorted(list(set(years)))
    intervals: List[Tuple[int, int]] = []
    start = sorted_years[0]
    prev = sorted_years[0]

    for y in sorted_years[1:]:
        if y == prev + 1:
            prev = y
        else:
            intervals.append((start, prev))
            start = y
            prev = y
    intervals.append((start, prev))
    return intervals

async def get_or_fetch_weather_data(
    lat: float,
    lon: float,
    required_years: List[int]
) -> Tuple[str, Dict[int, Dict[str, Any]], int, int]:
    """
    Retrieves weather data for the specified years.
    Returns:
    - grid_id: str
    - data_by_year: Dict[year, {"dates": [...], "tmax": [...], "missing_count": int}]
    - cache_hit_count: int
    - api_fetch_count: int
    """
    snapped_lat, snapped_lon, grid_id = snap_to_grid(lat, lon, settings.GRID_STEP)
    unique_years = sorted(list(set(required_years)))

    # Step 1: Check NoSQL cache
    cached_data = db_manager.get_cached_years(grid_id, unique_years)
    cache_hit_count = len(cached_data)

    missing_years = [y for y in unique_years if y not in cached_data]
    api_fetch_count = len(missing_years)

    # Step 2: Fetch missing years in batched contiguous chunks
    if missing_years:
        intervals = find_contiguous_intervals(missing_years)
        logger.info(
            "Grid %s: %d years in cache, fetching %d missing years across %d intervals",
            grid_id, cache_hit_count, api_fetch_count, len(intervals)
        )

        async with httpx.AsyncClient(timeout=45.0) as client:
            for start_y, end_y in intervals:
                # To be gentle with Open-Meteo, if interval > 15 years, split into sub-chunks
                sub_start = start_y
                while sub_start <= end_y:
                    sub_end = min(sub_start + 14, end_y)
                    logger.debug("Fetching Open-Meteo chunk %d-%d for %s", sub_start, sub_end, grid_id)
                    raw_resp = await fetch_open_meteo_chunk(
                        snapped_lat, snapped_lon, sub_start, sub_end, client
                    )
                    daily = raw_resp.get("daily", {})
                    dates = daily.get("time", [])
                    tmax_vals = daily.get("temperature_2m_max", [])

                    yearly_dict = split_into_yearly_dictionaries(dates, tmax_vals)
                    for yr, yr_data in yearly_dict.items():
                        # Save to NoSQL database
                        db_manager.save_year_cache(
                            grid_id=grid_id,
                            year=yr,
                            dates=yr_data["dates"],
                            tmax=yr_data["tmax"],
                            missing_count=yr_data["missing_count"]
                        )
                        # Add to our working dataset
                        cached_data[yr] = yr_data
                    
                    sub_start = sub_end + 1

    # Filter to only the requested years
    result = {y: cached_data[y] for y in unique_years if y in cached_data}
    return grid_id, result, cache_hit_count, api_fetch_count
