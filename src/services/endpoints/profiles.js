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
    const url = env.buildUrl('PROFILES', `/profiles/specialists/by-user/${userId}/`);
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
    console.log('='.repeat(60));
    console.log('🔵 [profilesAPI] PATCH response RAW:', JSON.stringify(res, null, 2));
    console.log('🔵 [profilesAPI] work_images_full en PATCH response:', res?.work_images_full);
    console.log('🔵 [profilesAPI] work_images_full length:', res?.work_images_full?.length);
    if (res?.work_images_full && Array.isArray(res.work_images_full)) {
      console.log('🔵 [profilesAPI] work_images_full items:', res.work_images_full.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        description: item.description
      })));
    }
    console.log('='.repeat(60));
    const normalized = profileAdapter.normalizeProfile(res);
    console.log('🔵 [profilesAPI] PATCH response normalized:', normalized);
    console.log('🔵 [profilesAPI] normalized.work_images_full:', normalized?.work_images_full);
    return normalized;
  },

  getSpecialistByUser: async (userId, token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const url = env.buildUrl('PROFILES', `/profiles/specialists/by-user/${userId}/`);
    console.log('🔵 [profilesAPI] GET specialist by user:', { userId, url, hasToken: !!localToken });
    try {
      const res = await httpClient(url, {
        method: "GET",
        headers: authHeaders(localToken),
      });
      console.log('='.repeat(60));
      console.log('🔵 [profilesAPI] GET response RAW:', JSON.stringify(res, null, 2));
      console.log('🔵 [profilesAPI] work_images_full en respuesta:', res?.work_images_full);
      console.log('🔵 [profilesAPI] work_images_full es array?:', Array.isArray(res?.work_images_full));
      console.log('🔵 [profilesAPI] work_images_full length:', res?.work_images_full?.length);
      if (res?.work_images_full && Array.isArray(res.work_images_full)) {
        console.log('🔵 [profilesAPI] work_images_full items:', res.work_images_full.map(item => ({
          id: item.id,
          name: item.name,
          url: item.url,
          description: item.description
        })));
      }
      console.log('='.repeat(60));
      const normalized = profileAdapter.normalizeProfile(res);
      console.log('🔵 [profilesAPI] GET response normalized:', normalized);
      console.log('🔵 [profilesAPI] normalized.work_images_full:', normalized?.work_images_full);
      return normalized;
    } catch (e) {
      console.error('❌ [profilesAPI] Error en GET specialist by user:', e);
      throw e;
    }
  },

  getBusinessmanByUser: async (userId, token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const url = env.buildUrl('PROFILES', `/profiles/businessmen/${userId}/`);
    try {
      const res = await httpClient(url, {
        method: "GET",
        headers: authHeaders(localToken),
      });
      return profileAdapter.normalizeProfile(res);
    } catch (e) {
      console.error('❌ [profilesAPI] Error en GET businessman by user:', e);
      throw e;
    }
  },

  patchBusinessmanByUser: async (userId, data, token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const url = env.buildUrl('PROFILES', `/profiles/businessmen/${userId}/`);
    try {
      const res = await httpClient(url, {
        method: "PATCH",
        headers: authHeaders(localToken),
        body: data,
      });
      return profileAdapter.normalizeProfile(res);
    } catch (e) {
      console.error('❌ [profilesAPI] Error en PATCH businessman by user:', e);
      throw e;
    }
  },
};

export default profilesAPI;
