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
    const payload = { phone_number, password: data.password };
    const res = await httpClient(env.buildUrl('AUTH', '/auth/login/'), { method: 'POST', body: payload });
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
