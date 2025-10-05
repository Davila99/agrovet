import httpClient from "./httpClient";

// 🔑 Auth
export const authAPI = {
  register: (data) =>
    httpClient("/auth/register/", { method: "POST", body: data }),
  login: (data) => httpClient("/auth/login/", { method: "POST", body: data }),
  profile: () => httpClient("/auth/profile/"), // Ejemplo de endpoint protegido
};

