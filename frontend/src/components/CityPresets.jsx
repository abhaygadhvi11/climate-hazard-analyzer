import React from 'react';
import { MapPin, Sparkles } from 'lucide-react';

export default function CityPresets({ presets, activeId, onSelectPreset }) {
  if (!presets || presets.length === 0) return null;

  return (
    <div className="presets-container">
      <div className="section-label">
        <Sparkles size={14} style={{ color: 'var(--accent-amber)' }} />
        <span>Curated Climate Hotspots (1-Click Test)</span>
      </div>
      <div className="presets-chips">
        {presets.map((city) => {
          const isActive = activeId === city.id;
          return (
            <button
              key={city.id}
              className={`preset-chip ${isActive ? 'active' : ''}`}
              onClick={() => onSelectPreset(city)}
              title={`${city.name}, ${city.country}: ${city.description}`}
            >
              <MapPin size={12} style={{ color: isActive ? 'var(--accent-fire)' : 'var(--text-muted)' }} />
              <span>{city.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
