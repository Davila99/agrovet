import httpClient from "../httpClient";

export const addService = {
  getAdds: (params = {}) => httpClient(`/adds/`, { method: "GET", headers: {}, params }),
  getAddDetail: (id) => httpClient(`/adds/${id}/`, { method: "GET" }),
  createAdd: (data) => httpClient(`/adds/`, { method: "POST", body: data }),
  updateAdd: (id, data) => httpClient(`/adds/${id}/`, { method: "PATCH", body: data }),
  deleteAdd: (id) => httpClient(`/adds/${id}/`, { method: "DELETE" }),
  getCategories: () => httpClient(`/categories/`, { method: "GET" }),
  followUser: (following_id) => httpClient(`/follows/`, { method: "POST", body: { following_id } }),
  unfollowUser: (followId) => httpClient(`/follows/${followId}/`, { method: "DELETE" }),
};

export default addService;
