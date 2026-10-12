import asyncio
import time
from app.models import AnalyzeRequest
from app.routes.analyze import analyze_hazard

async def main():
    print("Testing Climate Hazard Backend Pipeline & Cache Hit...")
    req = AnalyzeRequest(
        latitude=28.61,
        longitude=77.23,
        start_year=2018,
        end_year=2023,
        hazard_type="heatwave",
        consecutive_days=3,
        percentile=95.0
    )
    t0 = time.time()
    res = await analyze_hazard(req)
    t1 = time.time()
    print("=== CACHE HIT TEST RESULTS ===")
    print(f"Elapsed Time: {(t1 - t0)*1000:.1f} ms")
    print("Grid ID:", res.grid_id)
    print("Cache Hit Years:", res.cache_hit_years)
    print("API Fetched Years:", res.api_fetched_years)
    print("Storage Mode:", res.storage_mode)
    print("Trend Narrative:", res.trend_statistics.insight_narrative)

if __name__ == "__main__":
    asyncio.run(main())
