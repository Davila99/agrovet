import httpClient from "../httpClient";
import { authHeaders } from "./utils";

export const authAPI = {
  register: (data) => httpClient("/auth/register/", { method: "POST", body: data }),

  // Login por número de teléfono + contraseña
  // Acepta aliases: phone, phone_number o username
  login: (data = {}) => {
    const phone_number = (data.phone_number || data.phone || data.username || "").toString().trim();
    const payload = { phone_number, password: data.password };
    return httpClient("/auth/login/", { method: "POST", body: payload });
  },

  userById: (id, token) =>
    httpClient(`/auth/users/${id}/`, {
      method: "GET",
      headers: authHeaders(token),
    }),

  updateUser: (id, data, token) =>
    httpClient(`/auth/users/${id}/`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: data,
    }),

  profile: (token) =>
    httpClient("/auth/users/me/", {
      method: "GET",
      headers: authHeaders(token),
    }),

  uploadProfilePicture: (data, token) =>
    httpClient("/profiles/upload-profile-picture/", {
      method: "POST",
      headers: authHeaders(token),
      body: data,
    }),
};

export const getProfile = async (token) => {
  try {
    const storedId = localStorage.getItem("userId");
    if (storedId) {
      return await authAPI.userById(storedId, token);
    }
  } catch (e) {
    // swallow localStorage read errors silently
  }
  return await authAPI.profile(token);
};
