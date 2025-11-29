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

  getSpecialistByUser: async (userId, token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const url = env.buildUrl('PROFILES', `/profiles/specialists/${userId}/`);
    console.log('[profilesAPI] 🔵 GET specialist by user:', { userId, url, hasToken: !!localToken });
    const res = await httpClient(url, {
      method: "GET",
      headers: authHeaders(localToken),
    });
    console.log('[profilesAPI] 🟢 Response raw para specialist', userId, ':', JSON.stringify(res, null, 2).substring(0, 1000));
    const normalized = profileAdapter.normalizeProfile(res);
    console.log('[profilesAPI] 🟡 Normalized para specialist', userId, ':', {
      verification_status: normalized?.verification_status,
      verification_type: normalized?.verification_type,
      hasVerificationTitle: !!normalized?.verification_title_id,
      hasVerificationStudentCard: !!normalized?.verification_student_card_id,
      hasVerificationGraduationLetter: !!normalized?.verification_graduation_letter_id,
      keys: Object.keys(normalized || {}).slice(0, 15)
    });
    return normalized;
  },

  getBusinessmanByUser: async (userId, token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const url = env.buildUrl('PROFILES', `/profiles/businessmen/${userId}/`);
    try {
      console.log('[profilesAPI] GET businessman by user:', { userId, url, hasToken: !!localToken });
    } catch (e) {}
    const res = await httpClient(url, {
      method: "GET",
      headers: authHeaders(localToken),
    });
    return profileAdapter.normalizeProfile(res);
  },

  patchBusinessmanByUser: async (userId, data, token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const url = env.buildUrl('PROFILES', `/profiles/businessmen/${userId}/`);
    try {
      console.log('[profilesAPI] PATCH businessman by user:', { userId, url, data, hasToken: !!localToken });
    } catch (e) {}
    const res = await httpClient(url, {
      method: "PATCH",
      headers: authHeaders(localToken),
      body: data,
    });
    return profileAdapter.normalizeProfile(res);
  },
};

export default profilesAPI;
