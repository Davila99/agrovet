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
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  updateUser: (id, data, token) =>
    httpClient(`/auth/users/${id}/`, {
      method: "PATCH",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: data,
    }),

  // Endpoint dedicado al perfil autenticado
  profile: (token) =>
    httpClient(`/auth/users/me/`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  uploadProfilePicture: (data, token) =>
    httpClient("/profiles/upload-profile-picture/", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: data,
    }),
};

// Minimal chatService (WebSocket wrapper)
export function chatServiceFactory() {
  let socket = null;
  let handlers = {};

  function connect(roomId, token, options = {}) {
    if (socket) disconnect();
    const raw = normToken(token);
    // Prefer an explicit backend base URL (settable at runtime), otherwise
    // default to the backend on the same host but port 8000 which is a common
    // dev setup. This avoids trying to open ws:// on the frontend dev server (5173).
    const apiBase = (typeof window !== 'undefined' && window.__AGROVET_API_BASE) || null;
    let baseUrl;
    if (apiBase) {
      try { baseUrl = new URL(apiBase).origin; } catch (e) { baseUrl = apiBase; }
    } else {
      // default backend origin: same hostname, port 8000
      baseUrl = `${location.protocol}//${location.hostname}:8000`;
    }
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const q = raw ? `?token=${encodeURIComponent(raw)}` : '';
    const host = (new URL(baseUrl)).host;
    const basePath = `/ws/chat/${encodeURIComponent(roomId)}/${q}`;
    let attemptedFallback = false;
    let opened = false;

    const makeUrl = (h) => `${wsProtocol}://${h}${basePath}`;

    const doConnect = (h) => {
      const url = makeUrl(h);
      console.debug('[chat.service] connecting', { url, roomId, tokenPresent: !!raw, apiBase, hostAttempt: h });
      socket = new WebSocket(url);

      socket.onopen = (ev) => { opened = true; console.debug('[chat.service] open', { ev, url }); if (options.onOpen) options.onOpen(ev); };
      socket.onmessage = (ev) => { console.debug('[chat.service] raw onmessage', ev); if (options.onMessage) options.onMessage(ev); };
      socket.onclose = (ev) => {
        console.debug('[chat.service] close', { ev, url, opened });
        // if the socket closed before opening, try a small fallback swap localhost <-> 127.0.0.1 once
        if (!opened && !attemptedFallback) {
          attemptedFallback = true;
          try {
            const altHost = h.indexOf('localhost') !== -1 ? h.replace('localhost', '127.0.0.1') : (h.indexOf('127.0.0.1') !== -1 ? h.replace('127.0.0.1', 'localhost') : null);
            if (altHost) {
              console.debug('[chat.service] attempting fallback host', { from: h, to: altHost });
              // small delay to avoid tight loop
              setTimeout(() => doConnect(altHost), 120);
              return;
            }
          } catch (e) {
            console.debug('[chat.service] fallback attempt failed to construct altHost', e);
          }
        }
        socket = null;
        if (options.onClose) options.onClose(ev);
      };
      socket.onerror = (ev) => { console.debug('[chat.service] error', ev); if (options.onError) options.onError(ev); };
    };

    doConnect(host);

    // return the service API (not the raw socket)
    return service;
  }

  function disconnect() {
    if (socket) try { socket.close(); } catch(e){}
    socket = null;
  }

  function isOpen(){
    return !!(socket && socket.readyState === WebSocket.OPEN);
  }

  function send(data) {
    if (!socket || socket.readyState !== WebSocket.OPEN) throw new Error('Socket not open');
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    console.debug('[chat.service] send ->', payload);
    socket.send(payload);
  }

  function readyState(){
    return socket ? socket.readyState : -1;
  }

  const service = { connect, disconnect, send, isOpen };

  // expose readyState for debugging
  service.readyState = readyState;

  return service;
}

// Dedicated presence connector that uses the server's /ws/presence/ endpoint
export function connectPresence(token, options = {}){
  const raw = normToken(token);
  // derive backend origin similar to httpClient logic
  const apiBase = (typeof window !== 'undefined' && window.__AGROVET_API_BASE) || null;
  let baseUrl;
  if (apiBase) {
    try { baseUrl = new URL(apiBase).origin; } catch (e) { baseUrl = apiBase; }
  } else {
    baseUrl = `${location.protocol}//${location.hostname}:8000`;
  }
  const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
  const host = (new URL(baseUrl)).host;
  const q = raw ? `?token=${encodeURIComponent(raw)}` : '';
  const url = `${wsProtocol}://${host}/ws/presence/${q}`;
  console.debug('[chat.service] connectPresence', { url, tokenPresent: !!raw, apiBase });

  let socket = null;
  let attemptedFallback = false;
  let aborted = false;
  const wsProtocolHost = `${wsProtocol}://${host}`;

  const makeUrl = (altHost) => `${wsProtocol}://${altHost || host}/ws/presence/${q}`;

  const doConnect = (h) => {
    const u = makeUrl(h);
    console.debug('[chat.service] connectPresence connecting', { url: u, tokenPresent: !!raw, apiBase });
    socket = new WebSocket(u);
    socket.onopen = (ev) => { console.debug('[chat.service] presence open', ev); if (options.onOpen) options.onOpen(ev); };
    socket.onmessage = (ev) => { console.debug('[chat.service] presence onmessage', ev); if (options.onMessage) options.onMessage(ev); };
    socket.onclose = (ev) => {
      console.debug('[chat.service] presence close', { ev, url: u, aborted });
      // if closed before open and not aborted, try a small fallback swap localhost <-> 127.0.0.1 once
      if (!aborted && socket && socket.readyState !== WebSocket.OPEN && !attemptedFallback) {
        attemptedFallback = true;
        try {
          const altHost = h.indexOf('localhost') !== -1 ? h.replace('localhost', '127.0.0.1') : (h.indexOf('127.0.0.1') !== -1 ? h.replace('127.0.0.1', 'localhost') : null);
          if (altHost) {
            console.debug('[chat.service] presence attempting fallback host', { from: h, to: altHost });
            setTimeout(() => doConnect(altHost), 120);
            return;
          }
        } catch (e) { console.debug('[chat.service] presence fallback failed', e); }
      }
      if (options.onClose && !aborted) options.onClose(ev);
    };
    socket.onerror = (ev) => { console.debug('[chat.service] presence error', ev); if (options.onError) options.onError(ev); };
  };

  doConnect(host);

  return {
    send: (data)=>{ if (!socket || socket.readyState !== WebSocket.OPEN) throw new Error('Socket not open'); const payload = typeof data === 'string' ? data : JSON.stringify(data); console.debug('[chat.service] presence send ->', payload); socket.send(payload); },
    disconnect: ()=>{ try{ aborted = true; socket && socket.close(); }catch(e){} socket=null; },
    isOpen: ()=> !!(socket && socket.readyState === WebSocket.OPEN),
    readyState: ()=> socket ? socket.readyState : -1
  };
}


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
