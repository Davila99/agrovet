// Factory that returns an onMessage handler for the chat websocket.
// The handler mirrors the previous inline implementation but is extracted
// so the main hook file stays small and imports this logic.
import { deriveStatusFromReceipts, upsertReceipt, findOptimisticIndex, createRoomFromMessage } from './chatUtils';

export function createOnMessageHandler({
  activeId,
  setRooms,
  markUserOnline,
  markUserOffline,
  getCurrentUserId,
  playNotifySound,
}) {
    return function onMessage(ev) {
    console.log("[WS][DEBUG] Mensaje recibido en cliente", {
      userId: getCurrentUserId && getCurrentUserId(),
      activeId,
      data: ev && ev.data,
    });
    try {
      let d = null;
      try {
        if (ev && typeof ev === "object" && ev.type) {
          d = ev;
        } else if (typeof ev === "string") {
          d = JSON.parse(ev);
        } else if (ev && typeof ev === "object" && ev.data) {
          d = JSON.parse(ev.data);
        } else {
          console.warn("[useChatSocket] onMessage unknown payload shape", ev);
          return;
        }
      } catch (parseErr) {
        console.error("[Chat WS] parse error", parseErr);
        return;
      }

      if (d.type === "presence.online")
        return markUserOnline(d.user_id || d.user);

      if (d.type === "message_update") {
        // debug logs removed for message_update
        const payload = d.message || {};
        const mid = String(payload.id || payload.message_id || payload.id);
        const receipts = Array.isArray(payload.receipts)
          ? payload.receipts
          : [];
        const me =
          typeof getCurrentUserId === "function" ? getCurrentUserId() : null;
        const roomId =
          payload.room_id ||
          payload.room ||
          d.room_id ||
          d.room ||
          String(activeId);
        // store update debug removed

        setRooms((prev) => {
          try {
            const copy = prev.slice();
            const idx = copy.findIndex((r) => String(r.id) === String(roomId));
            if (idx === -1) {
              let changed = false;
              for (let ri = 0; ri < copy.length; ri++) {
                const room = { ...(copy[ri] || {}) };
                const msgs = Array.isArray(room.messages)
                  ? room.messages.slice()
                  : [];
                for (let mi = 0; mi < msgs.length; mi++) {
                  const m = msgs[mi];
                  if (!m || !m.id) continue;
                    if (String(m.id) === mid) {
                      // merge receipts and other updated fields from payload
                      const merged = { ...m, ...(payload || {}), receipts };
                      try {
                        // preserve existing media_spectrum when payload doesn't include it
                        if ((merged.media_spectrum === null || merged.media_spectrum === undefined) && m.media_spectrum) {
                          merged.media_spectrum = m.media_spectrum;
                        }
                      } catch (e) {}
                      try {
                        // diagnostic: log whether merged message carries a spectrum
                        console.log('[ROOM_UPDATE] (updateMessage) merged media_spectrum for mid=', mid, 'room=', copy[ri] && copy[ri].id, 'hasSpectrum=', Array.isArray(merged.media_spectrum) ? merged.media_spectrum.length : !!merged.media_spectrum);
                      } catch (e) {}
                      try {
                        const newStatus = deriveStatusFromReceipts(receipts, me);
                        merged.status = newStatus;
                      } catch (e) {}
                      msgs[mi] = merged;
                      room.messages = msgs;
                      copy[ri] = room;
                      changed = true;
                    }
                }
              }
              return changed ? copy : prev;
            }

            const room = { ...(copy[idx] || {}) };
            const msgs = Array.isArray(room.messages)
              ? room.messages.slice()
              : [];
            let changedLocal = false;
            for (let mi = 0; mi < msgs.length; mi++) {
              const m = msgs[mi];
              if (!m || !m.id) continue;
                if (String(m.id) === mid) {
                try {
                  const newStatus = deriveStatusFromReceipts(receipts, me);
                  // merge incoming payload fields into stored message
                  const mergedMsg = { ...m, ...(payload || {}), receipts, status: newStatus };
                  // preserve existing spectrum if payload didn't include it
                  if ((mergedMsg.media_spectrum === null || mergedMsg.media_spectrum === undefined) && m.media_spectrum) {
                    mergedMsg.media_spectrum = m.media_spectrum;
                  }
                  try {
                    console.log('[ROOM_UPDATE] (updateMessage) mergedMsg media_spectrum for mid=', mid, 'room=', room && room.id, 'hasSpectrum=', Array.isArray(mergedMsg.media_spectrum) ? mergedMsg.media_spectrum.length : !!mergedMsg.media_spectrum);
                  } catch (e) {}
                  msgs[mi] = mergedMsg;
                } catch (e) {
                  const mergedMsg = { ...m, ...(payload || {}), receipts };
                  if ((mergedMsg.media_spectrum === null || mergedMsg.media_spectrum === undefined) && m.media_spectrum) {
                    mergedMsg.media_spectrum = m.media_spectrum;
                  }
                  msgs[mi] = mergedMsg;
                }
                changedLocal = true;
                break;
              }
            }
            if (!changedLocal) return prev;
            room.messages = msgs;
            copy[idx] = room;
            return copy;
          } catch (e) {
            return prev;
          }
        });
        // Also update chat list last message/time if possible (move room to top)
        try {
          const payload = d.message || {};
          const mid = payload.id || payload.message_id || null;
          const roomId = payload.room_id || payload.room || d.room_id || d.room || null;
          try { console.log('[CHAT_LIST] ⚡ Recibido message_update:', { id: mid, room: roomId }); } catch (e) {}

          if (roomId) {
            // try to get text from payload or debug store
            let lastText = payload.text || null;
            try {
              if (!lastText && typeof window !== 'undefined' && window._agrovet_chat_store && typeof window._agrovet_chat_store.getMessageById === 'function') {
                const existing = window._agrovet_chat_store.getMessageById(mid);
                if (existing && existing.text) lastText = existing.text;
              }
            } catch (e) {}
            if (!lastText) lastText = '📩 Mensaje nuevo';

            const lastTs = payload.timestamp || new Date().toISOString();
            setRooms((prev) => {
              try {
                const copy = prev.slice();
                const idx = copy.findIndex((r) => String(r.id) === String(roomId));
                const newRoom = idx === -1 ? null : { ...(copy[idx] || {}) };
                if (!newRoom) {
                  // If room not present, insert it at top
                  const toInsert = {
                    id: String(roomId),
                    name: 'Chat ' + String(roomId),
                    avatar: '',
                    participants: [],
                    messages: [],
                    lastMessage: lastText,
                    last_activity: lastTs,
                    unread: true,
                  };
                  return [toInsert, ...copy];
                }
                // update existing room and move to top
                newRoom.lastMessage = lastText || newRoom.lastMessage;
                newRoom.last_activity = lastTs || newRoom.last_activity;
                newRoom.unread = !!newRoom.unread || true;
                const others = copy.filter((r) => String(r.id) !== String(roomId));
                return [newRoom, ...others];
              } catch (e) { return prev; }
            });

            try { console.log('[CHAT_LIST] 🔔 Actualizada bandeja por message_update:', { room: roomId, lastMessage: lastText }); } catch (e) {}
          }
        } catch (e) {}
        return;
      }

      if (d.type === "status_update") {
        // status_update debug removed
        const mid = d.message_id || d.messageId || d.id || null;
        const userId = d.user_id || d.userId || null;
        const roomId = d.room_id || d.room || String(activeId);
        const status = d.status || null;
        try {
          const current =
            typeof getCurrentUserId === "function" ? getCurrentUserId() : null;
          if (current && userId && String(current) === String(userId)) return;
        } catch (e) {}

        if (mid) {
          try {
            if (
              typeof window !== "undefined" &&
              window._agrovet_chat_store &&
              typeof window._agrovet_chat_store.updateMessage === "function"
            ) {
              try {
                window._agrovet_chat_store.updateMessage(mid, [], roomId);
              } catch (e) {}
            }
          } catch (e) {}

          setRooms((prev) => {
            try {
              const copy = prev.slice();
              const idx = copy.findIndex(
                (r) => String(r.id) === String(roomId)
              );
              if (idx === -1) return prev;
              const room = { ...(copy[idx] || {}) };
              const msgs = Array.isArray(room.messages)
                ? room.messages.slice()
                : [];
              let changed = false;
              for (let mi = 0; mi < msgs.length; mi++) {
                const m = msgs[mi];
                if (!m || !m.id) continue;
                if (String(m.id) !== String(mid)) continue;
                const receipts = upsertReceipt(m.receipts, userId, status);
                const newStatus = deriveStatusFromReceipts(receipts, null);
                msgs[mi] = { ...m, receipts, status: newStatus };
                changed = true;
                break;
              }
              if (!changed) return prev;
              room.messages = msgs;
              copy[idx] = room;
              return copy;
            } catch (e) {
              return prev;
            }
          });
        }
        return;
      }

      if (d.type === "presence.offline")
        return markUserOffline(d.user_id || d.user);

      if (d.type && d.type.startsWith("chat.")) {
        try {
          if (
            d.type === "chat.read" ||
            d.type === "chat.delivery" ||
            d.type === "chat.message.read" ||
            d.type === "chat.message.delivered" ||
            d.type === "message_seen" ||
            d.type === "message_delivered"
          ) {
            // receipt event debug removed
            setRooms((prev) => {
              try {
                const idx = prev.findIndex(
                  (r) => String(r.id) === String(activeId)
                );
                if (idx === -1) return prev;
                const copy = prev.slice();
                const room = { ...(copy[idx] || {}) };
                const msgs = Array.isArray(room.messages)
                  ? room.messages.slice()
                  : [];
                const targetIds = Array.isArray(d.message_ids)
                  ? d.message_ids.map(String)
                  : d.message_id
                  ? [String(d.message_id)]
                  : [];
                if (!targetIds.length && d.message_id)
                  targetIds.push(String(d.message_id));
                if (targetIds.length) {
                  const receiptStatus =
                    d.type === "chat.read" ||
                    d.type === "chat.message.read" ||
                    Boolean(d.read)
                      ? "read"
                      : d.type === "chat.delivery" ||
                        d.type === "chat.message.delivered" ||
                        Boolean(d.delivered)
                      ? "delivered"
                      : null;
                  for (let mi = 0; mi < msgs.length; mi++) {
                    const m = msgs[mi];
                    if (!m || !m.id) continue;
                    if (!targetIds.includes(String(m.id))) continue;
                    const newReceipts = receiptStatus
                      ? upsertReceipt(m.receipts, d.user_id, receiptStatus)
                      : m.receipts || [];
                    msgs[mi] = { ...m, receipts: newReceipts };
                  }
                }
                room.messages = msgs;
                copy[idx] = room;
                // message receipts update debug removed
                return copy;
              } catch (e) {
                return prev;
              }
            });
            return;
          }
        } catch (e) {}

        // raw WS payload debug removed
        // If we already have a global debug store that will add incoming
        // messages and notify subscribers, avoid duplicating work here.
        if (typeof window !== 'undefined' && window._agrovet_chat_store && typeof window._agrovet_chat_store.addIncomingMessage === 'function') {
          // Let the debug store + subscribers handle chat.message insertion
          return;
        }

        const msg = {
          id: d.message_id || d.id || "msg_" + Date.now(),
          sender_id: d.sender_id || d.sender || (d.sender && d.sender.id),
          text: d.message || d.content || d.text || "",
          timestamp: d.timestamp || d.created_at || new Date().toISOString(),
          fromMe: String(d.sender_id) === String(getCurrentUserId()) || false,
          receipts: d.receipts || [],
          client_msg_id: d.client_msg_id || null,
          media_url: d.media_url || d.mediaUrl || d.media || null,
          media_id: d.media_id || d.mediaId || null,
          media_spectrum: d.media_spectrum || d.mediaSpectrum || null,
        };

        // spectrum received debug removed

        try {
          if (typeof msg.media_spectrum === "string") {
            const s = msg.media_spectrum.trim();
            if (s.startsWith("[") || s.startsWith("{")) {
              try {
                const parsed = JSON.parse(s);
                if (Array.isArray(parsed)) msg.media_spectrum = parsed;
                else if (
                  parsed &&
                  parsed.spectrum &&
                  Array.isArray(parsed.spectrum)
                )
                  msg.media_spectrum = parsed.spectrum;
              } catch (e) {}
            }
          }
          // spectrum normalized debug removed
        } catch (e) {}

        try {
          const incomingRoom = d.room_id || d.room || null;
          const focused =
            typeof document !== "undefined"
              ? document.hasFocus && document.hasFocus()
              : true;
          const notFocused =
            typeof document !== "undefined"
              ? document.hidden || !focused
              : false;
          const isDifferentRoom =
            incomingRoom && String(incomingRoom) !== String(activeId);
          if (!msg.fromMe && (notFocused || isDifferentRoom)) playNotifySound();
        } catch (e) {}

        // parsed message debug removed
        const incomingRoom =
          d.room_id ||
          d.room ||
          (d.message && (d.message.room || d.message.room_id)) ||
          null;
        // incoming message store debug removed

        setRooms((prev) => {
          try {
            const roomIdToFind = incomingRoom
              ? String(incomingRoom)
              : String(activeId);
            const idx = prev.findIndex((r) => String(r.id) === roomIdToFind);
            if (idx === -1) {
              // incoming room not found in state: create a new room if this
              // message actually came with an incomingRoom (don't create when
              // roomIdToFind is derived from activeId fallback).
              if (!incomingRoom) {
                return prev;
              }
              try {
                const currentUserId = typeof getCurrentUserId === 'function' ? getCurrentUserId() : null;
                const newRoom = createRoomFromMessage(roomIdToFind, msg, currentUserId);
                try { console.log('[CHAT_LIST] Creando nueva room automáticamente:', roomIdToFind, 'msgId=', msg && msg.id); } catch (e) {}
                return [newRoom, ...prev];
              } catch (e) {
                return prev;
              }
            }
            const copy = prev.slice();
            const room = { ...(copy[idx] || {}) };
            const msgs = Array.isArray(room.messages)
              ? room.messages.slice()
              : [];
            try { console.log('[ROOM_UPDATE] (chat.message) room', roomIdToFind, 'before msgs:', msgs.length, 'incoming msg id:', msg.id); } catch (e) {}
            if (msgs.some((m) => String(m.id) === String(msg.id))) return prev;

            // Use shared heuristic util to find optimistic index
            let optIdx = findOptimisticIndex(msgs, msg);

            if (optIdx !== -1) {
              try {
                const prevMsg = msgs[optIdx];
                try {
                  if (prevMsg) {
                    if (
                      (!msg.media_spectrum || msg.media_spectrum === null) &&
                      prevMsg.media_spectrum
                    )
                      msg.media_spectrum = prevMsg.media_spectrum;
                    if (
                      (!msg.media_url || msg.media_url === null) &&
                      prevMsg.media_url
                    )
                      msg.media_url = prevMsg.media_url;
                    if (
                      prevMsg &&
                      prevMsg.media_url &&
                      typeof prevMsg.media_url === "string" &&
                      prevMsg.media_url.startsWith("blob:") &&
                      msg.media_url &&
                      !msg.media_url.startsWith("blob:")
                    ) {
                      try {
                        URL.revokeObjectURL(prevMsg.media_url);
                      } catch (e) {}
                    }
                  }
                } catch (e) {}
                msgs[optIdx] = msg;
                // replaced optimistic message debug removed
              } catch (e) {}
            } else {
              msgs.push(msg);
            }

            room.messages = msgs;
            try { console.log('[ROOM_UPDATE] (chat.message) room', roomIdToFind, 'after msgs:', msgs.length, 'added id:', msg.id); } catch (e) {}
            room.lastMessage = msg.text || room.lastMessage;
            room.last_activity = msg.timestamp || room.last_activity;
            // mark unread when message comes from other user, but don't mark unread
            // if the room is currently active (we'll send/read receipts elsewhere)
            try {
              const isActiveRoom = String(roomIdToFind) === String(activeId);
              room.unread = isActiveRoom ? false : (!!room.unread || (!msg.fromMe));
            } catch (e) {
              room.unread = !!room.unread || (!msg.fromMe);
            }
            copy[idx] = room;

            const sorted = copy.slice().sort((a, b) => {
              const ta =
                new Date(
                  a.last_activity ||
                    (a.messages && a.messages.length
                      ? a.messages[a.messages.length - 1].timestamp
                      : 0)
                ).getTime() || 0;
              const tb =
                new Date(
                  b.last_activity ||
                    (b.messages && b.messages.length
                      ? b.messages[b.messages.length - 1].timestamp
                      : 0)
                ).getTime() || 0;
              return tb - ta;
            });

            try {
              const isActiveRoom = String(roomIdToFind) === String(activeId);
              try { console.log('[CHAT_LIST] 🔔 Actualizada bandeja para room:', roomIdToFind, { lastMessage: room.lastMessage, unread: room.unread }); } catch (e) {}

              if (
                isActiveRoom &&
                !msg.fromMe &&
                typeof window !== "undefined" &&
                window._agrovet_chat_service &&
                typeof window._agrovet_chat_service.send === "function"
              ) {
                try {
                  // Inform server that the active room was read. Use the
                  // canonical 'mark_read' event so the server persists the
                  // read state and broadcasts receipts to other clients.
                  window._agrovet_chat_service.send({ type: 'mark_read', room: activeId });
                } catch (e) {}
                try {
                  const me =
                    typeof getCurrentUserId === "function"
                      ? getCurrentUserId()
                      : null;
                  const nowIso = new Date().toISOString();
                  if (
                    me &&
                    window._agrovet_chat_store &&
                    typeof window._agrovet_chat_store.updateMessage ===
                      "function"
                  ) {
                    const existingReceipts = upsertReceipt(
                      Array.isArray(msg.receipts) ? msg.receipts.slice() : [],
                      me,
                      "read"
                    );
                    try {
                      window._agrovet_chat_store.updateMessage(
                        msg.id,
                        existingReceipts,
                        activeId
                      );
                    } catch (e) {}
                  }
                  if (me) {
                    setRooms((prevR) => {
                      try {
                        const copyR = prevR.slice();
                        const idxR = copyR.findIndex(
                          (r) => String(r.id) === String(activeId)
                        );
                        if (idxR === -1) return prevR;
                        const roomR = { ...(copyR[idxR] || {}) };
                        const msgsR = Array.isArray(roomR.messages)
                          ? roomR.messages.slice()
                          : [];
                        for (let mi = 0; mi < msgsR.length; mi++) {
                          if (String(msgsR[mi].id) === String(msg.id)) {
                            let receipts = Array.isArray(msgsR[mi].receipts)
                              ? msgsR[mi].receipts.slice()
                              : [];
                            receipts = upsertReceipt(receipts, me, "read");
                            const newStatus = deriveStatusFromReceipts(
                              receipts,
                              null
                            );
                            msgsR[mi] = {
                              ...msgsR[mi],
                              receipts,
                              status: newStatus,
                            };
                            break;
                          }
                        }
                        roomR.messages = msgsR;
                        copyR[idxR] = roomR;
                        return copyR;
                      } catch (e) {
                        return prevR;
                      }
                    });
                  }
                } catch (e) {}
              }
            } catch (e) {}

            try { console.log('[ROOM_UPDATE] (chat.message) msg.media_spectrum:', msg.media_spectrum); } catch (e) {}
            return sorted;
          } catch (e) {
            return prev;
          }
        });

        if ((msg.media_id || msg.media_id === 0) && !msg.media_spectrum) {
          (async () => {
            try {
              const apiBase =
                typeof window !== "undefined" && window.__AGROVET_API_BASE
                  ? String(window.__AGROVET_API_BASE).replace(/\/$/, "")
                  : `${location.protocol}//${location.hostname}${
                      location.port ? ":" + location.port : ""
                    }`;
              const url = `${apiBase}/api/media/media/${encodeURIComponent(
                msg.media_id
              )}/`;
              const raw = localStorage.getItem("token");
              const token = raw
                ? raw.replace(/^Token\s*/i, "").replace(/^Bearer\s*/i, "")
                : null;
              const headers = token ? { Authorization: `Token ${token}` } : {};
              const resp = await fetch(url, { headers });
              if (!resp.ok) return;
              const data = await resp.json();
              let descr = data && (data.description || data.desc || null);
              if (descr) {
                try {
                  const parsed =
                    typeof descr === "string" ? JSON.parse(descr) : descr;
                  if (Array.isArray(parsed) && parsed.length) {
                    try { console.log('[MEDIA_FETCH] fetched spectrum for msg.id=', msg.id, 'length=', Array.isArray(parsed) ? parsed.length : 0); } catch (e) {}
                    // compute a best-effort target room id (incomingRoom may be null)
                    const targetRoomId = incomingRoom
                      ? String(incomingRoom)
                      : String(activeId);
                    setRooms((prev2) => {
                      try {
                        const copy2 = prev2.slice();
                        // First: try to find the message across all rooms and update it in-place
                        for (let ri = 0; ri < copy2.length; ri++) {
                          const r = { ...(copy2[ri] || {}) };
                          const msgs2 = Array.isArray(r.messages)
                            ? r.messages.slice()
                            : [];
                          const mIdx = msgs2.findIndex(
                            (mm) => String(mm.id) === String(msg.id)
                          );
                          if (mIdx !== -1) {
                            msgs2[mIdx] = { ...(msgs2[mIdx] || {}), media_spectrum: parsed, __spectrum_updated_at: new Date().toISOString() };
                            try { console.log('[ROOM_UPDATE] applied fetched spectrum to msg', msg.id, 'room=', copy2[ri] && copy2[ri].id); } catch (e) {}
                            r.messages = msgs2;
                            copy2[ri] = r;
                            return copy2;
                          }
                        }

                        // Fallback: if message wasn't present, try to find the target room and append
                        const idx2 = copy2.findIndex(
                          (r) => String(r.id) === String(targetRoomId)
                        );
                        if (idx2 === -1) return prev2;
                        const room2 = { ...(copy2[idx2] || {}) };
                        const msgs2 = Array.isArray(room2.messages)
                          ? room2.messages.slice()
                          : [];
                        const mIdx = msgs2.findIndex(
                          (mm) => String(mm.id) === String(msg.id)
                        );
                        if (mIdx !== -1) {
                          msgs2[mIdx] = { ...(msgs2[mIdx] || {}), media_spectrum: parsed, __spectrum_updated_at: new Date().toISOString() };
                        } else {
                          msgs2.push({ ...(msg || {}), media_spectrum: parsed, __spectrum_updated_at: new Date().toISOString() });
                        }
                        room2.messages = msgs2;
                        copy2[idx2] = room2;
                        return copy2;
                      } catch (e) {
                        return prev2;
                      }
                    });
                  }
                } catch (e) {}
              }
            } catch (e) {}
          })();
        }
      }
    } catch (e) {
      console.error("[Chat WS] parse error", e);
    }
  };
}
