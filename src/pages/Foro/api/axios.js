import axios from 'axios';

// Base Axios client for Foro feature
// TODO: ajustar baseURL si la API está montada en otra ruta
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Token ${token}`;
  } catch (e) {}
  return config;
});

export default api;
