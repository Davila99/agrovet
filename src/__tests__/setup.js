/**
 * Setup global para vitest.
 */
// Mock de import.meta.env para tests
globalThis.importMetaEnv = {
  VITE_PROFILES_SERVICE_URL: 'http://localhost:8003/api',
  VITE_AUTH_SERVICE_URL: 'http://localhost:8002/api',
  VITE_GATEWAY_URL: 'http://localhost:8000/api',
};

// Polyfill fetch si no está disponible en jsdom
if (!globalThis.fetch) {
  globalThis.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
}
