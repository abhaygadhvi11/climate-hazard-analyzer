# Climate Hazard Trend Analyzer 🌡️🌍
> Full-Stack Developer Case Study Submission for **Dygnify Ventures Pvt Ltd**

An end-to-end web application that analyzes long-term historical weather reanalysis records and visualizes climate hazard trends (specifically heatwaves), built strictly on domain-standard climatological definitions.

![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React%20%7C%20MongoDB%20%7C%20Chart.js%20%7C%20Leaflet-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Live Demo & Architecture

- **Frontend Application**: React 18, Vite, Leaflet, Chart.js, Vanilla CSS (Glassmorphism Dark Theme)
- **Backend API**: Python 3.12, FastAPI, Pandas, NumPy, SciPy, SlowAPI
- **Climatological Data Engine**: Open-Meteo ERA5 Global Historical Weather Reanalysis (1940–Present)
- **Database / Cache Layer**: Dual-mode NoSQL architecture (MongoDB Atlas / Embedded Local TinyDB document store)

```
┌────────────────────────────────────────────────────────────────────────┐
│                          REACT 18 DASHBOARD                            │
│  [Leaflet Map Picker]   [1-Click City Presets]   [Time Range Slider]   │
│  [Chart.js Frequency]   [Severity / Duration]    [DOY Baseline Curve]  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND SERVICE                         │
│  • Pydantic Input Validation (-90..90 lat, -180..180 lon)              │
│  • SlowAPI Rate Limiting (60 req/min)                                  │
│  • Coordinate Snapping to 0.25° ERA5 Grid Node                         │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
          Cache Miss│                      Cache Hit │ (Sub-50ms)
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│        OPEN-METEO ARCHIVE API        │  │       NoSQL DATABASE         │
│  Historical daily max temperatures   │  │  MongoDB Atlas / TinyDB      │
│  (Batched multi-year chunks)         │  │  Keyed by: (grid_id, year)   │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

---

## 🔬 Domain-Specific Climate Hazard Logic

### 1. The Climatological Reference Baseline (WMO Standard)
Rather than computing percentiles dynamically over the user's selected time range (which would inadvertently shift the threshold upward and mask warming), the system uses a **fixed reference normal: 1991–2020** as standardized by the **World Meteorological Organization (WMO)**.

### 2. Day-of-Year (DOY) Centered Rolling Window
A single static threshold (e.g. 95th percentile across all 365 days) only flags peak summer days and renders winter/spring heat extremes invisible.
- For each calendar day $d \in [1..365]$, we construct a **$\pm 7$-day cyclic window** ($15$-day window) across all 30 baseline years (sample size $\approx 450$ values).
- The 95th percentile threshold $P_{95}(d)$ is computed for each calendar day:
  $$T_{\max}(y, d) \ge P_{95}(d)$$

### 3. Heatwave Run Definition & Strict Gap Handling
- **Event Criterion**: A heatwave requires **at least 3 consecutive days** ($L \ge 3$) where daily $T_{\max} \ge P_{95}(\text{DOY})$.
- **No Synthetic Interpolation**: For run-length hazard indicators, linear interpolation can fabricate artificial heatwave days or merge distinct events. Missing days are treated as **strict run breakers**.
- **Data Completeness Threshold**: Years with $>10\%$ missing observations (>36 days) are marked as `INSUFFICIENT` and excluded from trend regressions.

### 4. Trend Analysis & Statistical Tests
- **OLS Linear Regression**: Computes decadal frequency change ($\Delta\text{events/decade}$), $R^2$, and two-sided $p$-value.
- **Mann-Kendall Monotonic Trend Test (Bonus Challenge)**: A non-parametric test evaluating whether an upward or downward monotonic climate shift exists without assuming normal distribution.
- **Honest Insight Generation**:
  - Guards against division by zero when baseline decade frequency is $0.0$.
  - Notes insufficient sample size when total historical events are $< 3$.
  - Explicitly reports whether observed changes are statistically significant ($p < 0.05$).

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.11+ (Python 3.12 recommended)
- Node.js 18+ & npm

### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Configure MongoDB Atlas in .env:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
# If omitted, it will automatically use the built-in local NoSQL document store (TinyDB) in data/cache_store.json

# Launch API server
python run.py
# Running on http://localhost:8000 (Swagger docs at http://localhost:8000/docs)
```

### 2. Frontend Setup
```bash
cd frontend

# Install packages
npm install

# Start development server
npm run dev
# Running on http://localhost:5173
```

---

## 📦 Project Structure

```text
climate-hazard-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, SlowAPI rate limiter
│   │   ├── config.py            # Pydantic Settings & baseline parameters
│   │   ├── db.py                # Dual NoSQL manager (MongoDB Atlas + TinyDB fallback)
│   │   ├── models.py            # Pydantic schemas (requests, responses, metrics)
│   │   ├── services/
│   │   │   ├── weather_service.py   # Open-Meteo ERA5 ingestion & 0.25° grid snap
│   │   │   ├── cache_service.py     # Granular (grid_id, year) caching orchestration
│   │   │   ├── climate_engine.py    # DOY ±7-day window & WMO baseline engine
│   │   │   └── statistics.py        # OLS regression, Mann-Kendall, insight generation
│   │   └── routes/
│   │       ├── analyze.py       # POST /api/analyze
│   │       ├── presets.py       # GET /api/presets
│   │       └── export.py        # POST /api/export/csv
│   ├── requirements.txt
│   ├── run.py
│   └── test_backend.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Header & live NoSQL status badge
│   │   │   ├── CityPresets.jsx      # 1-Click test hotspot selector
│   │   │   ├── MapSelector.jsx      # Leaflet interactive region picker
│   │   │   ├── ControlPanel.jsx     # Sliders, coordinates & parameters
│   │   │   ├── KpiMetrics.jsx       # Stat cards (slope, p-value, events)
│   │   │   ├── InsightBanner.jsx    # Scientific narrative & test badges
│   │   │   ├── ChartsView.jsx       # Chart.js time-series & DOY curve
│   │   │   └── EventsTable.jsx      # Individual heatwave runs & export
│   │   ├── api.js                   # Backend Axios client
│   │   ├── App.jsx                  # Root dashboard layout
│   │   └── index.css                # Glassmorphic dark design system
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🎯 Bonus Challenges Implemented

1. **Interactive Map UI for Region Selection**:
   - Integrated Leaflet map with CartoDB Dark Matter tiles.
   - Click-to-pinpoint coordinate picker with live 0.25° grid node indicator.
2. **PDF / CSV Export of Insights**:
   - One-click CSV export with complete climatological metadata headers and annual metrics.
   - Print-optimized view for direct PDF generation.
3. **Advanced Trend Detection**:
   - Both **Ordinary Least Squares (OLS) regression** and **Mann-Kendall non-parametric monotonic trend test** are computed and reported.

---

## 🤖 AI Disclosure (As Required by Dygnify)

- **AI Tools Used**: Google Gemini 3.1 Pro (via Antigravity IDE).
- **How They Were Used**:
  - Scaffolding modular FastAPI architecture and Pydantic validation schemas.
  - Formulating the vectorized Day-of-Year cyclic window calculations in NumPy.
  - Designing the glassmorphic CSS design system and Chart.js dual-axis configurations.
  - Code review and verification of Mann-Kendall test formulas and edge-case guards.

---

## 🔮 What I Would Improve With More Time

1. **Compound Climate Hazards**:
   - Implement **Wet-Bulb Temperature ($TW$)** or Heat Index to measure combined heat and humidity stress.
   - Add Standardized Precipitation Index (SPI) for multi-hazard drought detection.
2. **Spatial Gridded Heatmaps**:
   - Bounding box batch queries with Leaflet geo-choropleth overlays for spatial hazard visualization.
3. **Automated End-to-End Test Suite**:
   - Add Pytest fixtures validating numerical invariance against NOAA ETCCDI benchmark datasets.
