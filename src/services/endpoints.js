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
      headers: token ? { Authorization: `Token ${token}` } : {},
    }),

  updateUser: (id, data, token) =>
    httpClient(`/auth/users/${id}/`, {
      method: "PATCH",
      headers: token ? { Authorization: `Token ${token}` } : {},
      body: data,
    }),

  // Endpoint dedicado al perfil autenticado
  profile: (token) =>
    httpClient(`/auth/users/me/`, {
      method: "GET",
      headers: token ? { Authorization: `Token ${token}` } : {},
    }),

  uploadProfilePicture: (data, token) =>
    httpClient("/profiles/upload-profile-picture/", {
      method: "POST",
      headers: token ? { Authorization: `Token ${token}` } : {},
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

// Endpoints para perfiles y contenidos asociados (especialistas / negocios)
export const profilesAPI = {
  // Obtener perfiles de specialist por object_id (user id)
  getSpecialistsByObjectId: (objectId, token) => {
    const localToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    return httpClient(`/profiles/specialists/?object_id=${objectId}`, {
      method: "GET",
      headers: localToken ? { Authorization: `Token ${localToken}` } : {},
    });
  },

  // Crear un perfil o contenido
  createSpecialist: (data, token) => {
    const localToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    return httpClient(`/profiles/specialists/`, {
      method: "POST",
      headers: localToken ? { Authorization: `Token ${localToken}` } : {},
      body: data,
    });
  },

  // Actualizar un recurso en profiles/specialists/:id/
  updateSpecialist: (id, data, token) => {
    const localToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    return httpClient(`/profiles/specialists/${id}/`, {
      method: "PATCH",
      headers: localToken ? { Authorization: `Token ${localToken}` } : {},
      body: data,
    });
  },

  // Actualizar/ reemplazar el perfil de specialist por user id usando PUT /profiles/specialists/{user}/
  putSpecialistByUser: (userId, data, token) => {
    const localToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    return httpClient(`/profiles/specialists/${userId}/`, {
      method: "PUT",
      headers: localToken ? { Authorization: `Token ${localToken}` } : {},
      body: data,
    });
  },

  // Intentar PATCH por user id si el backend lo soporta
  patchSpecialistByUser: (userId, data, token) => {
    const localToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    return httpClient(`/profiles/specialists/${userId}/`, {
      method: "PATCH",
      headers: localToken ? { Authorization: `Token ${localToken}` } : {},
      body: data,
    });
  },
};
