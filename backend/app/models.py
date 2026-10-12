from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator

class BoundingBox(BaseModel):
    min_latitude: float = Field(..., ge=-90.0, le=90.0)
    max_latitude: float = Field(..., ge=-90.0, le=90.0)
    min_longitude: float = Field(..., ge=-180.0, le=180.0)
    max_longitude: float = Field(..., ge=-180.0, le=180.0)

class AnalyzeRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude between -90 and 90")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude between -180 and 180")
    bounding_box: Optional[BoundingBox] = Field(None, description="Optional custom lat-lon bounding box")
    selection_type: Literal["point", "bounding_box"] = Field("point", description="Region selection mode")
    start_year: int = Field(1990, ge=1950, le=2024, description="Start year of analysis")
    end_year: int = Field(2023, ge=1950, le=2024, description="End year of analysis")
    hazard_type: Literal["heatwave"] = Field("heatwave", description="Hazard type (default: heatwave)")
    consecutive_days: int = Field(3, ge=2, le=14, description="Minimum consecutive days above threshold")
    percentile: float = Field(95.0, ge=80.0, le=99.9, description="Percentile threshold (e.g., 95.0)")

    @field_validator("end_year")
    @classmethod
    def validate_year_order(cls, v, info):
        if "start_year" in info.data and v < info.data["start_year"]:
            raise ValueError("end_year must be greater than or equal to start_year")
        if "start_year" in info.data and (v - info.data["start_year"]) < 4:
            raise ValueError("Time range must span at least 5 years for meaningful trend detection")
        return v

class YearlyHazardMetric(BaseModel):
    year: int
    heatwave_events: int
    rolling_avg_5yr: Optional[float] = None  # 5-year rolling average of heatwave events
    total_heatwave_days: int
    avg_duration_days: float
    max_temperature: Optional[float]
    cumulative_severity: float  # Degree-days accumulated above 95th percentile during heatwaves
    missing_days: int
    data_quality: str  # 'VALID' or 'INSUFFICIENT'

class HeatwaveEventDetail(BaseModel):
    start_date: str
    end_date: str
    duration_days: int
    peak_temperature: float
    avg_temperature: float
    cumulative_anomaly: float

class TrendStatistics(BaseModel):
    slope_events_per_decade: float
    p_value: float
    r_squared: float
    is_statistically_significant: bool
    mann_kendall_trend: str
    mann_kendall_p_value: float
    baseline_decade_mean: float
    recent_decade_mean: float
    percent_change: Optional[float]
    insight_narrative: str

class BaselineInfo(BaseModel):
    baseline_period: str
    grid_latitude: float
    grid_longitude: float
    overall_mean_tmax: float
    overall_p95_tmax: float
    sample_doy_thresholds: List[dict]  # Day-of-Year sample thresholds for visualization

class AnalyzeResponse(BaseModel):
    grid_id: str
    location_name: Optional[str] = None
    cache_hit_years: int
    api_fetched_years: int
    storage_mode: str
    baseline_info: BaselineInfo
    yearly_metrics: List[YearlyHazardMetric]
    trend_statistics: TrendStatistics
    recent_events: List[HeatwaveEventDetail]

class PresetCity(BaseModel):
    id: str
    name: str
    country: str
    latitude: float
    longitude: float
    description: str
