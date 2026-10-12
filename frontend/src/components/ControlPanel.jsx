import React, { useState } from 'react';
import { Sliders, Play, Settings2, Calendar, Flame, AlertCircle } from 'lucide-react';

export default function ControlPanel({
  latitude,
  longitude,
  startYear,
  endYear,
  consecutiveDays,
  percentile,
  loading,
  onLatitudeChange,
  onLongitudeChange,
  onStartYearChange,
  onEndYearChange,
  onConsecutiveDaysChange,
  onPercentileChange,
  onSubmit,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const snappedLat = Math.round(latitude / 0.25) * 0.25;
  const snappedLon = Math.round(longitude / 0.25) * 0.25;

  return (
    <div className="glass-panel control-panel">
      <div className="section-label">
        <Sliders size={14} style={{ color: 'var(--accent-fire)' }} />
        <span>Hazard Parameters & Analysis Range</span>
      </div>

      {/* Hazard Type Selection */}
      <div className="form-group">
        <label className="form-label">Hazard Type</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="preset-chip active"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Flame size={14} style={{ color: 'var(--accent-fire)' }} />
            <span>Heatwave (Default)</span>
          </button>
          <button
            type="button"
            className="preset-chip"
            style={{ opacity: 0.4, cursor: 'not-allowed', flex: 1, justifyContent: 'center' }}
            title="Dygnify brief: Scope over polish — A working, well-reasoned heatwave analysis beats a half-finished multi-hazard app"
          >
            <span>Drought</span>
          </button>
        </div>
      </div>

      {/* Coordinates */}
      <div className="input-row">
        <div className="form-group">
          <label className="form-label">Latitude (-90 to 90)</label>
          <input
            type="number"
            step="0.01"
            className="custom-input"
            value={latitude}
            onChange={(e) => onLatitudeChange(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Longitude (-180 to 180)</label>
          <input
            type="number"
            step="0.01"
            className="custom-input"
            value={longitude}
            onChange={(e) => onLongitudeChange(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="grid-snap-hint">
        <span>Target Grid Node: {snappedLat.toFixed(2)}&deg;N, {snappedLon.toFixed(2)}&deg;E</span>
      </div>

      {/* Time Range */}
      <div className="slider-container">
        <div className="slider-header">
          <span className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={13} /> Analysis Time Range
          </span>
          <span className="slider-val">
            {startYear} &ndash; {endYear} ({endYear - startYear + 1} years)
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="range"
            min="1950"
            max="2020"
            value={startYear}
            onChange={(e) => onStartYearChange(parseInt(e.target.value))}
          />
          <input
            type="range"
            min={startYear + 4}
            max="2024"
            value={endYear}
            onChange={(e) => onEndYearChange(parseInt(e.target.value))}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>1950</span>
          <span>Baseline: 1991&ndash;2020</span>
          <span>2024</span>
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: 0
          }}
        >
          <Settings2 size={13} />
          <span>{showAdvanced ? 'Hide Advanced Climate Logic' : 'Adjust Advanced Climate Logic (Percentile & Duration)'}</span>
        </button>

        {showAdvanced && (
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
            <div className="slider-container">
              <div className="slider-header">
                <span className="form-label">Percentile Threshold</span>
                <span className="slider-val">{percentile}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="99"
                step="0.5"
                value={percentile}
                onChange={(e) => onPercentileChange(parseFloat(e.target.value))}
              />
            </div>

            <div className="slider-container">
              <div className="slider-header">
                <span className="form-label">Min Consecutive Days</span>
                <span className="slider-val">{consecutiveDays} days</span>
              </div>
              <input
                type="range"
                min="2"
                max="7"
                value={consecutiveDays}
                onChange={(e) => onConsecutiveDaysChange(parseInt(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="button"
        className="btn-primary"
        onClick={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="spinner"></div>
            <span>Analyzing Climate Records...</span>
          </>
        ) : (
          <>
            <Play size={16} fill="white" />
            <span>Analyze Climate Hazard Trends</span>
          </>
        )}
      </button>
    </div>
  );
}
