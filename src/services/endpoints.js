import httpClient from "./httpClient";

// 🔑 Auth
export const authAPI = {
  register: (data) =>
    httpClient("/auth/register/", { method: "POST", body: data }),
  
    login: (data) => httpClient("/auth/login/", { method: "POST", body: data }),
  
  // Obtener usuario por id
  userById: (id, token) =>
    httpClient(`/auth/users/${id}/`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  // Endpoint dedicado al perfil autenticado
  profile: (token) =>
    httpClient(`/auth/users/${id}`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  uploadProfilePicture: (data, token) =>
    httpClient("/profiles/upload-profile-picture/", {
      method: "POST",
      body: data,
    }),
};


export const getProfile = async (token) => {// Intentar usar el id guardado en localStorage
  try {
    const storedId = localStorage.getItem("userId");
    if (storedId) {
      return await authAPI.userById(storedId, token);
    }
  } catch (e) {
    console.warn("No se pudo leer userId desde localStorage:", e);
  }

  return await authAPI.profile(token);
};
