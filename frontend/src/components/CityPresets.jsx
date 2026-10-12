import React from 'react';
import { Sparkles, MapPin, ThermometerSnowflake } from 'lucide-react';

const CITY_METADATA = {
  delhi: { flag: '🇮🇳', tag: 'Subtropical Heat', temp: '45°C Peak' },
  phoenix: { flag: '🇺🇸', tag: 'Desert Heat Island', temp: '47°C Peak' },
  seville: { flag: '🇪🇸', tag: 'Iberian Heat Hub', temp: '44°C Peak' },
  paris: { flag: '🇫🇷', tag: 'Western Europe', temp: '42°C Peak' },
  sydney: { flag: '🇦🇺', tag: 'Southern Coast', temp: '41°C Peak' },
  tokyo: { flag: '🇯🇵', tag: 'Humid Urban Heat', temp: '39°C Peak' },
};

export default function CityPresets({ presets, activeId, onSelectPreset }) {
  if (!presets || presets.length === 0) return null;

  return (
    <div className="presets-container glass-panel" style={{ padding: '0.9rem 1.25rem', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <div className="section-label">
          <Sparkles size={14} style={{ color: 'var(--accent-amber)' }} />
          <span>Quick Benchmark Hotspots (1-Click Evaluation)</span>
        </div>
        <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
          Click any global hotspot to fly map & analyze instantly
        </span>
      </div>

      <div className="presets-chips">
        {presets.map((city) => {
          const isActive = activeId === city.id;
          const meta = CITY_METADATA[city.id] || { flag: '📍', tag: 'Climate Zone', temp: '' };

          return (
            <button
              key={city.id}
              className={`preset-chip ${isActive ? 'active' : ''}`}
              onClick={() => onSelectPreset(city)}
              title={`${city.name}, ${city.country}: ${city.description}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.55rem 0.95rem',
                borderRadius: '8px',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{meta.flag}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: isActive ? '#ff8a65' : '#f8fafc', fontSize: '0.84rem' }}>
                  {city.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: isActive ? '#ffccbc' : 'var(--text-muted)', display: 'flex', gap: '0.35rem' }}>
                  <span>{meta.tag}</span>
                  {meta.temp && <span style={{ opacity: 0.7 }}>&bull; {meta.temp}</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
