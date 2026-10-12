import React from 'react';
import { Download, Calendar, Flame, Printer } from 'lucide-react';

export default function EventsTable({ data, onDownloadCSV }) {
  if (!data || !data.recent_events) return null;

  const events = data.recent_events;

  return (
    <div className="glass-panel table-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flame size={16} style={{ color: 'var(--accent-fire)' }} />
            <span>Recent Detected Heatwave Events (Detailed Runs)</span>
          </h3>
          <p className="chart-subtitle">
            Showing top {events.length} most recent extreme heat episodes in this region
          </p>
        </div>

        <div className="export-bar">
          <button
            type="button"
            className="btn-secondary"
            onClick={onDownloadCSV}
            title="Download CSV export with metadata"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => window.print()}
            title="Print or Save PDF report"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Duration</th>
              <th>Peak Temp</th>
              <th>Avg Temp</th>
              <th>Cumulative Anomaly</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No heatwave events identified in this timeframe.
                </td>
              </tr>
            ) : (
              events.map((ev, idx) => (
                <tr key={idx}>
                  <td style={{ color: '#f8fafc' }}>{ev.start_date}</td>
                  <td>{ev.end_date}</td>
                  <td>
                    <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>
                      {ev.duration_days} days
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--accent-fire)', fontWeight: 600 }}>
                      {ev.peak_temperature}&deg;C
                    </span>
                  </td>
                  <td>{ev.avg_temperature}&deg;C</td>
                  <td>+{ev.cumulative_anomaly}&deg;C-days</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
