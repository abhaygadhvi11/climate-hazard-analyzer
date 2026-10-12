from fastapi import APIRouter
from typing import List
from app.models import PresetCity

router = APIRouter(prefix="/presets", tags=["presets"])

PRESET_CITIES: List[PresetCity] = [
    PresetCity(
        id="delhi",
        name="New Delhi",
        country="India",
        latitude=28.61,
        longitude=77.23,
        description="Subtropical megacity experiencing intense pre-monsoon heatwaves with temperatures exceeding 45°C."
    ),
    PresetCity(
        id="phoenix",
        name="Phoenix, Arizona",
        country="United States",
        latitude=33.45,
        longitude=-112.07,
        description="Sonoran desert urban heat island known for prolonged extreme summer heat stretches."
    ),
    PresetCity(
        id="seville",
        name="Seville",
        country="Spain",
        latitude=37.38,
        longitude=-5.98,
        description="One of Europe's hottest urban centers, piloting heatwave naming and classification systems."
    ),
    PresetCity(
        id="sydney",
        name="Sydney",
        country="Australia",
        latitude=-33.87,
        longitude=151.21,
        description="Southern hemisphere coastal region subject to summer heat extremes and wildfire hazards."
    ),
    PresetCity(
        id="tokyo",
        name="Tokyo",
        country="Japan",
        latitude=35.68,
        longitude=139.69,
        description="Temperate urban heat island experiencing increasingly severe humid summer heat events."
    ),
    PresetCity(
        id="paris",
        name="Paris",
        country="France",
        latitude=48.85,
        longitude=2.35,
        description="Western European capital severely impacted by European heatwaves (e.g. 2003, 2019, 2022)."
    )
]

@router.get("", response_model=List[PresetCity])
def get_presets():
    """Returns curated climate hotspot presets for rapid evaluation."""
    return PRESET_CITIES
