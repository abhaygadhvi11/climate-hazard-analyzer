import React from 'react';
import { Flame, Database, ShieldCheck, ExternalLink } from 'lucide-react';

export default function Navbar({ healthData }) {
  const isConnected = !!healthData;
  const storageName = healthData?.database?.backend_storage || 'Connecting...';

  const apiDocsUrl = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') + '/docs'
    : (typeof window !== 'undefined' && window.location.port === '5173'
        ? 'http://localhost:8000/docs'
        : 'https://climate-hazard-backend-d71p.onrender.com/docs');

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-icon-box">
          <Flame size={24} />
        </div>
        <div>
          <h1 className="brand-title">Climate Hazard Trend Analyzer</h1>
          <p className="brand-subtitle">
            Dygnify Ventures Case Study &bull; Heatwave Trends &bull; WMO 1991–2020 Baseline
          </p>
        </div>
      </div>

      <div className="header-actions">
        <div className="status-badge" title="Active Backend & NoSQL Cache status">
          <span className="status-dot" style={{ backgroundColor: isConnected ? '#10b981' : '#f59e0b' }}></span>
          <Database size={13} style={{ marginLeft: 3 }} />
          <span>{isConnected ? storageName : 'Offline (Local Cache)'}</span>
        </div>

        <a
          href={apiDocsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
          title="Interactive FastAPI Swagger API documentation"
        >
          <span>API Docs</span>
          <ExternalLink size={12} />
        </a>

        <a
          href="https://open-meteo.com/en/docs/historical-weather-api"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
          title="Open-Meteo ERA5 Historical Weather Documentation"
        >
          <span>Open-Meteo ERA5</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </header>
  );
}
