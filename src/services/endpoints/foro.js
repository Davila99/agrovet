import httpClient from "../httpClient";
import env from "../env";
import postAdapter from "../adapters/postAdapter";
import authClient from "../authClient";

/**
 * Endpoints/service wrapper for Foro feature.
 * Adapted for microservices using env.buildUrl and adapters.
 */
export const foroService = {
  getPosts: async (params = {}) => {
    // If params contain a community filter, call the by-community endpoint
    try {
      if (params && (params.community || params.id || params.slug)) {
        const id = params.community || params.id || '';
        const slug = params.slug || '';
        let url = '';
        if (slug) {
          url = env.buildUrl('FORUM', `/foro/posts/by-community/?slug=${encodeURIComponent(slug)}`);
        } else if (id) {
          url = env.buildUrl('FORUM', `/foro/posts/by-community/?id=${encodeURIComponent(id)}`);
        }
        // Attach auth header explicitly if token present to avoid missing credentials
        const headers = authClient.attachAuthHeader({});
        const res = await httpClient(url, { method: 'GET', headers });
        if (Array.isArray(res)) return res.map(postAdapter.normalizePost);
        if (res.results) res.results = res.results.map(postAdapter.normalizePost);
        return res;
      }

      // No specific params: try feed (posts from user's communities)
      const feedUrl = env.buildUrl('FORUM', `/foro/posts/feed/`);
      try {
        const feedRes = await httpClient(feedUrl, { method: 'GET', headers: authClient.attachAuthHeader({}) });
        if (Array.isArray(feedRes)) return feedRes.map(postAdapter.normalizePost);
        if (feedRes.results) feedRes.results = feedRes.results.map(postAdapter.normalizePost);
        return feedRes;
      } catch (feedErr) {
        // If feed fails (e.g., unauthenticated), fallback to generic posts list
        if (feedErr && feedErr.status === 401) {
          // Fallback to public posts list
          const url = env.buildUrl('FORUM', `/foro/posts/`);
          const res = await httpClient(url, { method: 'GET' });
          if (Array.isArray(res)) return res.map(postAdapter.normalizePost);
          if (res.results) res.results = res.results.map(postAdapter.normalizePost);
          return res;
        }
        throw feedErr;
      }
    } catch (e) {
      // Re-throw for upper layers to handle
      throw e;
    }
  },

  getPostDetail: async (id) => {
    const url = env.buildUrl('FORUM', `/foro/posts/${id}/`);
    const res = await httpClient(url, { method: "GET" });
    return postAdapter.normalizePost(res);
  },

  createPost: async (data) => {
    const url = env.buildUrl('FORUM', `/foro/posts/`);
    const res = await httpClient(url, { method: "POST", body: data });
    return postAdapter.normalizePost(res);
  },

  getComments: (params = {}) => {
    const qs = Object.keys(params || {}).filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '').map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
    const url = env.buildUrl('FORUM', `/foro/comments/${qs ? `?${qs}` : ''}`);
    return httpClient(url, { method: 'GET' });
  },

  createComment: (data) => {
    const url = env.buildUrl('FORUM', `/foro/comments/`);
    return httpClient(url, { method: 'POST', body: data });
  },

  getCommunities: () => {
    const url = env.buildUrl('FORUM', `/foro/communities/`);
    return httpClient(url, { method: 'GET' }).then((res) => {
      // Backend may return paginated response { count, next, previous, results }
      if (res && Array.isArray(res)) return res;
      if (res && Array.isArray(res.results)) return res.results;
      // Defensive: if response has 'data' or similar, try to extract
      if (res && Array.isArray(res.data)) return res.data;
      // Fallback: return empty array to avoid breaking callers
      return [];
    });
  },

  getCommunityDetail: (id) => {
    const url = env.buildUrl('FORUM', `/foro/communities/${id}/`);
    return httpClient(url, { method: 'GET' });
  },

  joinCommunity: (id) => {
    const url = env.buildUrl('FORUM', `/foro/communities/${id}/join/`);
    return httpClient(url, { method: 'POST', headers: authClient.attachAuthHeader({}) });
  },

  createCommunity: (data) => {
    const url = env.buildUrl('FORUM', `/foro/communities/`);
    return httpClient(url, { method: 'POST', body: data });
  },

  updateCommunity: (id, data) => {
    const url = env.buildUrl('FORUM', `/foro/communities/${id}/`);
    return httpClient(url, { method: 'PATCH', body: data });
  },

  uploadCommunityCover: (id, formData) => {
    const url = env.buildUrl('FORUM', `/foro/communities/${id}/upload_cover/`);
    return httpClient(url, { method: 'POST', body: formData, headers: authClient.attachAuthHeader({}) });
  },

  uploadCommunityAvatar: (id, formData) => {
    const url = env.buildUrl('FORUM', `/foro/communities/${id}/upload_avatar/`);
    return httpClient(url, { method: 'POST', body: formData, headers: authClient.attachAuthHeader({}) });
  },

  createReaction: (body) => {
    const url = env.buildUrl('FORUM', `/foro/reactions/`);
    return httpClient(url, { method: 'POST', body });
  },

  removeReaction: (id) => {
    const url = env.buildUrl('FORUM', `/foro/reactions/${id}/remove/`);
    return httpClient(url, { method: 'DELETE' });
  },

  getNotifications: () => {
    const url = env.buildUrl('FORUM', `/foro/notifications/`);
    return httpClient(url, { method: 'GET' });
  },

  markNotificationsRead: (ids = []) => {
    const url = env.buildUrl('FORUM', `/foro/notifications/mark_read/`);
    return httpClient(url, { method: 'POST', body: { ids } });
  },

  // The media app registers viewset at /api/media/ so POST to /media/ to create
  // Uses MEDIA service
  uploadMedia: (formData) => {
    const url = env.buildUrl('MEDIA', `/media/`);
    return httpClient(url, { method: 'POST', body: formData, headers: {} });
  },

  deletePost: (id) => {
    const url = env.buildUrl('FORUM', `/foro/posts/${id}/`);
    return httpClient(url, { method: 'DELETE' });
  },
};

export default foroService;

