// Centralized service URL configuration for the frontend.
// Use Vite's `import.meta.env.VITE_*` values. This module exposes helpers
// to build full service URLs in a consistent way.

const env = import.meta && import.meta.env ? import.meta.env : {};

const SERVICES = {
  AUTH: env.VITE_AUTH_SERVICE_URL || 'http://127.0.0.1:8002/api',
  CHAT: env.VITE_CHAT_SERVICE_URL || 'http://127.0.0.1:8006',
  FORUM: env.VITE_FORUM_SERVICE_URL || 'http://127.0.0.1:8005/api',
  ADDS: env.VITE_ADDS_SERVICE_URL || 'http://127.0.0.1:8004/api',
  MEDIA: env.VITE_MEDIA_SERVICE_URL || 'http://127.0.0.1:8001/api',
  PROFILES: env.VITE_PROFILES_SERVICE_URL || 'http://127.0.0.1:8003/api',
  GATEWAY: env.VITE_GATEWAY_URL || 'http://127.0.0.1:8000/api',
  WS: env.VITE_WS_URL || 'ws://127.0.0.1:8006/ws',
};

function ensurePath(base, path) {
  if (!path) return base;
  // Ensure single slash separator
  if (base.endsWith('/') && path.startsWith('/')) return base + path.slice(1);
  if (!base.endsWith('/') && !path.startsWith('/')) return base + '/' + path;
  return base + path;
}

export function getServiceUrl(key) {
  return SERVICES[key] || SERVICES.GATEWAY;
}

export function buildUrl(key, path = '') {
  const base = getServiceUrl(key);
  return ensurePath(base, path);
}

export default {
  SERVICES,
  getServiceUrl,
  buildUrl,
};
