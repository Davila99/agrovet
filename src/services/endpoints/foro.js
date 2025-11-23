import httpClient from "../httpClient";
import env from "../env";
import postAdapter from "../adapters/postAdapter";

/**
 * Endpoints/service wrapper for Foro feature.
 * Adapted for microservices using env.buildUrl and adapters.
 */
export const foroService = {
  getPosts: async (params = {}) => {
    const qs = Object.keys(params || {}).filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '').map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
    const url = env.buildUrl('FORUM', `/posts/${qs ? `?${qs}` : ''}`);
    const res = await httpClient(url, { method: "GET" });
    // Normalize list of posts
    if (res.results) {
      res.results = res.results.map(postAdapter.normalizePost);
    } else if (Array.isArray(res)) {
      return res.map(postAdapter.normalizePost);
    }
    return res;
  },

  getPostDetail: async (id) => {
    const url = env.buildUrl('FORUM', `/posts/${id}/`);
    const res = await httpClient(url, { method: "GET" });
    return postAdapter.normalizePost(res);
  },

  createPost: async (data) => {
    const url = env.buildUrl('FORUM', `/posts/`);
    const res = await httpClient(url, { method: "POST", body: data });
    return postAdapter.normalizePost(res);
  },

  getComments: (params = {}) => {
    const qs = Object.keys(params || {}).filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '').map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
    const url = env.buildUrl('FORUM', `/comments/${qs ? `?${qs}` : ''}`);
    return httpClient(url, { method: 'GET' });
  },

  createComment: (data) => {
    const url = env.buildUrl('FORUM', `/comments/`);
    return httpClient(url, { method: 'POST', body: data });
  },

  getCommunities: () => {
    const url = env.buildUrl('FORUM', `/communities/`);
    return httpClient(url, { method: 'GET' });
  },

  getCommunityDetail: (id) => {
    const url = env.buildUrl('FORUM', `/communities/${id}/`);
    return httpClient(url, { method: 'GET' });
  },

  joinCommunity: (id) => {
    const url = env.buildUrl('FORUM', `/communities/${id}/join/`);
    return httpClient(url, { method: 'POST' });
  },

  createCommunity: (data) => {
    const url = env.buildUrl('FORUM', `/communities/`);
    return httpClient(url, { method: 'POST', body: data });
  },

  uploadCommunityCover: (id, formData) => {
    const url = env.buildUrl('FORUM', `/communities/${id}/upload_cover/`);
    return httpClient(url, { method: 'POST', body: formData, headers: {} });
  },

  uploadCommunityAvatar: (id, formData) => {
    const url = env.buildUrl('FORUM', `/communities/${id}/upload_avatar/`);
    return httpClient(url, { method: 'POST', body: formData, headers: {} });
  },

  createReaction: (body) => {
    const url = env.buildUrl('FORUM', `/reactions/`);
    return httpClient(url, { method: 'POST', body });
  },

  removeReaction: (id) => {
    const url = env.buildUrl('FORUM', `/reactions/${id}/remove/`);
    return httpClient(url, { method: 'DELETE' });
  },

  getNotifications: () => {
    const url = env.buildUrl('FORUM', `/notifications/`);
    return httpClient(url, { method: 'GET' });
  },

  markNotificationsRead: (ids = []) => {
    const url = env.buildUrl('FORUM', `/notifications/mark_read/`);
    return httpClient(url, { method: 'POST', body: { ids } });
  },

  // The media app registers viewset at /api/media/ so POST to /media/ to create
  // Uses MEDIA service
  uploadMedia: (formData) => {
    const url = env.buildUrl('MEDIA', `/media/`);
    return httpClient(url, { method: 'POST', body: formData, headers: {} });
  },

  deletePost: (id) => {
    const url = env.buildUrl('FORUM', `/posts/${id}/`);
    return httpClient(url, { method: 'DELETE' });
  },
};

export default foroService;

