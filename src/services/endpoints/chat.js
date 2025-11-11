import { authHeaders } from "./utils";
import httpClient from "../httpClient";

export const chatAPI = {
  createRoom:
    (participants = [], isPrivate = false) =>
    ({ token } = {}) => {
      // debug logs removed
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

  listRooms: ({ token } = {}) => {
    // debug logs removed
    return httpClient("/chat/rooms/", {
      method: "GET",
      headers: authHeaders(token),
    });
  },

  sendMessage: (room, content, opts = {}) => ({ token } = {}) => {
    const media_id = opts.media_id;
    const media_url = opts.media_url;
    const client_msg_id = opts.client_msg_id;
    // debug logs removed
    const body = { room, content };
    if (media_id) body.media = media_id;
    if (media_url) body.media_url = media_url;
    if (client_msg_id) body.client_msg_id = client_msg_id;
    return httpClient("/chat/messages/", {
      method: "POST",
      headers: authHeaders(token),
      body,
    });
  },

  getLastMessages:
    (room, limit = 50) =>
    ({ token } = {}) => {
      // Defensive: if room is missing or literally the string 'null'/'undefined', fail fast
      if (room === null || room === undefined || String(room).toLowerCase() === 'null' || String(room).toLowerCase() === 'undefined' || String(room).trim() === '') {
        return Promise.reject(new Error("Invalid 'room' parameter"));
      }

      return httpClient(
        `/chat/messages/last_messages/?room=${encodeURIComponent(room)}&limit=${encodeURIComponent(limit)}`,
        {
          method: "GET",
          headers: authHeaders(token),
        }
      );
    },
  markRead: (room) => ({ token } = {}) => {
    if (room === null || room === undefined || String(room).toLowerCase() === 'null' || String(room).toLowerCase() === 'undefined' || String(room).trim() === '') {
      return Promise.reject(new Error("Invalid 'room' parameter"));
    }
    return httpClient(`/chat/messages/mark_read/`, {
      method: 'POST',
      headers: authHeaders(token),
      body: { room },
    });
  },
};

const resolveWsBase = () => {
  if (typeof window === "undefined") return null;

  const apiBase =
    typeof window !== "undefined" && window.__AGROVET_API_BASE
      ? String(window.__AGROVET_API_BASE).replace(/\/$/, "")
      : null;

  if (apiBase) {
    try {
      return new URL(apiBase).origin;
    } catch (e) {
      console.warn("[resolveWsBase] Error parseando apiBase:", e);
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
  let _currentRoom = null;

  const connect = (room, token, handlers = {}) => {
    try {
      // Defensive: do not attempt to connect to a 'null' or invalid room id
      if (room === null || room === undefined || String(room).toLowerCase() === 'null' || String(room).toLowerCase() === 'undefined' || String(room).trim() === '') {
        try { console.warn('[SOCKET] 🚫 connect called with invalid room, aborting:', room); } catch (e) {}
        return;
      }
      const base = resolveWsBase();
      const proto = base && String(base).startsWith("https") ? "wss" : "ws";
      const host = base ? new URL(base).host : `${location.hostname}:${location.port || 80}`;
      const q = token ? `?token=${encodeURIComponent(token)}` : "";
      const url = `${proto}://${host}/ws/chat/${encodeURIComponent(room)}/${q}`;

      // Prevent opening duplicate WS connections for the same room
      if (ws && opened && _currentRoom && String(_currentRoom) === String(room)) {
        return;
      }
      // If there's an existing connection for a different room, close it first
      if (ws && opened && _currentRoom && String(_currentRoom) !== String(room)) {
        try { ws.close(); } catch (e) {}
        ws = null;
        opened = false;
      }

  // Lifecycle log: only log when initiating a new connection
  try { console.log('[SOCKET] 🚀 Conectando WS:', url); } catch (e) {}

      ws = new WebSocket(url);
  _currentRoom = room;

      ws.onopen = (ev) => {
        opened = true;
        try { console.log('[SOCKET] ✅ Conexión abierta con servidor'); } catch (e) {}
        handlers.onOpen && handlers.onOpen(ev);
        try { window._agrovet_chat_service = { send, disconnect }; } catch (e) {}
      };

      ws.onmessage = (ev) => {
        try {
          const raw = ev.data;
          let parsed = null;
          try { parsed = JSON.parse(raw); } catch (e) { /* not JSON */ }

          if (parsed) {
            try { console.log('[RECV] 📦 Mensaje WebSocket recibido:', parsed.type, parsed); } catch (e) {}

            if (parsed.type === 'chat.message' || parsed.type === 'chat.message' || parsed.type === 'message') {
              try {
                const incoming = (parsed.message && typeof parsed.message === 'object') ? parsed.message : parsed;
                const room = incoming.room || incoming.room_id || parsed.room || parsed.room_id || null;
                try { console.log('[RECV] 💬 chat.message recibido:', { room: room, id: incoming.id || incoming.message_id, sender: incoming.sender_id, text: incoming.text }); } catch (e) {}
                // If we have an optimistic message stored with media (blob preview) and the
                // server message arrives without media fields, try to merge/preserve the optimistic
                // media fields so the UI doesn't blink to empty. We attempt multiple lookups:
                // 1) getMessageById(serverId)
                // 2) if incoming contains client_msg_id, scan the room's debug dump for a matching optimistic message
                try {
                  if (typeof window !== 'undefined' && window._agrovet_chat_store) {
                    const store = window._agrovet_chat_store;
                    const sid = incoming && (incoming.id || incoming.message_id);
                    let existing = null;
                    try {
                      if (sid && typeof store.getMessageById === 'function') existing = store.getMessageById(sid);
                    } catch (e) {}

                    // If not found by server id, and we have a client_msg_id, try to locate
                    // the optimistic message in the same room via dumpRoom(room)
                    try {
                      const clientCid = incoming && (incoming.client_msg_id || incoming.clientMsgId || incoming.client_message_id || null);
                      const roomHint = room || (incoming && (incoming.room || incoming.room_id || incoming.roomId)) || null;
                      if (!existing && clientCid && roomHint && typeof store.dumpRoom === 'function') {
                        try {
                          const dump = store.dumpRoom(String(roomHint)) || [];
                          for (const m of dump) {
                            if (!m) continue;
                            if (m.client_msg_id && String(m.client_msg_id) === String(clientCid)) { existing = m; break; }
                            if (m.clientMsgId && String(m.clientMsgId) === String(clientCid)) { existing = m; break; }
                          }
                          if (existing) try { console.info('[RECV] matched incoming by client_msg_id', { room: roomHint, client_msg_id: clientCid, serverId: sid }); } catch(e){}
                        } catch (e) {}
                      }
                    } catch (e) {}

                    if (existing) {
                      try {
                        const hasExistingPreview = existing.media_url && typeof existing.media_url === 'string' && existing.media_url.startsWith('blob:');
                        const incomingHasMedia = (incoming.media_url || incoming.media || incoming.mediaUrl || incoming.media_id || incoming.mediaId);
                        if (hasExistingPreview && !incomingHasMedia) {
                          incoming.media_url = incoming.media_url || existing.media_url || existing.previewUrl || existing.mediaUrl;
                          incoming.mediaUrl = incoming.mediaUrl || incoming.media_url;
                          incoming.previewUrl = incoming.previewUrl || incoming.media_url;
                          incoming.media_spectrum = incoming.media_spectrum || existing.media_spectrum || (existing.media && existing.media.description) || null;
                          incoming.media_id = incoming.media_id || incoming.media || existing.media_id || existing.media || null;
                          try { console.info('[RECV] preserved optimistic media fields onto incoming server message', { serverId: sid, client_msg_id: incoming.client_msg_id || null }); } catch(e){}
                        }
                      } catch (e) {}
                    }
                  }
                } catch (e) {}
                if (window._agrovet_chat_store && typeof window._agrovet_chat_store.addIncomingMessage === 'function') {
                  // If sender provided a small data-url preview, prefer that for
                  // receivers since blob: URLs are not valid across clients.
                  try {
                    if (incoming && incoming.preview_data_url) {
                      incoming.media_url = incoming.preview_data_url;
                      incoming.previewUrl = incoming.preview_data_url;
                      incoming.media_uploading = incoming.media_uploading || true;
                    }
                  } catch (e) {}
                  window._agrovet_chat_store.addIncomingMessage(incoming);
                }
              } catch (e) { console.warn('[chatService] _agrovet_chat_store.addIncomingMessage failed', e); }
            }

            if (parsed.type === 'message_update' || parsed.type === 'message.update') {
              try { console.log('[RECV] 🔄 message_update recibido:', { id: parsed.message_id || (parsed.message && parsed.message.id), receipts: parsed.receipts || (parsed.message && parsed.message.receipts) }); } catch (e) {}
              try {
                if (window._agrovet_chat_store && typeof window._agrovet_chat_store.updateMessage === 'function') {
                  window._agrovet_chat_store.updateMessage(parsed.message || { id: parsed.message_id, receipts: parsed.receipts }, parsed.receipts, parsed.room_id || parsed.room);
                }
              } catch (e) { console.warn('[chatService] _agrovet_chat_store.updateMessage failed', e); }
            }

            handlers.onMessage && handlers.onMessage(parsed);
          } else {
            handlers.onMessage && handlers.onMessage(ev);
          }
        } catch (e) {
          console.error('[RECV] ❌ Error parseando mensaje WS:', e, ev && ev.data);
        }
      };

      ws.onclose = (ev) => {
        opened = false;
        try { console.warn('[SOCKET] ⚠️ Conexión cerrada:', ev); } catch (e) {}
        handlers.onClose && handlers.onClose(ev);
      };

      ws.onerror = (ev) => {
        try { console.error('[SOCKET] ❌ Error de conexión:', ev); } catch (e) {}
        handlers.onError && handlers.onError(ev);
      };
    } catch (e) {
      console.error("[chatService.connect] Exception:", e);
      handlers.onError && handlers.onError(e);
    }
  };

  const disconnect = () => {
    if (ws) {
      try { console.log('[SOCKET] 🔌 Desconectando WS'); } catch (e) {}
      ws.close();
      ws = null;
      _currentRoom = null;
      opened = false;
      try { if (window._agrovet_chat_service && window._agrovet_chat_service.disconnect === disconnect) delete window._agrovet_chat_service; } catch (e) {}
    }
  };

  // expose internal state for debugging
  const _internal = () => ({ ws, opened, _currentRoom });

  const send = (msg) => {
    try {
      if (!ws) return;
      const payload = typeof msg === "string" ? msg : JSON.stringify(msg);
      ws.send(payload);
    } catch (e) {
      console.error("[chatService] Error enviando mensaje:", e);
    }
  };

  return { connect, disconnect, send };
}

export function connectPresence(token, handlers = {}) {
  let ws = null;
  try {
    const base = resolveWsBase();
    const proto = base && String(base).startsWith("https") ? "wss" : "ws";
    const host = base ? new URL(base).host : `${location.hostname}:${location.port || 80}`;
    const q = token ? `?token=${encodeURIComponent(token)}` : "";
    const url = `${proto}://${host}/ws/presence/${q}`;

    console.log("[connectPresence] Conectando a:", url, "con token:", token);

    ws = new WebSocket(url);

    ws.onopen = (ev) => {
      console.log("[Presence] ✅ WS abierto");
      handlers.onOpen && handlers.onOpen(ev);
    };
    ws.onmessage = (ev) => {
      console.log("[Presence] 📥 Mensaje:", ev.data);
      handlers.onMessage && handlers.onMessage(ev);
    };
    ws.onclose = (ev) => {
      console.warn("[Presence] ❌ WS cerrado:", ev);
      handlers.onClose && handlers.onClose(ev);
    };
    ws.onerror = (ev) => {
      console.error("[Presence] ⚠️ WS error:", ev);
      handlers.onError && handlers.onError(ev);
    };
  } catch (e) {
    console.error("[connectPresence] Exception:", e);
    handlers.onError && handlers.onError(e);
  }

  return {
    disconnect: () => {
      console.log("[Presence] 🔌 Cerrando WS");
      try {
        if (ws) ws.close();
      } catch (e) {
        console.error("[Presence] Error al cerrar:", e);
      }
    },
    send: (m) => {
      try {
        if (!ws) return;
        const payload = typeof m === "string" ? m : JSON.stringify(m);
        console.log("[Presence] 🚀 Enviando:", payload);
        ws.send(payload);
      } catch (e) {
        console.error("[Presence] Error enviando:", e);
      }
    },
  };
}

// Lightweight global debug store to help trace incoming message updates and
// allow quick subscription from components during debugging.
if (typeof window !== 'undefined' && !window._agrovet_chat_store) {
  window._agrovet_chat_store = (function createDebugStore() {
    const callbacks = new Set();
    // internal map: roomId -> Map(messageId -> message)
    const rooms = new Map();

    function ensureRoomMap(roomId) {
      if (!rooms.has(String(roomId))) rooms.set(String(roomId), new Map());
      return rooms.get(String(roomId));
    }

    return {
      // Retrieve a message by id from internal debug store (returns null if not found)
      getMessageById(id) {
        try {
          if (!id) return null;
          const sid = String(id);
          for (const [rid, map] of rooms.entries()) {
            try {
              if (map && typeof map.get === 'function' && map.has(sid)) return map.get(sid) || null;
            } catch (e) {}
          }
          return null;
        } catch (e) { return null; }
      },

      // Update or add a message in internal store and notify subscribers
      // updateMessage accepts either a message object OR (messageId, receipts, roomId)
      updateMessage(msgOrId, receiptsArg, roomIdArg) {
        try {
          let msg = null;
          if (msgOrId && typeof msgOrId === 'object') {
            msg = msgOrId;
          } else {
            // called as updateMessage(mid, receipts, roomId)
            msg = { id: msgOrId, receipts: receiptsArg, room: roomIdArg };
          }

          const mid = msg && (msg.id || msg.message_id);
          const roomId = msg && (msg.room || msg.room_id || msg.roomId) || (typeof window !== 'undefined' && window.__AGROVET_ACTIVE_ROOM) || null;
          // removed noisy updateMessage debug log to reduce console noise

          if (!mid) {
            console.warn('[STORE] 🧩 updateMessage sin message id, ignorando', msg);
            return;
          }

          if (!roomId) {
            // If no roomId provided, attempt to locate the message across
            // existing rooms by scanning the internal maps. This helps when
            // some producers send receipts without a room hint.
            try {
              for (const [rid, map] of rooms.entries()) {
                if (map && typeof map.has === 'function' && map.has(String(mid))) {
                  const existingFound = map.get(String(mid)) || {};
                  const nextFound = { ...existingFound, ...(msg || {}) };
                  if (Array.isArray(msg.receipts) && msg.receipts.length) nextFound.receipts = msg.receipts;
                  map.set(String(mid), nextFound);
                  // notify subscribers about the located update
                  callbacks.forEach((cb) => {
                    try { cb({ type: 'updateMessage', message: nextFound }); } catch (e) { console.warn('[STORE] subscriber cb failed', e); }
                  });
                  // debug removed: located message in room
                  return;
                }
              }
            } catch (e) {
              console.warn('[STORE] scan-for-mid failed', e);
            }
            console.warn('[STORE] ⚠️ updateMessage sin roomId y no localizado, ignorando', msg);
            return;
          }

          const target = String(roomId);
          const rm = ensureRoomMap(target);
          const existing = rm.get(String(mid)) || {};
          const next = { ...existing, ...(msg || {}) };

          // prefer incoming receipts when present
          if (Array.isArray(msg.receipts) && msg.receipts.length) {
            next.receipts = msg.receipts;
            // derive simple status from receipts
            try {
              const receipts = msg.receipts || [];
              // exclude current user's own receipt when deriving overall status
              let currentUserId = null;
              try { currentUserId = (typeof window !== 'undefined' && localStorage.getItem('userId')) ? String(localStorage.getItem('userId')) : null; } catch (e) { currentUserId = null; }
              const filtered = receipts.filter(r => !(r && currentUserId && String(r.user_id) === String(currentUserId)));
              const anyRead = filtered.some(r => r && (r.read === true || r.read === 'true'));
              const allDelivered = filtered.length && filtered.every(r => r && (r.delivered === true || r.delivered === 'true'));
              if (anyRead) next.status = 'read';
              else if (allDelivered) next.status = 'delivered';
              else next.status = 'sent';
            } catch (e) {
              console.warn('[STORE] error deriving status from receipts', e);
            }
          }

          // deduplicate: if receipts unchanged, skip notifying subscribers
          try {
            const prevReceipts = existing && Array.isArray(existing.receipts) ? JSON.stringify(existing.receipts) : null;
            const newReceipts = next && Array.isArray(next.receipts) ? JSON.stringify(next.receipts) : null;
            if (prevReceipts !== null && newReceipts !== null && prevReceipts === newReceipts) {
              // receipts identical - skip notify
              rm.set(String(mid), next);
              return;
            }
          } catch (e) {
            // ignore comparison errors and continue
          }

          rm.set(String(mid), next);

          // notify subscribers
          callbacks.forEach((cb) => {
            try { cb({ type: 'updateMessage', message: next }); } catch (e) { console.warn('[STORE] subscriber cb failed', e); }
          });
        } catch (e) {
          console.error('[STORE] updateMessage error', e);
        }
      },

      // Add incoming message and notify subscribers; do not mutate external state here
      addIncomingMessage(msg) {
        try {
            const mid = msg && (msg.id || msg.message_id) || ('tmp_' + Date.now());
            // try multiple keys and a global active room fallback
            let roomId = (msg && (msg.room || msg.room_id || msg.roomId)) || (typeof window !== 'undefined' && window.__AGROVET_ACTIVE_ROOM) || null;
            try {
              // concise, structured incoming-message log for debugging UI flow
              console.log('[STORE] 📨 addIncomingMessage():', {
                mid: mid,
                roomId: roomId || (msg && (msg.room_id || msg.room)),
                text: msg && (msg.text || msg.content || ''),
                from_me: msg && (msg.from_me || msg.fromMe) || false,
              });
            } catch (e) {}
            if (!roomId) {
              // Defensive fallback: create a placeholder room id so the message is
              // not dropped silently. This makes the message visible immediately
              // in the UI; the room can be reconciled later when the server
              // provides the real room_id. Log prominently to help debugging.
              roomId = 'unknown_room_' + (msg && (msg.room || msg.room_id || msg.roomId) ? String(msg.room || msg.room_id || msg.roomId) : String(mid));
              try {
                console.warn('[STORE] ⚠️ addIncomingMessage: missing roomId, using placeholder', roomId, msg);
              } catch (e) {}
              // ensure message carries the fallback room so subscribers can locate it
              try { msg.room = msg.room || msg.room_id || roomId; } catch (e) {}
            }

          const rm = ensureRoomMap(String(roomId));
          rm.set(String(mid), msg);
          // notify subscribers
          callbacks.forEach((cb) => {
            try { cb({ type: 'addIncomingMessage', message: msg }); } catch (e) { console.warn('[STORE] subscriber cb failed', e); }
          });
          // avoid noisy counts; keep only critical logs
        } catch (e) {
          console.error('[STORE] addIncomingMessage error', e);
        }
      },

      // Subscribe to store updates. Callback receives objects like {type, message}
      subscribe(fn) {
        if (typeof fn === 'function') callbacks.add(fn);
        return () => callbacks.delete(fn);
      },

      unsubscribe(fn) {
        callbacks.delete(fn);
      },

      // For debugging: read a snapshot of messages for a room
      dumpRoom(roomId) {
        try {
          const rm = rooms.get(String(roomId));
          if (!rm) return [];
          return Array.from(rm.values());
        } catch (e) { return []; }
      }
    };
  })();
  // debug helper installed (removed noisy debug log)
}

