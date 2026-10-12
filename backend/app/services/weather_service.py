import logging
import asyncio
import httpx
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime
from app.config import settings

logger = logging.getLogger(__name__)

OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"

def snap_to_grid(lat: float, lon: float, step: float = 0.25) -> Tuple[float, float, str]:
    """
    Snaps latitude and longitude to the nearest ERA5 grid node (0.25 deg resolution).
    Returns (snapped_lat, snapped_lon, grid_id).
    """
    snapped_lat = round(round(lat / step) * step, 2)
    snapped_lon = round(round(lon / step) * step, 2)
    # Bound to valid geographical ranges
    snapped_lat = max(-90.0, min(90.0, snapped_lat))
    snapped_lon = max(-180.0, min(180.0, snapped_lon))
    grid_id = f"{snapped_lat:.2f}_{snapped_lon:.2f}"
    return snapped_lat, snapped_lon, grid_id

async def fetch_open_meteo_chunk(
    lat: float,
    lon: float,
    start_year: int,
    end_year: int,
    client: Optional[httpx.AsyncClient] = None
) -> Dict[str, Any]:
    """
    Fetches daily maximum temperatures for a year span from Open-Meteo.
    """
    start_date = f"{start_year}-01-01"
    end_date = f"{end_year}-12-31"
    
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "daily": "temperature_2m_max",
        "timezone": "auto"
    }

    close_client = False
    if client is None:
        client = httpx.AsyncClient(timeout=30.0)
        close_client = True

    try:
        response = await client.get(OPEN_METEO_ARCHIVE_URL, params=params)
        response.raise_for_status()
        data = response.json()
        return data
    except httpx.HTTPStatusError as e:
        logger.error("Open-Meteo HTTP error: %s - %s", e.response.status_code, e.response.text)
        raise RuntimeError(f"Open-Meteo API returned error {e.response.status_code}")
    except Exception as e:
        logger.error("Failed to fetch weather data: %s", e)
        raise RuntimeError(f"Failed to fetch weather data: {str(e)}")
    finally:
        if close_client:
            await client.aclose()

def split_into_yearly_dictionaries(
    dates: List[str],
    tmax_values: List[Optional[float]]
) -> Dict[int, Dict[str, Any]]:
    """
    Partitions flat API daily arrays into year-keyed dictionaries.
    Maintains raw values and counts missing (None/NaN) observations.
    """
    by_year: Dict[int, Dict[str, Any]] = {}
    for date_str, temp in zip(dates, tmax_values):
        year = int(date_str[:4])
        if year not in by_year:
            by_year[year] = {
                "dates": [],
                "tmax": [],
                "missing_count": 0
            }
        by_year[year]["dates"].append(date_str)
        by_year[year]["tmax"].append(temp)
        if temp is None:
            by_year[year]["missing_count"] += 1
    return by_year
