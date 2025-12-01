import httpClient from "../httpClient";
import { authHeaders } from "./utils";
import env from "../env";
import profileAdapter from "../adapters/profileAdapter";
import authClient from "../authClient";

export const profilesAPI = {
  getSpecialistsByObjectId: async (objectId, token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const url = env.buildUrl('PROFILES', `/profiles/specialists/?object_id=${objectId}`);
    const res = await httpClient(url, {
      method: "GET",
      headers: authHeaders(localToken),
    });
    if (Array.isArray(res)) {
      return res.map(profileAdapter.normalizeProfile);
    }
    return res;
  },

  createSpecialist: async (data, token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const url = env.buildUrl('PROFILES', `/profiles/specialists/`);
    const res = await httpClient(url, {
      method: "POST",
      headers: authHeaders(localToken),
      body: data,
    });
    return profileAdapter.normalizeProfile(res);
  },

  updateSpecialist: async (id, data, token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const url = env.buildUrl('PROFILES', `/profiles/specialists/${id}/`);
    const res = await httpClient(url, {
      method: "PATCH",
      headers: authHeaders(localToken),
      body: data,
    });
    return profileAdapter.normalizeProfile(res);
  },

  putSpecialistByUser: async (userId, data, token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const url = env.buildUrl('PROFILES', `/profiles/specialists/${userId}/`);
    try {
      console.log('[profilesAPI] PUT specialist by user:', { userId, url, data, hasToken: !!localToken });
    } catch (e) {}
    const res = await httpClient(url, {
      method: "PUT",
      headers: authHeaders(localToken),
      body: data,
    });
    return profileAdapter.normalizeProfile(res);
  },

  patchSpecialistByUser: async (userId, data, token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const url = env.buildUrl('PROFILES', `/profiles/specialists/${userId}/`);
    try {
      console.log('[profilesAPI] PATCH specialist by user:', { userId, url, data, hasToken: !!localToken });
    } catch (e) {}
    const res = await httpClient(url, {
      method: "PATCH",
      headers: authHeaders(localToken),
      body: data,
    });
    return profileAdapter.normalizeProfile(res);
  },

  // Get specialist profile by user id (convenience wrapper)
  getSpecialistByUser: async (userId, token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const url = env.buildUrl('PROFILES', `/profiles/specialists/${userId}/`);
    const res = await httpClient(url, {
      method: 'GET',
      headers: authHeaders(localToken),
    });
    return profileAdapter.normalizeProfile(res);
  },
};

export default profilesAPI;
