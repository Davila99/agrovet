import httpClient from "../httpClient";
import { authHeaders } from "./utils";
import env from "../env";
import profileAdapter from "../adapters/profileAdapter";
import authClient from "../../features/auth/services/authClient";

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

  // Calificar consulta realizada
  rateConsultation: async (consultationId, professionalId, stars, token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const url = env.buildUrl('PROFILES', '/profiles/reports/rate_consultation/');
    return httpClient(url, {
      method: 'POST',
      headers: authHeaders(localToken),
      body: { consultation_id: consultationId, professional_id: professionalId, stars },
    });
  },

  // Crear reporte de usuario / consulta
  createReport: async (reportedUserId, reason, details, consultationId, token) => {
    const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
    const url = env.buildUrl('PROFILES', '/profiles/reports/');
    return httpClient(url, {
      method: 'POST',
      headers: authHeaders(localToken),
      body: { 
        reported_user_id: reportedUserId, 
        reason, 
        details,
        consultation_id: consultationId
      },
    });
  },
};

const getBaseUrl = () => {
  return (
    import.meta.env?.VITE_PROFILES_SERVICE_URL ||
    import.meta.env?.VITE_GATEWAY_URL?.replace('/api', '') + '/api/profiles' ||
    'http://localhost:8003/api'
  );
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
};

export async function getAllValidations() {
  const res = await fetch(`${getBaseUrl()}/profiles/admin/validations/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status} al obtener validaciones`);
  }
  return res.json();
}

export async function getPendingValidations() {
  const res = await fetch(`${getBaseUrl()}/profiles/admin/validations/pending/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status} al obtener pendientes`);
  }
  return res.json();
}

export async function getRejectedValidations() {
  const res = await fetch(`${getBaseUrl()}/profiles/admin/validations/rejected/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status} al obtener rechazados`);
  }
  return res.json();
}

export async function validateSpecialist(userId, newStatus, adminComment = '') {
  const res = await fetch(
    `${getBaseUrl()}/profiles/admin/validations/validate/${userId}/`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        verification_status: newStatus,
        admin_comment: adminComment,
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status} al actualizar validación`);
  }
  return res.json();
}

export async function getValidationHistory(userId) {
  const res = await fetch(`${getBaseUrl()}/profiles/admin/validations/${userId}/history/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status} al obtener historial`);
  }
  return res.json();
}

export async function getValidationStats() {
  const res = await fetch(`${getBaseUrl()}/profiles/admin/validations/stats/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status} al obtener estadísticas`);
  }
  return res.json();
}

export default profilesAPI;
