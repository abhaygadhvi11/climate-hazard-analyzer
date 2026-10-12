import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import axios from 'axios';

export default function LocationSearch({ onLocationSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Free OpenStreetMap Nominatim Geocoding API (no key required)
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchTerm
        )}&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      setResults(res.data || []);
      setIsOpen(true);
    } catch (err) {
      console.warn('Geocoding search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(query);
    }
  };

  const handleSelect = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    onLocationSelect(lat, lon, item.display_name);
    setQuery(item.name || item.display_name.split(',')[0]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="location-search-container" ref={searchRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          className="custom-input"
          placeholder="Search any city or state (e.g. Chicago, Madrid, Gujarat)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length >= 3) {
              handleSearch(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          style={{
            paddingLeft: '38px',
            paddingRight: query ? '36px' : '14px',
            background: 'rgba(15, 23, 42, 0.9)',
          }}
        />
        {loading && (
          <Loader2
            size={16}
            className="spinner"
            style={{ position: 'absolute', right: '12px', color: 'var(--accent-fire)' }}
          />
        )}
        {!loading && query && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '10px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <ul
          className="glass-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 2000,
            maxHeight: '260px',
            overflowY: 'auto',
            listStyle: 'none',
            padding: '4px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            borderColor: 'rgba(255,255,255,0.15)',
          }}
        >
          {results.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(item)}
              style={{
                padding: '0.65rem 0.85rem',
                cursor: 'pointer',
                borderRadius: '6px',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                color: 'var(--text-secondary)',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 87, 34, 0.15)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <MapPin size={14} style={{ color: 'var(--accent-fire)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#f8fafc', display: 'block' }}>
                  {item.name || item.display_name.split(',')[0]}
                </strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {item.display_name}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
