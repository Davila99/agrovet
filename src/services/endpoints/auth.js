import httpClient from "../httpClient";
import env from "../env";
import { authHeaders } from "./utils";
import authAdapter from "../adapters/authAdapter";
import authClient from "../authClient";

// Auth API adapted to point to AUTH microservice via env.buildUrl('AUTH', path)
export const authAPI = {
  register: (data) => httpClient(env.buildUrl('AUTH', '/auth/register/'), { method: 'POST', body: data }),

  // Login by phone/username + password
  login: async (data = {}) => {
    const phone_number = (data.phone_number || data.phone || data.username || "").toString().trim();
    const password = data.password;

    const url = env.buildUrl('AUTH', '/auth/login/');

    // Try primary payload first, then fallbacks if 401 (invalid credentials)
    const tryPayload = async (payload) => {
      return httpClient(url, { method: 'POST', body: payload });
    };

    let res;
    const tried = [];
    try {
      const primary = { phone_number, password };
      tried.push(primary);
      res = await tryPayload(primary);
    } catch (err) {
      // If invalid credentials (401), attempt fallbacks with different keys/formats
      if (err && err.status === 401) {
        const fallbacks = [
          { username: phone_number, password },
          { phone: phone_number, password },
          { phone_number: `+${phone_number}`, password },
          { phone: `+${phone_number}`, password },
        ];
        for (const fb of fallbacks) {
          try {
            tried.push(fb);
            res = await tryPayload(fb);
            // if success, break
            if (res) break;
          } catch (e2) {
            if (!(e2 && e2.status === 401)) {
              // non-auth error: rethrow
              throw e2;
            }
            // else continue to next fallback
          }
        }
      } else {
        // non-401 error: rethrow
        throw err;
      }
    }

    if (!res) {
      // All attempts failed with 401
      const e = new Error('Credenciales inválidas');
      e.status = 401;
      throw e;
    }

    const normalized = authAdapter.normalizeLoginResponse(res);
    try {
      // Persist tokens if backend returned them
      const tokens = {};
      if (normalized.token) tokens.access = normalized.token;
      if (normalized.refresh) tokens.refresh = normalized.refresh;
      if (Object.keys(tokens).length) authClient.saveTokens(tokens);
    } catch (e) {}
    return normalized;
  },

  userById: async (id, token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const res = await httpClient(env.buildUrl('AUTH', `/auth/users/${id}/`), {
      method: 'GET',
      headers: authHeaders(localToken),
    });
    return authAdapter.normalizeUser(res);
  },

  updateUser: async (id, data, token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const res = await httpClient(env.buildUrl('AUTH', `/auth/users/${id}/`), {
      method: 'PATCH',
      headers: authHeaders(localToken),
      body: data,
    });
    return authAdapter.normalizeUser(res);
  },

  profile: async (token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const res = await httpClient(env.buildUrl('AUTH', '/auth/users/me/'), {
      method: 'GET',
      headers: authHeaders(localToken),
    });
    return authAdapter.normalizeUser(res);
  },

  uploadProfilePicture: (data, token) =>
    httpClient(env.buildUrl('GATEWAY', '/profiles/upload-profile-picture/'), {
      method: 'POST',
      headers: authHeaders(token),
      body: data,
    }),
};

export const getProfile = async (token) => {
  try {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      return await authAPI.userById(storedId, token);
    }
  } catch (e) {
    // swallow localStorage read errors silently
  }
  return await authAPI.profile(token);
};

export default authAPI;
