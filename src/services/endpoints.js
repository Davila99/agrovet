import httpClient from "./httpClient";

// 🔑 Auth
export const authAPI = {
  register: (data) =>
    httpClient("/auth/register/", { method: "POST", body: data }),
  
    login: (data) => httpClient("/auth/login/", { method: "POST", body: data }),
  
    profile: (token) =>
    httpClient("/auth/profile/", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  uploadProfilePicture: (data, token) =>
    httpClient("/profiles/upload-profile-picture/", {
      method: "POST",
      body: data,
    }),
};


export const getProfile = async (token) => {
  return authAPI.profile(token);
}