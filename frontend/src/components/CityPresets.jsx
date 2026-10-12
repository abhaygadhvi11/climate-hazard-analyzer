import React from 'react';
import { Sparkles, MapPin, Flame } from 'lucide-react';

// Crisp SVG Vector Flags that work on all Windows, macOS, and Linux browsers
function CountryFlag({ id }) {
  if (id === 'delhi') {
    return (
      <svg width="22" height="15" viewBox="0 0 22 15" style={{ borderRadius: 3, flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
        <rect width="22" height="5" fill="#FF9933" />
        <rect y="5" width="22" height="5" fill="#FFFFFF" />
        <rect y="10" width="22" height="5" fill="#128807" />
        <circle cx="11" cy="7.5" r="2.2" stroke="#000088" strokeWidth="0.6" fill="none" />
      </svg>
    );
  }
  if (id === 'phoenix') {
    return (
      <svg width="22" height="15" viewBox="0 0 22 15" style={{ borderRadius: 3, flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
        <rect width="22" height="15" fill="#B22234" />
        <rect y="2.14" width="22" height="2.14" fill="#FFFFFF" />
        <rect y="6.42" width="22" height="2.14" fill="#FFFFFF" />
        <rect y="10.7" width="22" height="2.14" fill="#FFFFFF" />
        <rect width="9" height="8.5" fill="#3C3B6E" />
        <circle cx="2.5" cy="2.5" r="0.6" fill="#FFFFFF" />
        <circle cx="6.5" cy="2.5" r="0.6" fill="#FFFFFF" />
        <circle cx="4.5" cy="4.5" r="0.6" fill="#FFFFFF" />
        <circle cx="2.5" cy="6.5" r="0.6" fill="#FFFFFF" />
        <circle cx="6.5" cy="6.5" r="0.6" fill="#FFFFFF" />
      </svg>
    );
  }
  if (id === 'seville') {
    return (
      <svg width="22" height="15" viewBox="0 0 22 15" style={{ borderRadius: 3, flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
        <rect width="22" height="3.75" fill="#AA151B" />
        <rect y="3.75" width="22" height="7.5" fill="#F1BF00" />
        <rect y="11.25" width="22" height="3.75" fill="#AA151B" />
      </svg>
    );
  }
  if (id === 'paris') {
    return (
      <svg width="22" height="15" viewBox="0 0 22 15" style={{ borderRadius: 3, flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
        <rect width="7.33" height="15" fill="#0055A4" />
        <rect x="7.33" width="7.34" height="15" fill="#FFFFFF" />
        <rect x="14.67" width="7.33" height="15" fill="#EF4135" />
      </svg>
    );
  }
  if (id === 'sydney') {
    return (
      <svg width="22" height="15" viewBox="0 0 22 15" style={{ borderRadius: 3, flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
        <rect width="22" height="15" fill="#00008B" />
        <rect width="9" height="7.5" fill="#00247D" />
        <path d="M0,0 L9,7.5 M9,0 L0,7.5" stroke="#FFFFFF" strokeWidth="1" />
        <path d="M4.5,0 L4.5,7.5 M0,3.75 L9,3.75" stroke="#CF142B" strokeWidth="1" />
        <circle cx="16" cy="3.5" r="0.7" fill="#FFFFFF" />
        <circle cx="13.5" cy="7.5" r="0.7" fill="#FFFFFF" />
        <circle cx="18.5" cy="7.5" r="0.7" fill="#FFFFFF" />
        <circle cx="16" cy="11.5" r="0.7" fill="#FFFFFF" />
      </svg>
    );
  }
  if (id === 'tokyo') {
    return (
      <svg width="22" height="15" viewBox="0 0 22 15" style={{ borderRadius: 3, flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
        <rect width="22" height="15" fill="#FFFFFF" />
        <circle cx="11" cy="7.5" r="3.8" fill="#BC002D" />
      </svg>
    );
  }
  return <MapPin size={16} style={{ color: 'var(--accent-fire)' }} />;
}

const CITY_METADATA = {
  delhi: { tag: 'Subtropical Extreme', temp: '45°C Peak' },
  phoenix: { tag: 'Desert Heat Island', temp: '47°C Peak' },
  seville: { tag: 'Iberian Hotspot', temp: '44°C Peak' },
  paris: { tag: 'Western Europe', temp: '42°C Peak' },
  sydney: { tag: 'Southern Coast', temp: '41°C Peak' },
  tokyo: { tag: 'Humid Urban Heat', temp: '39°C Peak' },
};

const FALLBACK_PRESETS = [
  { id: 'delhi', name: 'New Delhi', country: 'India', latitude: 28.61, longitude: 77.23, description: 'Subtropical megacity experiencing intense heatwaves.' },
  { id: 'phoenix', name: 'Phoenix, Arizona', country: 'United States', latitude: 33.45, longitude: -112.07, description: 'Sonoran desert urban heat island.' },
  { id: 'seville', name: 'Seville', country: 'Spain', latitude: 37.38, longitude: -5.98, description: 'One of Europe hottest urban centers.' },
  { id: 'paris', name: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35, description: 'Western European capital.' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', latitude: -33.87, longitude: 151.21, description: 'Southern hemisphere coastal region.' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', latitude: 35.68, longitude: 139.69, description: 'Temperate urban heat island.' },
];

export default function CityPresets({ presets, activeId, onSelectPreset }) {
  // Always fallback to reliable list so buttons NEVER disappear
  const list = presets && presets.length > 0 ? presets : FALLBACK_PRESETS;

  return (
    <div className="presets-container glass-panel" style={{ padding: '1rem 1.35rem', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
        <div className="section-label">
          <Sparkles size={14} style={{ color: 'var(--accent-amber)' }} />
          <span>Curated Climate Hotspots (1-Click Evaluation)</span>
        </div>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          Click any global city to fly the map & analyze historical trends
        </span>
      </div>

      <div className="presets-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {list.map((city) => {
          const isActive = activeId === city.id;
          const meta = CITY_METADATA[city.id] || { tag: city.country, temp: '' };

          return (
            <button
              key={city.id}
              className={`preset-chip ${isActive ? 'active' : ''}`}
              onClick={() => onSelectPreset(city)}
              title={`${city.name}, ${city.country}: ${city.description}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                background: isActive ? 'rgba(255, 87, 34, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                border: isActive ? '1px solid var(--accent-fire)' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isActive ? '0 0 16px rgba(255, 87, 34, 0.35)' : 'none',
              }}
            >
              <CountryFlag id={city.id} />
              
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontWeight: 700,
                  color: isActive ? '#ff8a65' : '#f8fafc',
                  fontSize: '0.86rem',
                  lineHeight: 1.2
                }}>
                  {city.name}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: isActive ? '#ffccbc' : 'var(--text-muted)',
                  display: 'flex',
                  gap: '0.35rem',
                  marginTop: '2px'
                }}>
                  <span>{meta.tag}</span>
                  {meta.temp && (
                    <span style={{ color: isActive ? '#ffab91' : '#f59e0b', fontWeight: 600 }}>
                      &bull; {meta.temp}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
