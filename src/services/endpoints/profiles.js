import httpClient from "../httpClient";
import { authHeaders } from "./utils";

export const profilesAPI = {
  getSpecialistsByObjectId: (objectId, token) => {
    const localToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    console.log("[profilesAPI.getSpecialistsByObjectId]", { objectId, localToken });
    return httpClient(`/profiles/specialists/?object_id=${objectId}`, {
      method: "GET",
      headers: authHeaders(localToken),
    });
  },

  createSpecialist: (data, token) => {
    const localToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    console.log("[profilesAPI.createSpecialist]", { data, localToken });
    return httpClient(`/profiles/specialists/`, {
      method: "POST",
      headers: authHeaders(localToken),
      body: data,
    });
  },

  updateSpecialist: (id, data, token) => {
    const localToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    console.log("[profilesAPI.updateSpecialist]", { id, data, localToken });
    return httpClient(`/profiles/specialists/${id}/`, {
      method: "PATCH",
      headers: authHeaders(localToken),
      body: data,
    });
  },

  putSpecialistByUser: (userId, data, token) => {
    const localToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    console.log("[profilesAPI.putSpecialistByUser]", { userId, data, localToken });
    return httpClient(`/profiles/specialists/${userId}/`, {
      method: "PUT",
      headers: authHeaders(localToken),
      body: data,
    });
  },

  patchSpecialistByUser: (userId, data, token) => {
    const localToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    console.log("[profilesAPI.patchSpecialistByUser]", { userId, data, localToken });
    return httpClient(`/profiles/specialists/${userId}/`, {
      method: "PATCH",
      headers: authHeaders(localToken),
      body: data,
    });
  },
};
