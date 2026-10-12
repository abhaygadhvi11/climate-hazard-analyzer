import csv
import io
from fastapi import APIRouter, Response
from typing import List
from app.models import YearlyHazardMetric, AnalyzeResponse

router = APIRouter(prefix="/export", tags=["export"])

@router.post("/csv")
def export_csv(payload: AnalyzeResponse):
    """
    Exports yearly hazard indicators and statistical insights into a downloadable CSV file.
    """
    output = io.StringIO()
    writer = csv.writer(output)

    # Metadata Header
    writer.writerow(["# Climate Hazard Trend Analyzer - Data Export"])
    writer.writerow(["# Grid ID", payload.grid_id])
    writer.writerow(["# Grid Coordinates", f"Lat {payload.baseline_info.grid_latitude}, Lon {payload.baseline_info.grid_longitude}"])
    writer.writerow(["# Climatological Baseline", payload.baseline_info.baseline_period])
    writer.writerow(["# Overall Baseline Mean Tmax (°C)", payload.baseline_info.overall_mean_tmax])
    writer.writerow(["# Overall Baseline 95th Percentile (°C)", payload.baseline_info.overall_p95_tmax])
    writer.writerow(["# Linear Trend Slope (Events/Decade)", payload.trend_statistics.slope_events_per_decade])
    writer.writerow(["# Regression p-value", payload.trend_statistics.p_value])
    writer.writerow(["# Mann-Kendall Trend", payload.trend_statistics.mann_kendall_trend])
    writer.writerow(["# Insight Summary", payload.trend_statistics.insight_narrative])
    writer.writerow([])  # Blank row separator

    # Column Headers
    writer.writerow([
        "Year",
        "Heatwave Events",
        "Total Heatwave Days",
        "Average Duration (Days)",
        "Max Temperature (°C)",
        "Cumulative Severity (Degree-Days)",
        "Missing Days",
        "Data Quality"
    ])

    # Data Rows
    for row in payload.yearly_metrics:
        writer.writerow([
            row.year,
            row.heatwave_events,
            row.total_heatwave_days,
            row.avg_duration_days,
            row.max_temperature if row.max_temperature is not None else "N/A",
            row.cumulative_severity,
            row.missing_days,
            row.data_quality
        ])

    csv_data = output.getvalue()
    filename = f"climate_hazard_{payload.grid_id}_{payload.yearly_metrics[0].year}_{payload.yearly_metrics[-1].year}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
