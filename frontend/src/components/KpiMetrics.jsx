import React from 'react';
import { Flame, TrendingUp, TrendingDown, Clock, Thermometer, Database, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

export default function KpiMetrics({ data }) {
  if (!data) return null;

  const { trend_statistics, yearly_metrics, baseline_info, cache_hit_years, api_fetched_years, storage_mode } = data;

  const totalEvents = yearly_metrics.reduce((acc, curr) => acc + curr.heatwave_events, 0);
  const totalHeatwaveDays = yearly_metrics.reduce((acc, curr) => acc + curr.total_heatwave_days, 0);
  const avgDuration = totalEvents > 0 ? (totalHeatwaveDays / totalEvents).toFixed(1) : 0;
  const maxRecordedTemp = Math.max(...yearly_metrics.map(m => m.max_temperature || 0));

  const isUpward = trend_statistics.slope_events_per_decade >= 0;
  const isSig = trend_statistics.is_statistically_significant;
  const pctChange = trend_statistics.percent_change;

  return (
    <div className="kpi-grid">
      {/* 1. Total Heatwave Events */}
      <div className="glass-panel kpi-card" style={{
        background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.08) 0%, rgba(17, 24, 39, 0.8) 100%)',
        borderColor: 'rgba(255, 87, 34, 0.25)',
      }}>
        <div className="kpi-header">
          <span className="kpi-title" style={{ color: '#ff8a65' }}>Total Heatwaves</span>
          <div style={{ background: 'rgba(255,87,34,0.15)', padding: '5px', borderRadius: '6px' }}>
            <Flame size={18} style={{ color: '#ff5722' }} />
          </div>
        </div>
        <div className="kpi-value">
          {totalEvents}
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '6px' }}>
            events
          </span>
        </div>
        <div className="kpi-subtext">
          <span style={{ color: '#ffccbc' }}>{totalHeatwaveDays} total extreme heat days</span>
          <span style={{ opacity: 0.6 }}>&bull; L &ge; 3 days</span>
        </div>
      </div>

      {/* 2. Decadal Trend Rate */}
      <div className="glass-panel kpi-card amber" style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(17, 24, 39, 0.8) 100%)',
        borderColor: 'rgba(245, 158, 11, 0.25)',
      }}>
        <div className="kpi-header">
          <span className="kpi-title" style={{ color: '#fbbf24' }}>Decadal Trend Rate</span>
          <div style={{ background: 'rgba(245,158,11,0.15)', padding: '5px', borderRadius: '6px' }}>
            {isUpward ? (
              <TrendingUp size={18} style={{ color: '#f59e0b' }} />
            ) : (
              <TrendingDown size={18} style={{ color: '#10b981' }} />
            )}
          </div>
        </div>
        <div className="kpi-value" style={{ color: isUpward ? '#f59e0b' : '#10b981' }}>
          {isUpward ? '+' : ''}{trend_statistics.slope_events_per_decade}
          <span style={{ fontSize: '0.85rem', fontWeight: 500, marginLeft: '4px', color: 'var(--text-muted)' }}>
            events/decade
          </span>
        </div>
        <div className="kpi-subtext">
          <span>OLS Slope &bull; R&sup2; = {trend_statistics.r_squared}</span>
        </div>
      </div>

      {/* 3. Statistical Confidence & Mann-Kendall */}
      <div className="glass-panel kpi-card cyan" style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(17, 24, 39, 0.8) 100%)',
        borderColor: 'rgba(6, 182, 212, 0.25)',
      }}>
        <div className="kpi-header">
          <span className="kpi-title" style={{ color: '#67e8f9' }}>Statistical Confidence</span>
          <div style={{ background: 'rgba(6,182,212,0.15)', padding: '5px', borderRadius: '6px' }}>
            {isSig ? (
              <CheckCircle2 size={18} style={{ color: '#10b981' }} />
            ) : (
              <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
            )}
          </div>
        </div>
        <div className="kpi-value" style={{ color: isSig ? '#34d399' : '#fbbf24' }}>
          p = {trend_statistics.p_value.toFixed(3)}
        </div>
        <div className="kpi-subtext" style={{ flexWrap: 'wrap', gap: '0.35rem' }}>
          <span className={`badge ${isSig ? 'badge-sig' : 'badge-unsig'}`}>
            {isSig ? 'Significant (p < 0.05)' : 'Not Significant'}
          </span>
          <span className="badge badge-mk">
            MK: {trend_statistics.mann_kendall_trend}
          </span>
        </div>
      </div>

      {/* 4. Peak Historical Temperature */}
      <div className="glass-panel kpi-card" style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(17, 24, 39, 0.8) 100%)',
        borderColor: 'rgba(239, 68, 68, 0.25)',
      }}>
        <div className="kpi-header">
          <span className="kpi-title" style={{ color: '#fca5a5' }}>Peak Temperature</span>
          <div style={{ background: 'rgba(239,68,68,0.15)', padding: '5px', borderRadius: '6px' }}>
            <Thermometer size={18} style={{ color: '#ef4444' }} />
          </div>
        </div>
        <div className="kpi-value" style={{ color: '#ff6b6b' }}>
          {maxRecordedTemp}&deg;C
        </div>
        <div className="kpi-subtext">
          <span>95th Pct Threshold: <strong>{baseline_info.overall_p95_tmax}&deg;C</strong></span>
        </div>
      </div>

      {/* 5. Average Event Duration */}
      <div className="glass-panel kpi-card emerald" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(17, 24, 39, 0.8) 100%)',
        borderColor: 'rgba(16, 185, 129, 0.25)',
      }}>
        <div className="kpi-header">
          <span className="kpi-title" style={{ color: '#6ee7b7' }}>Avg Event Duration</span>
          <div style={{ background: 'rgba(16,185,129,0.15)', padding: '5px', borderRadius: '6px' }}>
            <Clock size={18} style={{ color: '#10b981' }} />
          </div>
        </div>
        <div className="kpi-value" style={{ color: '#34d399' }}>
          {avgDuration}
          <span style={{ fontSize: '0.85rem', fontWeight: 500, marginLeft: '4px', color: 'var(--text-muted)' }}>
            days/event
          </span>
        </div>
        <div className="kpi-subtext">
          <span>Across all {totalEvents} detected episodes</span>
        </div>
      </div>

      {/* 6. NoSQL Storage & Speed */}
      <div className="glass-panel kpi-card cyan" style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(17, 24, 39, 0.8) 100%)',
        borderColor: 'rgba(139, 92, 246, 0.25)',
      }}>
        <div className="kpi-header">
          <span className="kpi-title" style={{ color: '#c4b5fd' }}>NoSQL Cache Engine</span>
          <div style={{ background: 'rgba(139,92,246,0.15)', padding: '5px', borderRadius: '6px' }}>
            <Database size={18} style={{ color: '#a78bfa' }} />
          </div>
        </div>
        <div className="kpi-value" style={{ color: '#c4b5fd', fontSize: '1.6rem' }}>
          {cache_hit_years} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>hit / {api_fetched_years} fetched</span>
        </div>
        <div className="kpi-subtext">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#a78bfa' }}>
            <Zap size={12} /> {storage_mode === 'mongodb' ? 'MongoDB Atlas Cloud' : 'Fast Local NoSQL'}
          </span>
        </div>
      </div>
    </div>
  );
}
