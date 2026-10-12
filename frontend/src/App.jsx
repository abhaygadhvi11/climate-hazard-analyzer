import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CityPresets from './components/CityPresets';
import MapSelector from './components/MapSelector';
import ControlPanel from './components/ControlPanel';
import KpiMetrics from './components/KpiMetrics';
import InsightBanner from './components/InsightBanner';
import ChartsView from './components/ChartsView';
import EventsTable from './components/EventsTable';
import { fetchHealth, fetchPresets, analyzeHazard, downloadCSV } from './api';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [healthData, setHealthData] = useState(null);
  const [presets, setPresets] = useState([]);
  const [activePresetId, setActivePresetId] = useState('delhi');

  // Input states
  const [selectionMode, setSelectionMode] = useState('point'); // 'point' or 'bounding_box'
  const [latitude, setLatitude] = useState(28.61);
  const [longitude, setLongitude] = useState(77.23);
  const [boundingBox, setBoundingBox] = useState({
    minLat: 27.6,
    maxLat: 29.6,
    minLon: 76.2,
    maxLon: 78.2,
  });

  const [startYear, setStartYear] = useState(1990);
  const [endYear, setEndYear] = useState(2023);
  const [consecutiveDays, setConsecutiveDays] = useState(3);
  const [percentile, setPercentile] = useState(95.0);

  // Execution states
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);

  // Initialize data on mount
  useEffect(() => {
    async function init() {
      const health = await fetchHealth();
      setHealthData(health);

      try {
        const presetList = await fetchPresets();
        setPresets(presetList);
        if (presetList.length > 0) {
          const first = presetList[0];
          setActivePresetId(first.id);
          setLatitude(first.latitude);
          setLongitude(first.longitude);
          runAnalysis(
            first.latitude,
            first.longitude,
            'point',
            null,
            1990,
            2023,
            3,
            95.0
          );
        }
      } catch (err) {
        console.warn('Failed to load presets from backend:', err);
        // Fallback preset
        runAnalysis(28.61, 77.23, 'point', null, 1990, 2023, 3, 95.0);
      }
    }
    init();
  }, []);

  async function runAnalysis(lat, lon, mode, bbox, sYear, eYear, cDays, pct) {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        latitude: lat,
        longitude: lon,
        selection_type: mode,
        bounding_box:
          mode === 'bounding_box' && bbox
            ? {
                min_latitude: bbox.minLat,
                max_latitude: bbox.maxLat,
                min_longitude: bbox.minLon,
                max_longitude: bbox.maxLon,
              }
            : null,
        start_year: sYear,
        end_year: eYear,
        hazard_type: 'heatwave',
        consecutive_days: cDays,
        percentile: pct,
      };

      const res = await analyzeHazard(payload);
      setAnalysisData(res);
      // Refresh health to update cached records count
      const health = await fetchHealth();
      if (health) setHealthData(health);
    } catch (err) {
      console.error('Analysis error:', err);
      const detail = err.response?.data?.detail || err.message || 'Failed to complete climate analysis';
      setError(detail);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectPreset = (city) => {
    setActivePresetId(city.id);
    setSelectionMode('point');
    setLatitude(city.latitude);
    setLongitude(city.longitude);
    runAnalysis(
      city.latitude,
      city.longitude,
      'point',
      null,
      startYear,
      endYear,
      consecutiveDays,
      percentile
    );
  };

  const handleMapLocationChange = (lat, lon) => {
    setActivePresetId(null);
    const roundLat = Math.round(lat * 100) / 100;
    const roundLon = Math.round(lon * 100) / 100;
    setLatitude(roundLat);
    setLongitude(roundLon);

    if (selectionMode === 'bounding_box') {
      // Center bounding box around clicked coordinate
      const updatedBox = {
        minLat: Math.round((roundLat - 1.0) * 10) / 10,
        maxLat: Math.round((roundLat + 1.0) * 10) / 10,
        minLon: Math.round((roundLon - 1.0) * 10) / 10,
        maxLon: Math.round((roundLon + 1.0) * 10) / 10,
      };
      setBoundingBox(updatedBox);
      runAnalysis(
        roundLat,
        roundLon,
        'bounding_box',
        updatedBox,
        startYear,
        endYear,
        consecutiveDays,
        percentile
      );
    } else {
      runAnalysis(
        roundLat,
        roundLon,
        'point',
        null,
        startYear,
        endYear,
        consecutiveDays,
        percentile
      );
    }
  };

  const handleSearchSelect = (lat, lon, displayName) => {
    setActivePresetId(null);
    const roundLat = Math.round(lat * 100) / 100;
    const roundLon = Math.round(lon * 100) / 100;
    setLatitude(roundLat);
    setLongitude(roundLon);

    const updatedBox = {
      minLat: Math.round((roundLat - 1.0) * 10) / 10,
      maxLat: Math.round((roundLat + 1.0) * 10) / 10,
      minLon: Math.round((roundLon - 1.0) * 10) / 10,
      maxLon: Math.round((roundLon + 1.0) * 10) / 10,
    };
    setBoundingBox(updatedBox);

    runAnalysis(
      roundLat,
      roundLon,
      selectionMode,
      updatedBox,
      startYear,
      endYear,
      consecutiveDays,
      percentile
    );
  };

  const handleSubmit = () => {
    runAnalysis(
      latitude,
      longitude,
      selectionMode,
      boundingBox,
      startYear,
      endYear,
      consecutiveDays,
      percentile
    );
  };

  const handleDownloadCSV = async () => {
    if (!analysisData) return;
    try {
      await downloadCSV(analysisData);
    } catch (err) {
      alert('Failed to generate CSV export: ' + err.message);
    }
  };

  return (
    <div className="app-layout">
      <Navbar healthData={healthData} />

      <main className="app-container">
        {/* Preset Hotspots Selection Bar */}
        <CityPresets
          presets={presets}
          activeId={activePresetId}
          onSelectPreset={handleSelectPreset}
        />

        {/* Error notification */}
        {error && (
          <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.1)' }}>
            <AlertCircle size={20} style={{ color: '#ef4444' }} />
            <div>
              <strong style={{ color: '#ef4444' }}>Analysis Request Error:</strong>
              <p style={{ fontSize: '0.85rem', color: '#fca5a5' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Top Control and Map Grid */}
        <section className="top-grid">
          <ControlPanel
            latitude={latitude}
            longitude={longitude}
            selectionMode={selectionMode}
            boundingBox={boundingBox}
            startYear={startYear}
            endYear={endYear}
            consecutiveDays={consecutiveDays}
            percentile={percentile}
            loading={loading}
            onLatitudeChange={setLatitude}
            onLongitudeChange={setLongitude}
            onSelectionModeChange={setSelectionMode}
            onBoundingBoxChange={setBoundingBox}
            onStartYearChange={setStartYear}
            onEndYearChange={setEndYear}
            onConsecutiveDaysChange={setConsecutiveDays}
            onPercentileChange={setPercentile}
            onSubmit={handleSubmit}
          />

          <MapSelector
            latitude={latitude}
            longitude={longitude}
            selectionMode={selectionMode}
            boundingBox={boundingBox}
            onLocationChange={handleMapLocationChange}
            onSearchSelect={handleSearchSelect}
          />
        </section>

        {/* KPI Metrics Summary */}
        <KpiMetrics data={analysisData} />

        {/* Scientific Narrative Insight */}
        <InsightBanner data={analysisData} />

        {/* Interactive Charts */}
        <section className="charts-grid">
          <ChartsView data={analysisData} />
        </section>

        {/* Detailed Events Table */}
        <EventsTable
          data={analysisData}
          onDownloadCSV={handleDownloadCSV}
        />
      </main>
    </div>
  );
}
