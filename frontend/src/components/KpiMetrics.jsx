import React from 'react';
import { Flame, TrendingUp, TrendingDown, Clock, Thermometer, Database, CheckCircle2 } from 'lucide-react';

export default function KpiMetrics({ data }) {
  if (!data) return null;

  const { trend_statistics, yearly_metrics, baseline_info, cache_hit_years, api_fetched_years, storage_mode } = data;

  const totalEvents = yearly_metrics.reduce((acc, curr) => acc + curr.heatwave_events, 0);
  const totalHeatwaveDays = yearly_metrics.reduce((acc, curr) => acc + curr.total_heatwave_days, 0);
  const avgDuration = totalEvents > 0 ? (totalHeatwaveDays / totalEvents).toFixed(1) : 0;
  const maxRecordedTemp = Math.max(...yearly_metrics.map(m => m.max_temperature || 0));

  const isUpward = trend_statistics.slope_events_per_decade >= 0;
  const isSig = trend_statistics.is_statistically_significant;

  return (
    <div className="kpi-grid">
      {/* Total Events */}
      <div className="glass-panel kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Total Heatwave Events</span>
          <Flame size={16} className="kpi-icon" style={{ color: 'var(--accent-fire)' }} />
        </div>
        <div className="kpi-value">{totalEvents}</div>
        <div className="kpi-subtext">
          <span>{totalHeatwaveDays} cumulative heatwave days</span>
        </div>
      </div>

      {/* Decadal Trend Rate */}
      <div className="glass-panel kpi-card amber">
        <div className="kpi-header">
          <span className="kpi-title">Decadal Trend Rate</span>
          {isUpward ? (
            <TrendingUp size={16} className="kpi-icon" style={{ color: 'var(--accent-amber)' }} />
          ) : (
            <TrendingDown size={16} className="kpi-icon" style={{ color: 'var(--accent-emerald)' }} />
          )}
        </div>
        <div className="kpi-value" style={{ color: isUpward ? '#f59e0b' : '#10b981' }}>
          {isUpward ? '+' : ''}{trend_statistics.slope_events_per_decade}
          <span style={{ fontSize: '0.85rem', fontWeight: 500, marginLeft: 4 }}>ev/dec</span>
        </div>
        <div className="kpi-subtext">
          <span>Regression slope (OLS)</span>
        </div>
      </div>

      {/* Statistical Significance */}
      <div className="glass-panel kpi-card cyan">
        <div className="kpi-header">
          <span className="kpi-title">Significance & Test</span>
          <CheckCircle2 size={16} className="kpi-icon" style={{ color: 'var(--accent-cyan)' }} />
        </div>
        <div className="kpi-value" style={{ fontSize: '1.5rem', color: isSig ? '#34d399' : '#fbbf24' }}>
          {isSig ? 'p < 0.05' : `p = ${trend_statistics.p_value.toFixed(3)}`}
        </div>
        <div className="kpi-subtext">
          <span className={`badge ${isSig ? 'badge-sig' : 'badge-unsig'}`}>
            {isSig ? 'Statistically Significant' : 'Not Significant'}
          </span>
          <span className="badge badge-mk" style={{ marginLeft: 4 }}>
            MK: {trend_statistics.mann_kendall_trend}
          </span>
        </div>
      </div>

      {/* Peak Historical Temp */}
      <div className="glass-panel kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Peak Temperature</span>
          <Thermometer size={16} className="kpi-icon" style={{ color: 'var(--accent-fire)' }} />
        </div>
        <div className="kpi-value">{maxRecordedTemp}&deg;C</div>
        <div className="kpi-subtext">
          <span>95th Pct Threshold: {baseline_info.overall_p95_tmax}&deg;C</span>
        </div>
      </div>

      {/* Average Event Duration */}
      <div className="glass-panel kpi-card emerald">
        <div className="kpi-header">
          <span className="kpi-title">Average Duration</span>
          <Clock size={16} className="kpi-icon" style={{ color: 'var(--accent-emerald)' }} />
        </div>
        <div className="kpi-value">{avgDuration}<span style={{ fontSize: '0.85rem', fontWeight: 500, marginLeft: 4 }}>days</span></div>
        <div className="kpi-subtext">
          <span>Across all detected runs</span>
        </div>
      </div>

      {/* NoSQL Cache Performance */}
      <div className="glass-panel kpi-card cyan">
        <div className="kpi-header">
          <span className="kpi-title">NoSQL Cache Engine</span>
          <Database size={16} className="kpi-icon" style={{ color: 'var(--accent-cyan)' }} />
        </div>
        <div className="kpi-value" style={{ fontSize: '1.5rem' }}>
          {cache_hit_years} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>cached / {api_fetched_years} fetched</span>
        </div>
        <div className="kpi-subtext">
          <span>Driver: {storage_mode.toUpperCase()} document store</span>
        </div>
      </div>
    </div>
  );
}
