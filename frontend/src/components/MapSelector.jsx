import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Compass, Crosshair } from 'lucide-react';

// Fix Leaflet's default marker icon path issue in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom fire marker icon
const fireIcon = new L.DivIcon({
  className: 'custom-map-pin',
  html: `<div style="
    width: 28px;
    height: 28px;
    background: radial-gradient(circle, #ff5722 0%, #d84315 100%);
    border: 2px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 0 16px rgba(255, 87, 34, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
  ">🔥</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Helper component to center map when coordinates change
function RecenterMap({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], map.getZoom(), { duration: 1.2 });
  }, [lat, lon, map]);
  return null;
}

// Click handler component
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapSelector({ latitude, longitude, onLocationChange }) {
  const [tileMode, setTileMode] = React.useState('dark'); // 'dark' (Esri) or 'osm' (OpenStreetMap)
  const snappedLat = Math.round(latitude / 0.25) * 0.25;
  const snappedLon = Math.round(longitude / 0.25) * 0.25;

  return (
    <div className="glass-panel map-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div className="section-label">
          <Compass size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>Interactive Region Selector (Leaflet)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Tile Layer Switcher */}
          <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.3)', padding: '2px', borderRadius: '4px' }}>
            <button
              type="button"
              onClick={() => setTileMode('dark')}
              className={`preset-chip ${tileMode === 'dark' ? 'active' : ''}`}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
            >
              Dark Canvas
            </button>
            <button
              type="button"
              onClick={() => setTileMode('osm')}
              className={`preset-chip ${tileMode === 'osm' ? 'active' : ''}`}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
            >
              Street Map
            </button>
          </div>
          <div className="grid-snap-hint">
            <Crosshair size={12} />
            <span>Grid: {snappedLat.toFixed(2)}°, {snappedLon.toFixed(2)}°</span>
          </div>
        </div>
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={[latitude, longitude]}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          {tileMode === 'dark' ? (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}
          <Marker position={[latitude, longitude]} icon={fireIcon}>
            <Popup>
              <div style={{ color: '#090d16', padding: '2px' }}>
                <strong>Selected Location</strong>
                <br />
                Lat: {latitude.toFixed(2)}&deg;
                <br />
                Lon: {longitude.toFixed(2)}&deg;
                <br />
                <span style={{ fontSize: '0.75rem', color: '#ff5722' }}>
                  Grid node: {snappedLat.toFixed(2)}&deg;, {snappedLon.toFixed(2)}&deg;
                </span>
              </div>
            </Popup>
          </Marker>
          <RecenterMap lat={latitude} lon={longitude} />
          <MapClickHandler onLocationSelect={onLocationChange} />
        </MapContainer>
      </div>
      <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
        Click anywhere on the globe to select a region. Coordinates snap automatically to the nearest 0.25&deg; (~25 km) grid cell.
      </p>
    </div>
  );
}
