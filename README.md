# Climate Hazard Trend Analyzer 🌍🔥

> **Full-Stack Developer Case Study Submission** for **Dygnify Ventures Pvt Ltd**  
> An end-to-end web application that ingests long-term historical weather reanalysis records and visualizes climate hazard trends (specifically heatwaves), built strictly on domain-standard climatological definitions.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://climate-hazard-analyzer-app2.vercel.app/)
[![Backend API](https://img.shields.io/badge/API_Server-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://climate-hazard-backend-d71p.onrender.com)
[![Swagger Docs](https://img.shields.io/badge/API_Docs-Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://climate-hazard-backend-d71p.onrender.com/docs)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://climate-hazard-backend-d71p.onrender.com/api/health)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

---

## 🌐 Live Production Deployments

| Component | Provider | Live URL | Status |
| :--- | :--- | :--- | :---: |
| **Frontend Dashboard** | **Vercel** | [https://climate-hazard-analyzer-app2.vercel.app/](https://climate-hazard-analyzer-app2.vercel.app/) | ![Operational](https://img.shields.io/badge/Active-10b981?style=flat-square) |
| **FastAPI Backend API** | **Render** | [https://climate-hazard-backend-d71p.onrender.com](https://climate-hazard-backend-d71p.onrender.com) | ![Operational](https://img.shields.io/badge/Active-10b981?style=flat-square) |
| **Interactive API Docs** | **Swagger UI** | [https://climate-hazard-backend-d71p.onrender.com/docs](https://climate-hazard-backend-d71p.onrender.com/docs) | ![Operational](https://img.shields.io/badge/Active-10b981?style=flat-square) |
| **NoSQL Database** | **MongoDB Atlas** | `climate-cluster` (Cloud M0 Cluster) | ![Operational](https://img.shields.io/badge/Connected-10b981?style=flat-square) |
| **Source Code** | **GitHub** | [https://github.com/abhaygadhvi11/climate-hazard-analyzer](https://github.com/abhaygadhvi11/climate-hazard-analyzer) | ![Open Source](https://img.shields.io/badge/Public-blue?style=flat-square) |

---

## 📑 Table of Contents
1. [Executive Summary & Evaluation Alignment](#-executive-summary--evaluation-alignment)
2. [Domain-Specific Climate Hazard Logic](#-domain-specific-climate-hazard-logic)
3. [Full Feature Overview](#-full-feature-overview)
4. [System Architecture](#-system-architecture)
5. [API Reference](#-api-reference)
6. [Quickstart & Local Installation](#-quickstart--local-installation)
7. [Verification & Testing](#-verification--testing)
8. [Assumptions Made](#-assumptions-made)
9. [Bonus Challenges Completed](#-bonus-challenges-completed)
10. [AI Disclosure](#-ai-disclosure-as-required-by-dygnify)
11. [Future Enhancements](#-future-enhancements)

---

## 🎯 Executive Summary & Evaluation Alignment

This application was engineered according to the evaluation rubric set forth in the Dygnify Ventures case study:

| Evaluation Dimension | Weight | Implementation in this Repository |
| :--- | :---: | :--- |
| **Data Handling** | **20%** | Snaps coordinates to the **0.25° ERA5 grid**; implements strict gap-handling (never interpolating across missing days); flags years with $>10\%$ missing data; chunked per-year caching prevents redundant API calls. |
| **Climate Domain Logic** | **20%** | Standardized on **WMO 1991–2020** 30-year normal; calculates Day-of-Year (DOY) $P_{95}$ with a **$\pm 7$-day cyclic window** ($15$-day window, $\approx 450$ samples); detects streaks $\ge 3$ consecutive days. |
| **Backend Architecture** | **20%** | Modular FastAPI backend with Pydantic v2 validation schemas, dependency injection, and a dual-driver NoSQL cache (**MongoDB Atlas** + auto-fallback to embedded **TinyDB** document store). |
| **Frontend Architecture** | **15%** | Responsive React 18 dashboard built with Vite, Leaflet interactive map, Chart.js dual-axis visualization, and ambient dark glassmorphism. |
| **Critical Thinking** | **10%** | Zero-division guard for 0-event baseline decades; sample size adequacy checks ($N \ge 3$ events); dual statistical evaluation (OLS regression + Mann-Kendall test). |
| **Security & Performance** | **15%** | `SlowAPI` IP-based rate limiting (60 req/min); coordinate bounding (`[-90, 90]` lat, `[-180, 180]` lon); sub-500ms cache hit response times. |
| **Bonus Challenges** | **+10 pts** | **1.** Interactive Leaflet Map with City/State Geocoding & Bounding Box Mode<br>**2.** Scientific CSV Export with detailed metadata headers<br>**3.** Non-parametric Mann-Kendall trend test<br>**4.** 5-Year Centered Rolling Average overlay |

---

## 🔬 Domain-Specific Climate Hazard Logic

### 1. Climatological Baseline: WMO 1991–2020 Normal
Computing percentiles dynamically over a user-selected time range causes baseline drift: in warming regions, a recent threshold would be artificially higher, partially masking the very warming trend being analyzed.  
* **Standard Implemented**: The reference baseline is fixed to the international **World Meteorological Organization (WMO) 1991–2020** 30-year climatological normal.

### 2. Day-of-Year (DOY) Centered Rolling Window
A single static threshold (e.g., 95th percentile across all 365 calendar days) only captures peak summer days and renders winter and spring unseasonable heatwaves completely invisible.
* **Algorithm**: For each calendar day $d \in [1..365]$, we construct a **$\pm 7$-day cyclic window** (a 15-day window) across all 30 baseline years (sample size $\approx 15 \times 30 = 450$ observations).
* A day in year $y$ on calendar day $d$ is considered an extreme heat day if:
  $$T_{\max}(y, d) \ge P_{95}(\text{DOY } d)$$

### 3. Heatwave Event Definition & Run Detection
* **Consecutive Streak**: An event is logged when daily maximum temperature meets or exceeds $P_{95}(\text{DOY})$ for **at least 3 consecutive days** ($L \ge 3$).
* **Indicators Computed**:
  - **Annual Frequency**: Total distinct heatwave events per year.
  - **Annual Duration**: Total cumulative heatwave days per year.
  - **Cumulative Severity (Degree-Days)**: $\sum (T_{\max} - P_{95})$ across all heatwave days.
  - **Peak Temperature**: Maximum temperature recorded during heatwave runs.

### 4. Strict Missing Data & Gap Handling
* **No Synthetic Interpolation**: For run-length hazards, interpolating across missing dates can fabricate false heatwave days or falsely merge two distinct events. Missing days (`NaN`) act as **strict run breakers**.
* **Data Completeness Threshold**: Years with $>10\%$ missing observations (>36 days) are marked as `INSUFFICIENT` and excluded from linear regression.

### 5. Statistical Rigor & Trend Detection
* **Ordinary Least Squares (OLS) Regression**: Calculates slope ($\Delta\text{events/decade}$), $R^2$, and two-sided $p$-value.
* **5-Year Centered Rolling Average**: Smooths high-frequency interannual variability (e.g., ENSO cycles) alongside linear regression.
* **Mann-Kendall Test**: A non-parametric rank-based test used by climate scientists to determine monotonic trends without assuming a normal distribution.
* **Honest Insight Generation**:
  - **Zero Initial Decade Guard**: If initial decade average is 0, outputs: *"increased from 0 to k events/decade"* rather than dividing by zero.
  - **Sample Size Guard**: If total events are $< 3$, states: *"Insufficient heatwave events to establish a percentage trend."*
  - **Significance Flag**: Reports whether $p < 0.05$ (statistically significant) or $p \ge 0.05$ (upward/downward tendency without statistical significance).

---

## 🌟 Full Feature Overview

### 🗺️ Interactive Region Selection (Leaflet Map)
- **Basemap**: High-contrast Esri World Dark Gray Base with OpenStreetMap fallback.
- **City & State Search Bar**: Real-time location search powered by OpenStreetMap Nominatim geocoding (search for any city, state, or region on Earth without API keys).
- **Coordinate Snapping**: Automatically snaps clicked or searched locations to the nearest 0.25° ERA5 grid node.
- **Spatial Mode Selector**:
  - **Point Coordinate Mode**: Direct pin-point analysis.
  - **Custom Lat-Lon Box Mode**: Define geographic boundaries (`Min Lat`, `Max Lat`, `Min Lon`, `Max Lon`) with a live interactive dashed rectangle overlay on the map.

### ⚡ 1-Click Curated Hotspots
- Quick-test buttons for key climate hotspots: **New Delhi**, **Phoenix**, **Seville**, **Paris**, **Sydney**, and **Tokyo**.
- Rendered with **crisp embedded SVG vector flags** that display consistently across Windows, macOS, and Linux (bypassing Windows emoji font limitations).
- Shows instant climate zone badges and historical peak temperatures.

### 📊 KPI Cards & Real-Time Intelligence
- **Ambient Glassmorphism**: Glowing themed cards for Total Events, Decadal Trend Rate, Statistical Confidence, Peak Temperature, Average Duration, and NoSQL Cache efficiency.
- **Scientific Intelligence Banner**: Summarizes initial decade vs. recent decade comparison with net % shift and statistical test results.

### 📈 Interactive Chart.js Visualizations
- **Hazard Frequency & Trends Chart**: Dual-axis bar and line chart with interactive toggles for:
  - Annual Event Frequency bars
  - OLS Linear Regression Trend line
  - 5-Year Centered Rolling Average curve
- **Seasonal Threshold Curve**: Visualizes the 365-day DOY threshold curve to illustrate why static percentiles fail.

### 📋 Detailed Events Table & CSV Export
- Complete historical record of every individual heatwave episode.
- Color-coded temperature intensity badges ($\ge 45^\circ\text{C}$ Crimson, $40-44.9^\circ\text{C}$ Flame Orange, $<40^\circ\text{C}$ Amber).
- Duration progress bars and cumulative degree anomalies.
- **Export CSV Button**: Generates a standard CSV with full climatological metadata headers (coordinates, grid ID, baseline period, P95 values).

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE NETWORK                             │
│                     (React 18 Dashboard - Vite)                        │
│  [Nominatim Search]  [Leaflet Map / Bounding Box]  [Hotspot Presets]   │
│  [KPI Metric Cards]  [Chart.js Frequency & Trends] [Events Table / CSV]│
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS (Encrypted API Calls)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        RENDER CLOUD WEB SERVICE                        │
│                        (FastAPI Python 3.12 Engine)                    │
│  • SlowAPI Rate Limiting (60 req/min)                                  │
│  • Pydantic Input Validation & Sanitization                            │
│  • Coordinate Snapping to 0.25° ERA5 Grid                              │
└────────────────────────────────────────────────────────────────────────┘
                    │                                │
          Cache Miss│                      Cache Hit │ (Sub-50ms)
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│        OPEN-METEO ARCHIVE API        │  │      MONGODB ATLAS CLOUD     │
│  • Global ERA5 Reanalysis            │  │  • Cloud M0 NoSQL Cluster    │
│  • Batched multi-year chunks         │  │  • Persistent cache          │
│  • Zero API key friction             │  │  • Keyed by (grid_id, year)  │
└──────────────────────────────────────┘  └──────────────────────────────┘
                    │                                ▲
                    └────────► Stores cleaned data ──┘
```

---

## 📡 API Reference

Interactive Swagger documentation is available live at **[https://climate-hazard-backend-d71p.onrender.com/docs](https://climate-hazard-backend-d71p.onrender.com/docs)**.

### 1. `POST /api/analyze`
Core hazard analysis endpoint.

**Request Payload**:
```json
{
  "latitude": 28.61,
  "longitude": 77.23,
  "start_year": 1990,
  "end_year": 2023,
  "hazard_type": "heatwave",
  "consecutive_days": 3,
  "percentile": 95.0,
  "is_bounding_box": false,
  "min_lat": null,
  "max_lat": null,
  "min_lon": null,
  "max_lon": null
}
```

**Response Payload**:
```json
{
  "grid_id": "28.50_77.25",
  "storage_mode": "mongodb",
  "cache_hit_years": 34,
  "api_fetched_years": 0,
  "baseline_info": {
    "baseline_period": "1991-2020",
    "overall_p95_tmax": 41.1,
    "method": "WMO standard 30-year normal with DOY +/- 7-day cyclic window"
  },
  "trend_statistics": {
    "slope_per_decade": 0.85,
    "r_squared": 0.241,
    "p_value": 0.012,
    "is_significant": true,
    "mann_kendall_trend": "increasing",
    "mann_kendall_p": 0.009,
    "percent_change": 42.8,
    "insight_narrative": "In this region, annual heatwave frequency has increased by 42.8%..."
  },
  "yearly_metrics": [ ... ],
  "events": [ ... ],
  "doy_thresholds": [ ... ]
}
```

### 2. `GET /api/presets`
Returns curated climate hotspots with country flags, climate zones, and coordinates.

### 3. `POST /api/export/csv`
Accepts `AnalyzeResponse` and streams a formatted CSV with climatological metadata headers.

### 4. `GET /api/health`
Health check endpoint reporting server status, storage driver in use (`MongoDB Atlas`), and WMO baseline configuration.

---

## 🚀 Quickstart & Local Installation

### Prerequisites
- **Python 3.11+** (Python 3.12 recommended)
- **Node.js 18+** & **npm**

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

# Start FastAPI server
python run.py
# Server running at: http://localhost:8000
# Interactive Swagger docs: http://localhost:8000/docs
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
# Dashboard running at: http://localhost:5173
```

---

## 🧪 Verification & Testing

### Run Backend Integration & Cache Test:
```bash
cd backend
.\venv\Scripts\python.exe test_backend.py
```
*Validates Open-Meteo ingestion, DOY baseline calculation, OLS regression, Mann-Kendall statistics, and confirms sub-500ms cache hit retrieval.*

### Run Frontend Production Build:
```bash
cd frontend
npm run build
```
*Validates TypeScript/JSX compilation, CSS bundling, and zero syntax errors.*

---

## 🧠 Assumptions Made

1. **Daily Maximum Temperature ($T_{\max}$) as the Primary Heat Metric**:
   - $T_{\max}$ is the internationally accepted standard indicator for daytime heat stress and human thermal health risks.
2. **Fixed Climatological Baseline (1991–2020)**:
   - Evaluated against the WMO 30-year normal rather than dynamic user-selected ranges to prevent baseline inflation and warming cancellation.
3. **Strict Gap Treatment**:
   - For consecutive-day events, gaps are treated as run breakers without linear interpolation to prevent synthetic event fabrication.
4. **Spatial Granularity**:
   - Coordinates are snapped to the 0.25° (~25 km) ERA5 grid resolution, optimizing cache hit efficiency while matching the underlying meteorological model precision.

---

## 🏆 Bonus Challenges Completed

- [x] **Interactive Map UI for Region Selection**:
  - Integrated Leaflet map with dark theme.
  - **OpenStreetMap Nominatim City/State Search Bar** for global address geocoding.
  - **Point Coordinate vs. Custom Lat-Lon Bounding Box** with visual map overlay.
- [x] **Scientific Data Export**:
  - One-click CSV export with climatological metadata headers and individual heatwave run records.
  - Printable layout for instant PDF generation.
- [x] **Advanced Trend Detection**:
  - **Ordinary Least Squares (OLS) Regression** with decadal slope rate and $p$-value.
  - **5-Year Centered Rolling Average** curve overlay.
  - **Non-Parametric Mann-Kendall Test** evaluating monotonic climate trends without distributional assumptions.

---

## 🤖 AI Disclosure (As Required by Dygnify)

- **AI Tools Used**: Google Gemini (via Antigravity IDE).
- **Application & Scope**:
  - Architected modular FastAPI backend and Pydantic validation schemas.
  - Vectorized Day-of-Year cyclic rolling window percentile calculation using NumPy.
  - Designed the dark glassmorphic CSS design system and Chart.js dual-axis configurations.
  - Code review and verification of statistical formulas (Mann-Kendall test, OLS regression, edge-case guards).

---

## 🔮 Future Enhancements

1. **Compound Hazards (Heat + Humidity)**:
   - Compute **Wet-Bulb Temperature ($TW$)** or NOAA Heat Index to quantify lethal heat-stress thresholds.
2. **Drought & Compound Aridity**:
   - Integrate Standardized Precipitation Index (SPI) for compound heat-drought hazard analysis.
3. **Spatial Gridded Choropleth**:
   - Multi-grid parallel ingestion rendering spatial heatwave frequency heatmaps across states/countries.
