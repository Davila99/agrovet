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
      console.log('🔵 [profilesAPI] PUT specialist by user:', { 
        userId, 
        url, 
        data: JSON.stringify(data, null, 2), 
        hasToken: !!localToken 
      });
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
      console.log('🔵 [profilesAPI] PATCH specialist by user:', { 
        userId, 
        url, 
        data: JSON.stringify(data, null, 2), 
        hasToken: !!localToken 
      });
    } catch (e) {}
    const res = await httpClient(url, {
      method: "PATCH",
      headers: authHeaders(localToken),
      body: data,
    });
    return profileAdapter.normalizeProfile(res);
  },

  getSpecialistByUser: async (userId, token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const url = env.buildUrl('PROFILES', `/profiles/specialists/${userId}/`);
    console.log('🔵 [profilesAPI] GET specialist by user:', { userId, url, hasToken: !!localToken });
    try {
      const res = await httpClient(url, {
        method: "GET",
        headers: authHeaders(localToken),
      });
      console.log('🔵 [profilesAPI] GET response raw:', res);
      const normalized = profileAdapter.normalizeProfile(res);
      console.log('🔵 [profilesAPI] GET response normalized:', normalized);
      return normalized;
    } catch (e) {
      console.error('❌ [profilesAPI] Error en GET specialist by user:', e);
      throw e;
    }
  },
};

export default profilesAPI;
