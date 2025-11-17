import httpClient from "../httpClient";

export const addService = {
  getAdds: (params = {}) => {
    // build query string manually because httpClient doesn't add params
    const qs = Object.keys(params || {}).filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '').map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
    const path = `/adds/${qs ? `?${qs}` : ''}`;
    return httpClient(path, { method: "GET" });
  },
  getAddDetail: (id) => httpClient(`/adds/${id}/`, { method: "GET" }),
  createAdd: (data) => httpClient(`/adds/`, { method: "POST", body: data }),
  updateAdd: (id, data) => httpClient(`/adds/${id}/`, { method: "PATCH", body: data }),
  deleteAdd: (id) => httpClient(`/adds/${id}/`, { method: "DELETE" }),
  getCategories: () => httpClient(`/categories/`, { method: "GET" }),
  followUser: (following_id) => httpClient(`/follows/`, { method: "POST", body: { following_id } }),
  unfollowUser: (followId) => httpClient(`/follows/${followId}/`, { method: "DELETE" }),
};

export default addService;
