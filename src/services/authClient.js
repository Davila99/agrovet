import env from './env';

// Simple token manager for the frontend.
// Stores tokens in localStorage under `agrovet_token` as JSON: { access, refresh }
const STORAGE_KEY = 'agrovet_token';

function _readStorage() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) return JSON.parse(raw);
    // Fallback to legacy `token` key (some sessions may only have this)
    try {
      const legacy = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (legacy) {
        try { console.debug('[authClient] found legacy token in localStorage (masked)', legacy && (legacy.length > 8 ? `${legacy.slice(0,4)}...${legacy.slice(-4)}` : legacy)); } catch (e) {}
        return { token: legacy };
      }
    } catch (e) {}
    return null;
  } catch (e) {
    return null;
  }
}

export function getAccessToken() {
  const data = _readStorage();
  const t = data && (data.access || data.token || data['access_token'] || data['token']) || null;
  try { console.debug('[authClient] getAccessToken (masked)', t && (t.length > 8 ? `${t.slice(0,4)}...${t.slice(-4)}` : t)); } catch (e) {}
  return t;
}

export function getRefreshToken() {
  const data = _readStorage();
  return data && (data.refresh || data['refresh_token']) || null;
}

export function saveTokens(tokens = {}) {
  try {
    const existing = _readStorage() || {};
    const merged = { ...existing, ...tokens };
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    // Keep legacy `token` key for backward compatibility with older code
    try {
      if (typeof window !== 'undefined' && (merged.access || merged.token || merged.access_token)) {
        const short = merged.access || merged.token || merged.access_token;
        localStorage.setItem('token', short);
      }
    } catch (e) {}
    return true;
  } catch (e) {
    return false;
  }
}

export function clearTokens() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      try { localStorage.removeItem('token'); } catch (e) {}
    }
  } catch (e) {}
}

// Attempt to refresh tokens. Returns new token object on success, null on failure.
export async function refreshToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  // Try a couple of common refresh endpoints to be robust across backends
  const candidates = [
    '/auth/refresh/',
    '/auth/token/refresh/',
    '/auth/refresh-token/',
  ];

  for (const path of candidates) {
    try {
      const url = env.buildUrl('AUTH', path);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) continue;
      const data = await res.json().catch(() => null);
      if (!data) continue;

      // Normalize possible shapes { access, refresh } or { token } or { access_token }
      const tokens = {};
      if (data.access) tokens.access = data.access;
      if (data.refresh) tokens.refresh = data.refresh;
      if (data.token) tokens.access = tokens.access || data.token;
      if (data.access_token) tokens.access = tokens.access || data.access_token;
      if (Object.keys(tokens).length === 0) continue;

      saveTokens(tokens);
      return tokens;
    } catch (e) {
      // try next candidate
      continue;
    }
  }
  // nothing worked
  clearTokens();
  return null;
}

// Attach Authorization header to an existing headers object (mutates copy)
export function attachAuthHeader(headers = {}) {
  const token = getAccessToken();
  if (!token) return { ...headers };
  const h = { ...headers };
  // Keep server expectations: attempt Bearer, then Token
  if (!h.Authorization && !h.authorization) h.Authorization = `Bearer ${token}`;
  return h;
}

export default {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  refreshToken,
  attachAuthHeader,
};
