import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { BarChart3, TrendingUp, Calendar, Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ChartsView({ data }) {
  const [activeTab, setActiveTab] = useState('frequency');

  if (!data || !data.yearly_metrics) return null;

  const { yearly_metrics, trend_statistics, baseline_info } = data;
  const years = yearly_metrics.map(m => m.year);
  const events = yearly_metrics.map(m => m.heatwave_events);
  const heatwaveDays = yearly_metrics.map(m => m.total_heatwave_days);
  const severity = yearly_metrics.map(m => m.cumulative_severity);

  // Compute linear regression points for trend line overlay
  const n = years.length;
  const x0 = years[0];
  const meanY = trend_statistics.baseline_decade_mean;
  const slopePerYear = trend_statistics.slope_events_per_decade / 10.0;
  // Trend line points: y = a + b * (year - year_0)
  const avgYear = (years[0] + years[n - 1]) / 2.0;
  const avgEvents = events.reduce((a, b) => a + b, 0) / n;
  const trendLineValues = years.map(yr => {
    const val = avgEvents + slopePerYear * (yr - avgYear);
    return Math.max(0, parseFloat(val.toFixed(2)));
  });

  // Chart 1: Frequency & Trend Line
  const frequencyChartData = {
    labels: years,
    datasets: [
      {
        type: 'line',
        label: `Linear Trend (${trend_statistics.slope_events_per_decade > 0 ? '+' : ''}${trend_statistics.slope_events_per_decade} ev/decade)`,
        data: trendLineValues,
        borderColor: '#f59e0b',
        borderWidth: 2.5,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        tension: 0.1,
      },
      {
        type: 'bar',
        label: 'Heatwave Events',
        data: events,
        backgroundColor: 'rgba(255, 87, 34, 0.75)',
        hoverBackgroundColor: '#ff5722',
        borderRadius: 4,
      },
    ],
  };

  // Chart 2: Duration & Cumulative Severity
  const durationChartData = {
    labels: years,
    datasets: [
      {
        type: 'bar',
        label: 'Total Heatwave Days',
        data: heatwaveDays,
        backgroundColor: 'rgba(6, 182, 212, 0.7)',
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Cumulative Severity (°C-Days above P95)',
        data: severity,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };

  // Chart 3: Day-Of-Year Baseline Curve
  const doyLabels = baseline_info.sample_doy_thresholds.map(d => d.label);
  const doyThresholds = baseline_info.sample_doy_thresholds.map(d => d.threshold_temp);

  const doyChartData = {
    labels: doyLabels,
    datasets: [
      {
        label: '95th Percentile Threshold (°C) across Year',
        data: doyThresholds,
        borderColor: '#ff5722',
        backgroundColor: 'rgba(255, 87, 34, 0.12)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#ff5722',
        pointRadius: 3,
      },
    ],
  };

  const chartOptionsBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 12 },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } },
      },
    },
  };

  const dualAxisOptions = {
    ...chartOptionsBase,
    scales: {
      x: chartOptionsBase.scales.x,
      y: {
        type: 'linear',
        position: 'left',
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
        ticks: { color: '#06b6d4' },
        title: { display: true, text: 'Heatwave Days', color: '#06b6d4', font: { size: 11 } },
      },
      y1: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: '#a855f7' },
        title: { display: true, text: 'Degree-Days Severity', color: '#a855f7', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="glass-panel chart-card" style={{ gridColumn: '1 / -1' }}>
      <div className="chart-header">
        <div>
          <h2 className="chart-title">Interactive Time-Series Visualizations</h2>
          <p className="chart-subtitle">
            Long-term climatological trajectories and seasonal heat thresholds
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: 3, borderRadius: 6 }}>
          <button
            type="button"
            className={`preset-chip ${activeTab === 'frequency' ? 'active' : ''}`}
            onClick={() => setActiveTab('frequency')}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            <BarChart3 size={13} />
            <span>Hazard Frequency & Trend</span>
          </button>
          <button
            type="button"
            className={`preset-chip ${activeTab === 'duration' ? 'active' : ''}`}
            onClick={() => setActiveTab('duration')}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            <Activity size={13} />
            <span>Duration & Severity</span>
          </button>
          <button
            type="button"
            className={`preset-chip ${activeTab === 'doy' ? 'active' : ''}`}
            onClick={() => setActiveTab('doy')}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            <Calendar size={13} />
            <span>Seasonal Baseline (DOY)</span>
          </button>
        </div>
      </div>

      <div className="chart-canvas-box" style={{ height: 380 }}>
        {activeTab === 'frequency' && (
          <Bar data={frequencyChartData} options={chartOptionsBase} />
        )}
        {activeTab === 'duration' && (
          <Bar data={durationChartData} options={dualAxisOptions} />
        )}
        {activeTab === 'doy' && (
          <Line data={doyChartData} options={chartOptionsBase} />
        )}
      </div>
    </div>
  );
}
