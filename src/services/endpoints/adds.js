import httpClient from "../httpClient";
import env from "../env";
import addAdapter from "../adapters/addAdapter";

export const addService = {
  getAdds: async (params = {}) => {
    // build query string manually because httpClient doesn't add params
    const qs = Object.keys(params || {}).filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '').map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
    const url = env.buildUrl('ADDS', `/adds/${qs ? `?${qs}` : ''}`);
    const res = await httpClient(url, { method: "GET" });
    if (res.results) {
      res.results = res.results.map(addAdapter.normalizeAdd);
    } else if (Array.isArray(res)) {
      return res.map(addAdapter.normalizeAdd);
    }
    return res;
  },
  getAddDetail: async (id) => {
    const url = env.buildUrl('ADDS', `/adds/${id}/`);
    const res = await httpClient(url, { method: "GET" });
    return addAdapter.normalizeAdd(res);
  },
  createAdd: async (data) => {
    const url = env.buildUrl('ADDS', `/adds/`);
    try { console.debug('[addService] createAdd', { url, payload: data }); } catch (e) {}
    const res = await httpClient(url, { method: "POST", body: data });
    return addAdapter.normalizeAdd(res);
  },
  updateAdd: async (id, data) => {
    const url = env.buildUrl('ADDS', `/adds/${id}/`);
    const res = await httpClient(url, { method: "PATCH", body: data });
    return addAdapter.normalizeAdd(res);
  },
  deleteAdd: (id) => {
    const url = env.buildUrl('ADDS', `/adds/${id}/`);
    return httpClient(url, { method: "DELETE" });
  },
  getCategories: () => {
    const url = env.buildUrl('ADDS', `/categories/`);
    return httpClient(url, { method: "GET" });
  },
  followUser: (following_id) => {
    const url = env.buildUrl('ADDS', `/follows/`);
    return httpClient(url, { method: "POST", body: { following_id } });
  },
  unfollowUser: (followId) => {
    const url = env.buildUrl('ADDS', `/follows/${followId}/`);
    return httpClient(url, { method: "DELETE" });
  },
};

export default addService;

