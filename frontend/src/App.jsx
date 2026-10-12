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
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [healthData, setHealthData] = useState(null);
  const [presets, setPresets] = useState([]);
  const [activePresetId, setActivePresetId] = useState('delhi');

  // Input states
  const [latitude, setLatitude] = useState(28.61);
  const [longitude, setLongitude] = useState(77.23);
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
          runAnalysis(first.latitude, first.longitude, 1990, 2023, 3, 95.0);
        }
      } catch (err) {
        console.warn('Failed to load presets from backend:', err);
        // Fallback preset
        runAnalysis(28.61, 77.23, 1990, 2023, 3, 95.0);
      }
    }
    init();
  }, []);

  async function runAnalysis(lat, lon, sYear, eYear, cDays, pct) {
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeHazard({
        latitude: lat,
        longitude: lon,
        start_year: sYear,
        end_year: eYear,
        hazard_type: 'heatwave',
        consecutive_days: cDays,
        percentile: pct,
      });
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
    setLatitude(city.latitude);
    setLongitude(city.longitude);
    runAnalysis(city.latitude, city.longitude, startYear, endYear, consecutiveDays, percentile);
  };

  const handleMapLocationChange = (lat, lon) => {
    setActivePresetId(null);
    const roundLat = Math.round(lat * 100) / 100;
    const roundLon = Math.round(lon * 100) / 100;
    setLatitude(roundLat);
    setLongitude(roundLon);
  };

  const handleSubmit = () => {
    runAnalysis(latitude, longitude, startYear, endYear, consecutiveDays, percentile);
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
            startYear={startYear}
            endYear={endYear}
            consecutiveDays={consecutiveDays}
            percentile={percentile}
            loading={loading}
            onLatitudeChange={setLatitude}
            onLongitudeChange={setLongitude}
            onStartYearChange={setStartYear}
            onEndYearChange={setEndYear}
            onConsecutiveDaysChange={setConsecutiveDays}
            onPercentileChange={setPercentile}
            onSubmit={handleSubmit}
          />

          <MapSelector
            latitude={latitude}
            longitude={longitude}
            onLocationChange={handleMapLocationChange}
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
