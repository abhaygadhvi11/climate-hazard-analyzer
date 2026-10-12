import React from 'react';
import { Sparkles, Info, ShieldAlert } from 'lucide-react';

export default function InsightBanner({ data }) {
  if (!data) return null;

  const { trend_statistics, baseline_info, grid_id } = data;
  const isSig = trend_statistics.is_statistically_significant;

  return (
    <div className="glass-panel insight-box">
      <div className="insight-header">
        <div className="insight-title">
          <Sparkles size={18} />
          <span>Derived Climate Trend Insight (Domain Science Engine)</span>
        </div>
        <div className="insight-badges">
          <span className={`badge ${isSig ? 'badge-sig' : 'badge-unsig'}`}>
            {isSig ? 'Statistically Significant (p < 0.05)' : 'Not Statistically Significant (p >= 0.05)'}
          </span>
          <span className="badge badge-mk">
            Mann-Kendall Trend: {trend_statistics.mann_kendall_trend.toUpperCase()}
          </span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
            Grid {grid_id}
          </span>
        </div>
      </div>

      <p className="insight-text">
        {trend_statistics.insight_narrative}
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.76rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.6rem' }}>
        <span>
          <strong style={{ color: 'var(--text-secondary)' }}>Baseline Normal:</strong> {baseline_info.baseline_period}
        </span>
        <span>
          <strong style={{ color: 'var(--text-secondary)' }}>Methodology:</strong> Day-of-Year &plusmn;7-day centered window (ETCCDI / WMO TX95p definition)
        </span>
        <span>
          <strong style={{ color: 'var(--text-secondary)' }}>Quality Assurance:</strong> Missing days act as strict run breakers (no synthetic data fabrication)
        </span>
      </div>
    </div>
  );
}
