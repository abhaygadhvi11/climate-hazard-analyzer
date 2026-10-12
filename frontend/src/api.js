import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s timeout for large multi-decade weather extractions
});

export async function fetchHealth() {
  try {
    const res = await apiClient.get('/health');
    return res.data;
  } catch (error) {
    console.warn('Backend health check error:', error);
    return null;
  }
}

export async function fetchPresets() {
  const res = await apiClient.get('/presets');
  return res.data;
}

export async function analyzeHazard(params) {
  const res = await apiClient.post('/analyze', params);
  return res.data;
}

export async function downloadCSV(analysisData) {
  const res = await apiClient.post('/export/csv', analysisData, {
    responseType: 'blob',
  });
  
  // Trigger browser download
  const blob = new Blob([res.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const filename = `climate_hazard_${analysisData.grid_id}_${analysisData.yearly_metrics[0].year}_${analysisData.yearly_metrics[analysisData.yearly_metrics.length - 1].year}.csv`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
