import logging
from typing import Dict, List, Tuple, Any, Optional
from datetime import datetime, date
import numpy as np
import pandas as pd

from app.config import settings
from app.models import YearlyHazardMetric, HeatwaveEventDetail, BaselineInfo

logger = logging.getLogger(__name__)

def get_day_of_year(date_str: str) -> int:
    """
    Returns calendar day of year (1-365).
    Maps Feb 29 (day 60 in leap years) to day 59 to keep a consistent 365-day calendar.
    """
    dt = datetime.strptime(date_str, "%Y-%m-%d").date()
    doy = dt.timetuple().tm_yday
    # Check if leap year and after Feb 28
    is_leap = (dt.year % 4 == 0 and (dt.year % 100 != 0 or dt.year % 400 == 0))
    if is_leap and doy >= 60:
        if doy == 60:
            return 59  # Group leap day with Feb 28
        return doy - 1
    return min(doy, 365)

def calculate_doy_percentiles(
    baseline_data: Dict[int, Dict[str, Any]],
    percentile: float = 95.0,
    half_window: int = 7
) -> Tuple[np.ndarray, float, float]:
    """
    Calculates the 95th percentile threshold for each calendar day of year (1 to 365)
    using a centered ±7-day window (15-day sample) across all baseline years (1991-2020).
    Circularly wraps window around year boundary (e.g. Dec 31 to Jan 1).
    Returns:
    - doy_p95: np.ndarray of shape (366,) indexed 1..365
    - overall_mean: float
    - overall_p95: float
    """
    # Group all baseline observations by DOY
    doy_to_temps: Dict[int, List[float]] = {d: [] for d in range(1, 366)}
    all_baseline_temps: List[float] = []

    for year, yr_data in baseline_data.items():
        dates = yr_data["dates"]
        tmax = yr_data["tmax"]
        for d_str, temp in zip(dates, tmax):
            if temp is not None and not np.isnan(temp):
                doy = get_day_of_year(d_str)
                doy_to_temps[doy].append(temp)
                all_baseline_temps.append(temp)

    doy_p95 = np.zeros(366, dtype=np.float64)

    # For each calendar day, aggregate observations in [d - half_window, d + half_window]
    for d in range(1, 366):
        window_temps: List[float] = []
        for offset in range(-half_window, half_window + 1):
            target_doy = d + offset
            # Circular wrap around 1..365
            if target_doy < 1:
                target_doy += 365
            elif target_doy > 365:
                target_doy -= 365
            window_temps.extend(doy_to_temps[target_doy])

        if len(window_temps) > 0:
            doy_p95[d] = float(np.percentile(window_temps, percentile))
        else:
            # Fallback to overall percentile if window is empty
            doy_p95[d] = float(np.percentile(all_baseline_temps, percentile)) if all_baseline_temps else 35.0

    overall_mean = float(np.mean(all_baseline_temps)) if all_baseline_temps else 25.0
    overall_p95 = float(np.percentile(all_baseline_temps, percentile)) if all_baseline_temps else 35.0

    return doy_p95, overall_mean, overall_p95

def detect_heatwaves(
    dates: List[str],
    tmax: List[Optional[float]],
    doy_p95: np.ndarray,
    min_consecutive_days: int = 3
) -> Tuple[List[HeatwaveEventDetail], List[bool], List[float]]:
    """
    Identifies heatwave events based on consecutive extreme days.
    CRITICAL: Missing data (None) acts as a strict run breaker and is NEVER interpolated.
    Returns:
    - events: list of HeatwaveEventDetail
    - is_in_heatwave: boolean array for each day
    - anomalies: degree anomaly above threshold for each day
    """
    n = len(dates)
    is_hot = np.zeros(n, dtype=bool)
    anomalies = np.zeros(n, dtype=np.float64)

    for i in range(n):
        temp = tmax[i]
        if temp is None or np.isnan(temp):
            is_hot[i] = False
            anomalies[i] = 0.0
            continue
        doy = get_day_of_year(dates[i])
        threshold = doy_p95[doy]
        if temp >= threshold:
            is_hot[i] = True
            anomalies[i] = temp - threshold
        else:
            is_hot[i] = False
            anomalies[i] = 0.0

    events: List[HeatwaveEventDetail] = []
    is_in_heatwave = [False] * n

    # Scan for consecutive hot runs
    i = 0
    while i < n:
        if is_hot[i]:
            start_idx = i
            while i < n and is_hot[i]:
                i += 1
            run_length = i - start_idx
            if run_length >= min_consecutive_days:
                # Mark days as part of a heatwave
                for j in range(start_idx, i):
                    is_in_heatwave[j] = True

                run_temps = [tmax[k] for k in range(start_idx, i) if tmax[k] is not None]
                run_anomalies = [anomalies[k] for k in range(start_idx, i)]

                peak_temp = max(run_temps) if run_temps else 0.0
                avg_temp = float(np.mean(run_temps)) if run_temps else 0.0
                cumulative_anomaly = float(np.sum(run_anomalies))

                events.append(HeatwaveEventDetail(
                    start_date=dates[start_idx],
                    end_date=dates[i - 1],
                    duration_days=run_length,
                    peak_temperature=round(peak_temp, 2),
                    avg_temperature=round(avg_temp, 2),
                    cumulative_anomaly=round(cumulative_anomaly, 2)
                ))
        else:
            i += 1

    return events, is_in_heatwave, anomalies.tolist()

def analyze_climate_hazard(
    analysis_data: Dict[int, Dict[str, Any]],
    baseline_data: Dict[int, Dict[str, Any]],
    percentile: float = 95.0,
    consecutive_days: int = 3,
    grid_lat: float = 0.0,
    grid_lon: float = 0.0
) -> Tuple[List[YearlyHazardMetric], BaselineInfo, List[HeatwaveEventDetail]]:
    """
    Complete climate hazard calculation:
    1. Derives DOY 95th percentiles from fixed 1991-2020 baseline.
    2. Detects heatwave runs in continuous timeseries.
    3. Aggregates annual hazard indicators and tracks data quality.
    """
    doy_p95, overall_mean, overall_p95 = calculate_doy_percentiles(
        baseline_data=baseline_data,
        percentile=percentile,
        half_window=settings.DOY_WINDOW_HALF_DAYS
    )

    # Flatten analysis years into chronological timeseries
    sorted_years = sorted(analysis_data.keys())
    all_dates: List[str] = []
    all_tmax: List[Optional[float]] = []

    for y in sorted_years:
        all_dates.extend(analysis_data[y]["dates"])
        all_tmax.extend(analysis_data[y]["tmax"])

    events, is_in_heatwave, anomalies = detect_heatwaves(
        dates=all_dates,
        tmax=all_tmax,
        doy_p95=doy_p95,
        min_consecutive_days=consecutive_days
    )

    # Map events and days back to each year
    event_by_start_year: Dict[int, List[HeatwaveEventDetail]] = {y: [] for y in sorted_years}
    for ev in events:
        ev_year = int(ev.start_date[:4])
        if ev_year in event_by_start_year:
            event_by_start_year[ev_year].append(ev)

    yearly_metrics: List[YearlyHazardMetric] = []
    current_idx = 0

    for y in sorted_years:
        yr_dates = analysis_data[y]["dates"]
        yr_tmax = analysis_data[y]["tmax"]
        yr_len = len(yr_dates)
        missing_count = analysis_data[y].get("missing_count", 0)

        # Count heatwave days in this specific year
        yr_heatwave_days = sum(is_in_heatwave[current_idx:current_idx + yr_len])
        yr_anomalies = anomalies[current_idx:current_idx + yr_len]
        yr_heatwave_severity = sum(
            yr_anomalies[k] for k in range(yr_len) if is_in_heatwave[current_idx + k]
        )

        current_idx += yr_len

        yr_events = event_by_start_year[y]
        num_events = len(yr_events)
        avg_dur = round(float(np.mean([e.duration_days for e in yr_events])), 1) if num_events > 0 else 0.0

        valid_temps = [t for t in yr_tmax if t is not None and not np.isnan(t)]
        yr_max_temp = round(max(valid_temps), 2) if valid_temps else None

        # Data completeness test: flag if missing days > 10% of year (~36 days)
        data_quality = "VALID"
        if yr_len > 0 and (missing_count / yr_len) > (settings.MAX_MISSING_DAYS_PERCENT / 100.0):
            data_quality = "INSUFFICIENT"

        yearly_metrics.append(YearlyHazardMetric(
            year=y,
            heatwave_events=num_events,
            total_heatwave_days=yr_heatwave_days,
            avg_duration_days=avg_dur,
            max_temperature=yr_max_temp,
            cumulative_severity=round(yr_heatwave_severity, 2),
            missing_days=missing_count,
            data_quality=data_quality
        ))

    # Sample DOY thresholds (e.g. every 15 days) for visual threshold representation
    sample_doy: List[dict] = []
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    # 1st and 15th of each month approximately
    sample_days = [1, 15, 32, 46, 60, 75, 91, 106, 121, 136, 152, 167, 182, 197, 213, 228, 244, 259, 274, 289, 305, 320, 335, 350]
    for sd in sample_days:
        approx_month = min(12, max(1, (sd // 30) + 1))
        approx_day = (sd % 30) or 30
        label = f"{month_names[approx_month - 1]} {approx_day}"
        sample_doy.append({
            "doy": sd,
            "label": label,
            "threshold_temp": round(float(doy_p95[sd]), 2)
        })

    baseline_info = BaselineInfo(
        baseline_period=f"{settings.BASELINE_START_YEAR}-{settings.BASELINE_END_YEAR} (WMO Climatological Standard)",
        grid_latitude=grid_lat,
        grid_longitude=grid_lon,
        overall_mean_tmax=round(overall_mean, 2),
        overall_p95_tmax=round(overall_p95, 2),
        sample_doy_thresholds=sample_doy
    )

    # Return top 20 most recent events for detailed view
    recent_events = sorted(events, key=lambda e: e.start_date, reverse=True)[:20]

    return yearly_metrics, baseline_info, recent_events
