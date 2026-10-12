import React from 'react';
import { Sparkles, ArrowUpRight, ArrowDownRight, Layers, ShieldCheck, Activity } from 'lucide-react';

export default function InsightBanner({ data }) {
  if (!data) return null;

  const { trend_statistics, baseline_info, grid_id } = data;
  const isSig = trend_statistics.is_statistically_significant;
  const pctChange = trend_statistics.percent_change;
  const isUpward = (pctChange !== null && pctChange >= 0) || trend_statistics.slope_events_per_decade >= 0;

  return (
    <div className="glass-panel insight-box" style={{
      background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.08) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(6, 182, 212, 0.05) 100%)',
      border: '1px solid rgba(255, 87, 34, 0.25)',
      borderRadius: '12px',
      padding: '1.4rem 1.6rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <div className="insight-header">
        <div className="insight-title" style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'rgba(255,87,34,0.2)', padding: '5px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
            <Sparkles size={18} style={{ color: '#ff5722' }} />
          </div>
          <span>Derived Climatological Insight</span>
        </div>

        <div className="insight-badges">
          <span className={`badge ${isSig ? 'badge-sig' : 'badge-unsig'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={11} />
            <span>{isSig ? 'Statistically Significant (p < 0.05)' : 'Not Statistically Significant (p >= 0.05)'}</span>
          </span>
          <span className="badge badge-mk">
            Mann-Kendall: {trend_statistics.mann_kendall_trend.toUpperCase()}
          </span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
            Grid Node: {grid_id}
          </span>
        </div>
      </div>

      {/* Narrative Lead */}
      <p className="insight-text" style={{ fontSize: '1.1rem', fontWeight: 500, color: '#f8fafc', lineHeight: 1.65 }}>
        {trend_statistics.insight_narrative}
      </p>

      {/* Comparison Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginTop: '0.25rem' }}>
        <div style={{ background: 'rgba(0,0,0,0.35)', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Initial Decade Average: </span>
          <strong style={{ color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
            {trend_statistics.baseline_decade_mean} events/yr
          </strong>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.35)', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Recent Decade Average: </span>
          <strong style={{ color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
            {trend_statistics.recent_decade_mean} events/yr
          </strong>
        </div>

        {pctChange !== null && (
          <div style={{
            background: isUpward ? 'rgba(255,87,34,0.15)' : 'rgba(16,185,129,0.15)',
            border: `1px solid ${isUpward ? 'rgba(255,87,34,0.3)' : 'rgba(16,185,129,0.3)'}`,
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: isUpward ? '#ff8a65' : '#34d399',
            fontWeight: 600,
          }}>
            {isUpward ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
            <span>Net Shift: {pctChange > 0 ? `+${pctChange}%` : `${pctChange}%`}</span>
          </div>
        )}
      </div>

      {/* Methodology Footer */}
      <div style={{
        display: 'flex',
        gap: '1.75rem',
        flexWrap: 'wrap',
        fontSize: '0.76rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: '0.75rem',
        marginTop: '0.35rem'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <ShieldCheck size={13} style={{ color: '#10b981' }} />
          <span>WMO 1991–2020 Fixed Reference Normal</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Layers size={13} style={{ color: '#06b6d4' }} />
          <span>Day-of-Year &plusmn;7-Day Cyclic Window (ETCCDI standard)</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Activity size={13} style={{ color: '#f59e0b' }} />
          <span>Strict Gap Handling (Zero Synthetic Days)</span>
        </span>
      </div>
    </div>
  );
}
