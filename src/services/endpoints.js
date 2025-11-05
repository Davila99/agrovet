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


// Helpers for chat API and WS services
const normalizeToken = (raw) => (raw ? String(raw).replace(/^Token\s*/i, "").replace(/^Bearer\s*/i, "") : null);
const authHeaders = (token) => {
  const t = normalizeToken(token);
  return t ? { Authorization: `Token ${t}` } : {};
};

// Chat HTTP API (curried helpers used by Chat.jsx)
export const chatAPI = {
  createRoom: (participants = [], isPrivate = false) => ({ token } = {}) => {
    // For private 1:1 rooms prefer the atomic endpoint which returns existing
    // room if one exists and avoids race conditions on concurrent creates.
    if (isPrivate && Array.isArray(participants) && participants.length === 2) {
      return httpClient("/chat/rooms/get_or_create_private/", {
        method: "POST",
        headers: authHeaders(token),
        body: { participants_ids: participants },
      });
    }
    return httpClient("/chat/rooms/", {
      method: "POST",
      headers: authHeaders(token),
      body: { participants_ids: participants, is_private: !!isPrivate },
    });
  },

  listRooms: ({ token } = {}) =>
    httpClient("/chat/rooms/", { method: "GET", headers: authHeaders(token) }),

  sendMessage: (room, content) => ({ token } = {}) =>
    httpClient("/chat/messages/", {
      method: "POST",
      headers: authHeaders(token),
      body: { room, content },
    }),

  getLastMessages: (room, limit = 50) => ({ token } = {}) =>
    httpClient(
      `/chat/messages/last_messages/?room=${encodeURIComponent(room)}&limit=${encodeURIComponent(limit)}`,
      { method: "GET", headers: authHeaders(token) }
    ),
};

// WebSocket helpers for chat and presence
const resolveWsBase = () => {
  if (typeof window === "undefined") return null;
  const apiBase = typeof window !== "undefined" && window.__AGROVET_API_BASE ? String(window.__AGROVET_API_BASE).replace(/\/$/, "") : null;
  if (apiBase) {
    try {
      return new URL(apiBase).origin;
    } catch (e) {
      return apiBase;
    }
  }
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return `${location.protocol}//127.0.0.1:8000`;
  return `${location.protocol}//${location.hostname}`;
};

export function chatServiceFactory() {
  let ws = null;
  let opened = false;
  let closedByUser = false;

  const connect = (room, token, handlers = {}) => {
    try {
      closedByUser = false;
      const base = resolveWsBase();
      const proto = base && String(base).startsWith("https") ? "wss" : "ws";
      const host = base ? new URL(base).host : `${location.hostname}:${location.port || 80}`;
      const q = token ? `?token=${encodeURIComponent(token)}` : "";
      const url = `${proto}://${host}/ws/chat/${encodeURIComponent(room)}/${q}`;
      console.debug("[chat.service] connecting", { url, room, tokenPresent: !!token });
      ws = new WebSocket(url);
      ws.onopen = (ev) => {
        opened = true;
        handlers.onOpen && handlers.onOpen(ev);
      };
      ws.onmessage = (ev) => {
        handlers.onMessage && handlers.onMessage(ev);
      };
      ws.onclose = (ev) => {
        opened = false;
        handlers.onClose && handlers.onClose(ev);
      };
      ws.onerror = (ev) => {
        handlers.onError && handlers.onError(ev);
      };
    } catch (e) {
      console.debug("[chat.service] connect error", e);
      handlers.onError && handlers.onError(e);
    }
  };

  const disconnect = () => {
    try {
      closedByUser = true;
      if (ws) {
        try {
          ws.close();
        } catch (e) {}
        ws = null;
      }
    } catch (e) {}
  };

  const send = (msg) => {
    try {
      if (!ws) return;
      const payload = typeof msg === "string" ? msg : JSON.stringify(msg);
      ws.send(payload);
    } catch (e) {
      console.debug("[chat.service] send error", e);
    }
  };

  const isOpen = () => !!(ws && ws.readyState === WebSocket.OPEN);
  const readyState = () => (ws ? ws.readyState : -1);

  return { connect, disconnect, send, isOpen, readyState };
}

export function connectPresence(token, handlers = {}) {
  let ws = null;
  try {
    const base = resolveWsBase();
    const proto = base && String(base).startsWith("https") ? "wss" : "ws";
    const host = base ? new URL(base).host : `${location.hostname}:${location.port || 80}`;
    const q = token ? `?token=${encodeURIComponent(token)}` : "";
    const url = `${proto}://${host}/ws/presence/${q}`;
    console.debug("[chat.service] connectPresence", { url, tokenPresent: !!token });
    ws = new WebSocket(url);
    ws.onopen = (ev) => handlers.onOpen && handlers.onOpen(ev);
    ws.onmessage = (ev) => handlers.onMessage && handlers.onMessage(ev);
    ws.onclose = (ev) => handlers.onClose && handlers.onClose(ev);
    ws.onerror = (ev) => handlers.onError && handlers.onError(ev);
  } catch (e) {
    console.debug("[chat.service] connectPresence error", e);
    handlers.onError && handlers.onError(e);
  }

  return {
    disconnect: () => {
      try {
        if (ws) ws.close();
      } catch (e) {}
    },
    send: (m) => {
      try {
        if (!ws) return;
        ws.send(typeof m === "string" ? m : JSON.stringify(m));
      } catch (e) {}
    },
    isOpen: () => !!(ws && ws.readyState === WebSocket.OPEN),
  };
}