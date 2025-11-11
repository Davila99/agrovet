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
    // socket trace removed to reduce console noise
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

      if (d.type === "presence.online") {
        try {
          const raw = d.user_id || d.user || d.userId || null;
          const pid = raw && typeof raw === 'object' ? (raw.id || raw.user_id || raw.pk) : raw;
          return markUserOnline(pid);
        } catch (e) { return; }
      }

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
          null;
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
                      // If server/other client signals an uploading status, keep upload flags
                      try {
                        if ((payload && String(payload.status) === 'uploading') || payload && payload.media_uploading) {
                          merged.media_uploading = true;
                          merged.previewUrl = merged.previewUrl || payload.previewUrl || payload.media_url || merged.media_url || null;
                        }
                      } catch (e) {}
                      try {
                        // preserve existing media_spectrum when payload doesn't include it
                        if ((merged.media_spectrum === null || merged.media_spectrum === undefined) && m.media_spectrum) {
                          merged.media_spectrum = m.media_spectrum;
                        }
                      } catch (e) {}
                      try {
                        // diagnostic log suppressed to reduce noise
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
                  try {
                    if ((payload && String(payload.status) === 'uploading') || payload && payload.media_uploading) {
                      mergedMsg.media_uploading = true;
                      mergedMsg.previewUrl = mergedMsg.previewUrl || payload.previewUrl || payload.media_url || mergedMsg.media_url || null;
                    }
                  } catch (e) {}
                  // preserve existing spectrum if payload didn't include it
                  if ((mergedMsg.media_spectrum === null || mergedMsg.media_spectrum === undefined) && m.media_spectrum) {
                    mergedMsg.media_spectrum = m.media_spectrum;
                  }
                  try {
                    // diagnostic log suppressed to reduce noise
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
          try { /* chat_list update received (log suppressed) */ } catch (e) {}

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

            try { /* tray update suppressed */ } catch (e) {}
          }
        } catch (e) {}
        return;
      }

      if (d.type === "status_update") {
        // status_update debug removed
        const mid = d.message_id || d.messageId || d.id || null;
        const userId = d.user_id || d.userId || null;
  const roomId = d.room_id || d.room || null;
        const status = d.status || null;
        try {
          const current =
            typeof getCurrentUserId === "function" ? getCurrentUserId() : null;
          if (current && userId && String(current) === String(userId)) return;
        } catch (e) {}

        if (mid) {
          try {
            // If the WS status_update carries receipts, forward them to the
            // debug store. Avoid writing an empty receipts array which can
            // inadvertently clear persisted receipt state when the payload
            // doesn't include receipts.
            if (
              typeof window !== "undefined" &&
              window._agrovet_chat_store &&
              typeof window._agrovet_chat_store.updateMessage === "function"
            ) {
              const storeReceipts = Array.isArray(d.receipts)
                ? d.receipts
                : Array.isArray(d.message && d.message.receipts)
                ? d.message.receipts
                : null;
              if (storeReceipts) {
                try {
                  window._agrovet_chat_store.updateMessage(mid, storeReceipts, roomId);
                } catch (e) {}
              }
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

      if (d.type === "presence.offline") {
        try {
          const raw = d.user_id || d.user || d.userId || null;
          const pid = raw && typeof raw === 'object' ? (raw.id || raw.user_id || raw.pk) : raw;
          return markUserOffline(pid);
        } catch (e) { return; }
      }

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
            // receipt event: prefer room id from payload; if missing, search all rooms
            const targetRoomId = d.room_id || d.room || null;
            const targetIds = Array.isArray(d.message_ids)
              ? d.message_ids.map(String)
              : d.message_id
              ? [String(d.message_id)]
              : [];
            if (!targetIds.length && d.message_id) targetIds.push(String(d.message_id));
            if (!targetIds.length) return;

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

            setRooms((prev) => {
              try {
                const copy = prev.slice();
                let changed = false;

                if (targetRoomId) {
                  const idx = copy.findIndex((r) => String(r.id) === String(targetRoomId));
                  if (idx !== -1) {
                    const room = { ...(copy[idx] || {}) };
                    const msgs = Array.isArray(room.messages) ? room.messages.slice() : [];
                    for (let mi = 0; mi < msgs.length; mi++) {
                      const m = msgs[mi];
                      if (!m || !m.id) continue;
                      if (!targetIds.includes(String(m.id))) continue;
                      const newReceipts = receiptStatus ? upsertReceipt(m.receipts, d.user_id, receiptStatus) : m.receipts || [];
                      msgs[mi] = { ...m, receipts: newReceipts };
                      changed = true;
                    }
                    if (changed) {
                      room.messages = msgs;
                      copy[idx] = room;
                      return copy;
                    }
                  }
                  return prev;
                }

                // No room id: update any room that contains the target message ids
                for (let ri = 0; ri < copy.length; ri++) {
                  const room = { ...(copy[ri] || {}) };
                  const msgs = Array.isArray(room.messages) ? room.messages.slice() : [];
                  let roomChanged = false;
                  for (let mi = 0; mi < msgs.length; mi++) {
                    const m = msgs[mi];
                    if (!m || !m.id) continue;
                    if (!targetIds.includes(String(m.id))) continue;
                    const newReceipts = receiptStatus ? upsertReceipt(m.receipts, d.user_id, receiptStatus) : m.receipts || [];
                    msgs[mi] = { ...m, receipts: newReceipts };
                    roomChanged = true;
                  }
                  if (roomChanged) {
                    room.messages = msgs;
                    copy[ri] = room;
                    changed = true;
                  }
                }

                return changed ? copy : prev;
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
          // stable uid for rendering/dedupe (used elsewhere in client code)
          uid: (d.uid || d.message_uid || d.client_msg_id) ? (d.uid || d.message_uid || d.client_msg_id) : `${d.message_id || d.id || 'msg'}-${(d.timestamp || Date.now())}-${Math.random().toString(36).slice(2,8)}`,
          // Prefer explicit preview_data_url (base64/data:) when provided by sender
          media_url: d.preview_data_url || d.media_url || d.mediaUrl || d.media || null,
          previewUrl: d.preview_data_url || d.previewUrl || d.preview_url || null,
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
            // Determine the target room. If the server didn't include a room
            // id, try to match the incoming server message against any
            // optimistic message we have in state (client_msg_id / tmp_ heuristics).
            // This allows us to reconcile server acks for uploads without
            // blindly inserting messages into the currently active room.
            let roomIdToFind = incomingRoom ? String(incomingRoom) : null;
            let foundRoomIdx = -1;
            let foundOptIdx = -1;

            if (!roomIdToFind) {
              for (let ri = 0; ri < prev.length; ri++) {
                const candidate = prev[ri] || {};
                const msgsCandidate = Array.isArray(candidate.messages) ? candidate.messages.slice() : [];
                const idx = findOptimisticIndex(msgsCandidate, msg);
                if (idx !== -1) {
                  foundRoomIdx = ri;
                  foundOptIdx = idx;
                  roomIdToFind = String(candidate.id);
                  break;
                }
              }
              // If we couldn't match an optimistic placeholder and server omitted
              // the room id, there's nothing safe we can do here — avoid
              // creating rooms out of thin air.
              if (!roomIdToFind) return prev;
            }

            const idx = typeof foundRoomIdx === 'number' && foundRoomIdx !== -1 ? foundRoomIdx : prev.findIndex((r) => String(r.id) === String(roomIdToFind));
            if (idx === -1) {
              // If server provided a room id that we don't have locally, create
              // a minimal room object and insert it at the top.
              if (!roomIdToFind) return prev;
              try {
                const currentUserId = typeof getCurrentUserId === 'function' ? getCurrentUserId() : null;
                const newRoom = createRoomFromMessage(roomIdToFind, msg, currentUserId);
                newRoom.unread_count = msg && msg.fromMe ? 0 : 1;
                try { /* auto-create room log suppressed */ } catch (e) {}
                return [newRoom, ...prev];
              } catch (e) {
                return prev;
              }
            }

            const copy = prev.slice();
            const room = { ...(copy[idx] || {}) };
            const msgs = Array.isArray(room.messages) ? room.messages.slice() : [];
            try { /* room update before msgs log suppressed */ } catch (e) {}
            // If a message with the same id exists, decide if we should merge
            const existingIdxById = msgs.findIndex((m) => String(m.id) === String(msg.id));
            if (existingIdxById !== -1) {
              try {
                const existingMsg = msgs[existingIdxById] || {};
                // If incoming message carries new media fields (media_url / preview_data_url / file_url)
                // or different receipts/status, merge into the existing message so the UI updates.
                const incomingHasMedia = Boolean(msg.media_url || msg.preview_data_url || msg.file_url || msg.mediaUrl);
                const incomingHasReceiptsOrStatus = Boolean(msg.receipts && msg.receipts.length) || Boolean(msg.status);
                if (incomingHasMedia || incomingHasReceiptsOrStatus) {
                  try { console.info('[ROOM_UPDATE] merging incoming server message into existing by id', { room: String(room.id), id: msg.id, incomingHasMedia, incomingHasReceiptsOrStatus }); } catch (e) {}
                  const mergedMsg = { ...existingMsg, ...(msg || {}) };
                  // ensure upload flags cleared if final media_url present
                  if (mergedMsg.media_url || mergedMsg.file_url || mergedMsg.mediaUrl) {
                    mergedMsg.media_uploading = false;
                    mergedMsg.media_upload_percent = null;
                  }
                  msgs[existingIdxById] = mergedMsg;
                } else {
                  // nothing new to apply, skip to avoid duplication
                  return prev;
                }
              } catch (e) { return prev; }
            }

            // Use shared heuristic util to find optimistic index (either foundOptIdx or check in this room)
            let optIdx = foundOptIdx !== -1 ? foundOptIdx : findOptimisticIndex(msgs, msg);

            if (optIdx !== -1) {
              try {
                const prevMsg = msgs[optIdx];
                try {
                  // Preserve useful fields from the optimistic message if server omitted them
                  const merged = { ...(prevMsg || {}), ...(msg || {}) };
                  if ((merged.media_spectrum === null || merged.media_spectrum === undefined) && prevMsg && prevMsg.media_spectrum) merged.media_spectrum = prevMsg.media_spectrum;
                  if ((!merged.media_url || merged.media_url === null) && prevMsg && prevMsg.media_url) merged.media_url = prevMsg.media_url;
                  // If previous media_url was a blob URL and server provided a real URL,
                  // revoke the blob to free memory.
                  if (
                    prevMsg &&
                    prevMsg.media_url &&
                    typeof prevMsg.media_url === 'string' &&
                    prevMsg.media_url.startsWith('blob:') &&
                    merged.media_url &&
                    !merged.media_url.startsWith('blob:')
                  ) {
                    try { URL.revokeObjectURL(prevMsg.media_url); } catch (e) {}
                  }

                  // Important: clear upload indicators so the UI removes the overlay
                  merged.media_uploading = false;
                  merged.media_upload_percent = null;

                  msgs[optIdx] = merged;
                } catch (e) {
                  // Fallback: replace optimistic message but ensure upload flags cleared
                  const mergedMsg = { ...(prevMsg || {}), ...(msg || {}), media_uploading: false, media_upload_percent: null };
                  msgs[optIdx] = mergedMsg;
                }
                // replaced optimistic message debug removed
              } catch (e) {}
            } else {
              msgs.push(msg);
              // increment unread_count only when a new incoming message is appended
              try {
                const isActiveRoomLocal = String(roomIdToFind) === String(activeId);
                room.unread_count = isActiveRoomLocal ? 0 : ((room.unread_count || 0) + (msg && msg.fromMe ? 0 : 1));
                // maintain boolean for backward compatibility
                room.unread = isActiveRoomLocal ? false : (!!room.unread || (!msg.fromMe));
              } catch (e) {}
            }

            room.messages = msgs;
                    try { /* room update after msgs log suppressed */ } catch (e) {}
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
              try { /* tray update suppressed */ } catch (e) {}

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
                        // clear unread_count for the active room when we mark messages read
                        roomR.unread_count = 0;
                        roomR.unread = false;
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

            try { /* media_spectrum log suppressed */ } catch (e) {}
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
              // Also try to extract a canonical public URL for the media if provided by the media API
              const finalMediaUrl = data && (data.url || data.media_url || data.file_url || data.object_url || data.path || null);
              if (descr) {
                try {
                  const parsed =
                    typeof descr === "string" ? JSON.parse(descr) : descr;
                  if (Array.isArray(parsed) && parsed.length) {
                    try { /* media_fetch log suppressed */ } catch (e) {}
                    // compute a best-effort target room id (incomingRoom may be null)
                    // For fetched media spectrum, only target the explicit
                    // incoming room (do not default to activeId to avoid
                    // accidentally applying spectrum to the wrong conversation).
                    const targetRoomId = incomingRoom ? String(incomingRoom) : null;
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
                            // Merge spectrum and, if available, final media URL into the message
                            const existing = msgs2[mIdx] || {};
                            const updated = { ...(existing || {}), media_spectrum: parsed, __spectrum_updated_at: new Date().toISOString() };
                            if (finalMediaUrl) {
                              updated.media_url = updated.media_url || finalMediaUrl;
                              updated.mediaUrl = updated.mediaUrl || finalMediaUrl;
                              updated.previewUrl = updated.previewUrl || finalMediaUrl;
                              updated.media_uploading = false;
                              updated.media_upload_percent = null;
                            }
                            msgs2[mIdx] = updated;
                            try { /* applied fetched spectrum+url log suppressed */ } catch (e) {}
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
                          const existing = msgs2[mIdx] || {};
                          const updated = { ...(existing || {}), media_spectrum: parsed, __spectrum_updated_at: new Date().toISOString() };
                          if (finalMediaUrl) {
                            updated.media_url = updated.media_url || finalMediaUrl;
                            updated.mediaUrl = updated.mediaUrl || finalMediaUrl;
                            updated.previewUrl = updated.previewUrl || finalMediaUrl;
                            updated.media_uploading = false;
                            updated.media_upload_percent = null;
                          }
                          msgs2[mIdx] = updated;
                        } else {
                          const base = { ...(msg || {}), media_spectrum: parsed, __spectrum_updated_at: new Date().toISOString() };
                          if (finalMediaUrl) {
                            base.media_url = base.media_url || finalMediaUrl;
                            base.mediaUrl = base.mediaUrl || finalMediaUrl;
                            base.previewUrl = base.previewUrl || finalMediaUrl;
                            base.media_uploading = false;
                            base.media_upload_percent = null;
                          }
                          msgs2.push(base);
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
