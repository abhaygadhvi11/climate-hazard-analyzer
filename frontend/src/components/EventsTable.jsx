import React from 'react';
import { Download, Calendar, Flame, Printer, Clock, Thermometer } from 'lucide-react';

function getTempBadgeStyle(temp) {
  if (temp >= 45) {
    return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.35)', color: '#f87171' };
  } else if (temp >= 40) {
    return { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.35)', color: '#fb923c' };
  } else {
    return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)', color: '#fbbf24' };
  }
}

export default function EventsTable({ data, onDownloadCSV }) {
  if (!data || !data.recent_events) return null;

  const events = data.recent_events;
  const maxDuration = events.length > 0 ? Math.max(...events.map(e => e.duration_days)) : 10;

  return (
    <div className="glass-panel table-panel" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '1.05rem' }}>
            <div style={{ background: 'rgba(255,87,34,0.15)', padding: '5px', borderRadius: '6px' }}>
              <Flame size={16} style={{ color: 'var(--accent-fire)' }} />
            </div>
            <span>Recent Detected Heatwave Events (Detailed Episodes)</span>
          </h3>
          <p className="chart-subtitle">
            Showing individual 3+ day consecutive heat episodes above the DOY 95th percentile
          </p>
        </div>

        <div className="export-bar">
          <button
            type="button"
            className="btn-secondary"
            onClick={onDownloadCSV}
            title="Download complete dataset as CSV with scientific metadata"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Download size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Export CSV Dataset</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => window.print()}
            title="Print or export PDF report"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Printer size={14} style={{ color: 'var(--accent-amber)' }} />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Event Duration</th>
              <th>Peak Temperature</th>
              <th>Average Temp</th>
              <th>Cumulative Heat Anomaly</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                  No heatwave events identified in this timeframe.
                </td>
              </tr>
            ) : (
              events.map((ev, idx) => {
                const tempStyle = getTempBadgeStyle(ev.peak_temperature);
                const durationPct = Math.min(100, (ev.duration_days / maxDuration) * 100);

                return (
                  <tr key={idx}>
                    <td style={{ color: '#f8fafc', fontWeight: 500 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                        {ev.start_date}
                      </span>
                    </td>
                    <td>{ev.end_date}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#f8fafc', fontWeight: 600, minWidth: '46px' }}>
                          {ev.duration_days} days
                        </span>
                        <div style={{ width: '60px', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${durationPct}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ff5722)', borderRadius: '3px' }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        background: tempStyle.bg,
                        border: `1px solid ${tempStyle.border}`,
                        color: tempStyle.color,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}>
                        <Thermometer size={12} />
                        {ev.peak_temperature}&deg;C
                      </span>
                    </td>
                    <td>{ev.avg_temperature}&deg;C</td>
                    <td>
                      <span style={{ color: '#67e8f9', fontWeight: 500 }}>
                        +{ev.cumulative_anomaly}&deg;C-days
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
