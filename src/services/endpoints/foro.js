import httpClient from "../httpClient";

/**
 * Endpoints/service wrapper for Foro feature.
 * TODO: revisar formatos de respuesta del backend y adaptar.
 */
export const foroService = {
  getPosts: (params = {}) => {
    const qs = Object.keys(params || {}).filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '').map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
    const path = `/foro/posts/${qs ? `?${qs}` : ''}`;
    return httpClient(path, { method: "GET" });
  },

  getPostDetail: (id) => httpClient(`/foro/posts/${id}/`, { method: "GET" }),

  createPost: (data) => httpClient(`/foro/posts/`, { method: "POST", body: data }),

  getComments: (params = {}) => {
    const qs = Object.keys(params || {}).filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '').map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
    return httpClient(`/foro/comments/${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },

  createComment: (data) => httpClient(`/foro/comments/`, { method: 'POST', body: data }),

  getCommunities: () => httpClient(`/foro/communities/`, { method: 'GET' }),

  getCommunityDetail: (id) => httpClient(`/foro/communities/${id}/`, { method: 'GET' }),
  joinCommunity: (id) => httpClient(`/foro/communities/${id}/join/`, { method: 'POST' }),

  createCommunity: (data) => httpClient(`/foro/communities/`, { method: 'POST', body: data }),

  uploadCommunityCover: (id, formData) => httpClient(`/foro/communities/${id}/upload_cover/`, { method: 'POST', body: formData, headers: {} }),

  uploadCommunityAvatar: (id, formData) => httpClient(`/foro/communities/${id}/upload_avatar/`, { method: 'POST', body: formData, headers: {} }),

  createReaction: (body) => httpClient(`/foro/reactions/`, { method: 'POST', body }),

  removeReaction: (id) => httpClient(`/foro/reactions/${id}/remove/`, { method: 'DELETE' }),

  getNotifications: () => httpClient(`/foro/notifications/`, { method: 'GET' }),

  markNotificationsRead: (ids = []) => httpClient(`/foro/notifications/mark_read/`, { method: 'POST', body: { ids } }),

  // The media app registers viewset at /api/media/ so POST to /media/ to create
  uploadMedia: (formData) => httpClient(`/media/`, { method: 'POST', body: formData, headers: {} }),
  deletePost: (id) => httpClient(`/foro/posts/${id}/`, { method: 'DELETE' }),
};

export default foroService;
