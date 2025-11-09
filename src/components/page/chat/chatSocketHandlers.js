// Factory that returns an onMessage handler for the chat websocket.
// The handler mirrors the previous inline implementation but is extracted
// so the main hook file stays small and imports this logic.
import { deriveStatusFromReceipts, upsertReceipt, findOptimisticIndex } from './chatUtils';

export function createOnMessageHandler({ activeId, setRooms, markUserOnline, markUserOffline, getCurrentUserId, playNotifySound }) {
  return function onMessage(ev) {
    try {
      let d = null;
      try {
        if (ev && typeof ev === 'object' && ev.type) {
          d = ev;
        } else if (typeof ev === 'string') {
          d = JSON.parse(ev);
        } else if (ev && typeof ev === 'object' && ev.data) {
          d = JSON.parse(ev.data);
        } else {
          console.warn('[useChatSocket] onMessage unknown payload shape', ev);
          return;
        }
      } catch (parseErr) {
        console.error('[Chat WS] parse error', parseErr);
        return;
      }

      if (d.type === "presence.online") return markUserOnline(d.user_id || d.user);

      if (d.type === 'message_update') {
        try { console.debug('[useChatSocket] message_update received', d); } catch (e) {}
        try { console.log('[WS] message_update recibido, receipts:', d.message && d.message.receipts); } catch (e) {}
        const payload = d.message || {};
        const mid = String(payload.id || payload.message_id || payload.id);
        const receipts = Array.isArray(payload.receipts) ? payload.receipts : [];
        const me = typeof getCurrentUserId === 'function' ? getCurrentUserId() : null;
        const roomId = payload.room_id || payload.room || d.room_id || d.room || String(activeId);
        try { console.log('[STORE] 🧩 message_update received for', mid, 'room:', roomId, 'receipts:', receipts); } catch (e) {}

        setRooms((prev) => {
          try {
            const copy = prev.slice();
            const idx = copy.findIndex((r) => String(r.id) === String(roomId));
            if (idx === -1) {
              let changed = false;
              for (let ri = 0; ri < copy.length; ri++) {
                const room = { ...(copy[ri] || {}) };
                const msgs = Array.isArray(room.messages) ? room.messages.slice() : [];
                for (let mi = 0; mi < msgs.length; mi++) {
                  const m = msgs[mi];
                  if (!m || !m.id) continue;
                  if (String(m.id) === mid) {
                    msgs[mi] = { ...m, receipts };
                    room.messages = msgs;
                    copy[ri] = room;
                    changed = true;
                  }
                }
              }
              return changed ? copy : prev;
            }

            const room = { ...(copy[idx] || {}) };
            const msgs = Array.isArray(room.messages) ? room.messages.slice() : [];
            let changedLocal = false;
            for (let mi = 0; mi < msgs.length; mi++) {
              const m = msgs[mi];
              if (!m || !m.id) continue;
              if (String(m.id) === mid) {
                try {
                  const newStatus = deriveStatusFromReceipts(receipts, me);
                  msgs[mi] = { ...m, receipts, status: newStatus };
                } catch (e) {
                  msgs[mi] = { ...m, receipts };
                }
                changedLocal = true;
                break;
              }
            }
            if (!changedLocal) return prev;
            room.messages = msgs;
            copy[idx] = room;
            return copy;
          } catch (e) { return prev; }
        });
        return;
      }

      if (d.type === 'status_update') {
        try { console.debug('[useChatSocket] status_update received', d); } catch (e) {}
        const mid = d.message_id || d.messageId || d.id || null;
        const userId = d.user_id || d.userId || null;
        const roomId = d.room_id || d.room || String(activeId);
        const status = d.status || null;
        try {
          const current = typeof getCurrentUserId === 'function' ? getCurrentUserId() : null;
          if (current && userId && String(current) === String(userId)) return;
        } catch (e) {}

        if (mid) {
          try {
            if (typeof window !== 'undefined' && window._agrovet_chat_store && typeof window._agrovet_chat_store.updateMessage === 'function') {
              try { window._agrovet_chat_store.updateMessage(mid, [], roomId); } catch (e) {}
            }
          } catch (e) {}

          setRooms((prev) => {
            try {
              const copy = prev.slice();
              const idx = copy.findIndex((r) => String(r.id) === String(roomId));
              if (idx === -1) return prev;
              const room = { ...(copy[idx] || {}) };
              const msgs = Array.isArray(room.messages) ? room.messages.slice() : [];
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
            } catch (e) { return prev; }
          });
        }
        return;
      }

      if (d.type === "presence.offline") return markUserOffline(d.user_id || d.user);

      if (d.type && d.type.startsWith("chat.")) {
        try {
          if (d.type === 'chat.read' || d.type === 'chat.delivery' || d.type === 'chat.message.read' || d.type === 'chat.message.delivered' || d.type === 'message_seen' || d.type === 'message_delivered') {
            try { console.debug('[useChatSocket] receipt event received', d); } catch (e) {}
            setRooms((prev) => {
              try {
                const idx = prev.findIndex((r) => String(r.id) === String(activeId));
                if (idx === -1) return prev;
                const copy = prev.slice();
                const room = { ...(copy[idx] || {}) };
                const msgs = Array.isArray(room.messages) ? room.messages.slice() : [];
                const targetIds = Array.isArray(d.message_ids) ? d.message_ids.map(String) : (d.message_id ? [String(d.message_id)] : []);
                if (!targetIds.length && d.message_id) targetIds.push(String(d.message_id));
                if (targetIds.length) {
                  const receiptStatus = (d.type === 'chat.read' || d.type === 'chat.message.read' || Boolean(d.read)) ? 'read' : ((d.type === 'chat.delivery' || d.type === 'chat.message.delivered' || Boolean(d.delivered)) ? 'delivered' : null);
                  for (let mi = 0; mi < msgs.length; mi++) {
                    const m = msgs[mi];
                    if (!m || !m.id) continue;
                    if (!targetIds.includes(String(m.id))) continue;
                    const newReceipts = receiptStatus ? upsertReceipt(m.receipts, d.user_id, receiptStatus) : (m.receipts || []);
                    msgs[mi] = { ...m, receipts: newReceipts };
                  }
                }
                room.messages = msgs;
                copy[idx] = room;
                try { console.log('[DEBUG] Message receipts updated (applied to room)', { roomId: room.id, targetIds }); } catch (e) {}
                return copy;
              } catch (e) { return prev; }
            });
            return;
          }
        } catch (e) {}

        try { console.debug('[useChatSocket] raw WS payload', d); } catch (e) {}
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

        try { console.log('[DEBUG] Spectrum received (socket payload)', { type: typeof d.media_spectrum, len: Array.isArray(d.media_spectrum) ? d.media_spectrum.length : (typeof d.media_spectrum === 'string' ? d.media_spectrum.length : null) }); } catch (e) {}

        try {
          if (typeof msg.media_spectrum === 'string') {
            const s = msg.media_spectrum.trim();
            if (s.startsWith('[') || s.startsWith('{')) {
              try {
                const parsed = JSON.parse(s);
                if (Array.isArray(parsed)) msg.media_spectrum = parsed;
                else if (parsed && parsed.spectrum && Array.isArray(parsed.spectrum)) msg.media_spectrum = parsed.spectrum;
              } catch (e) {}
            }
          }
          try { console.log('[DEBUG] Spectrum normalized', { type: typeof msg.media_spectrum, len: Array.isArray(msg.media_spectrum) ? msg.media_spectrum.length : null }); } catch (e) {}
        } catch (e) {}

        try {
          const incomingRoom = d.room_id || d.room || null;
          const focused = typeof document !== 'undefined' ? document.hasFocus && document.hasFocus() : true;
          const notFocused = typeof document !== 'undefined' ? document.hidden || !focused : false;
          const isDifferentRoom = incomingRoom && String(incomingRoom) !== String(activeId);
          if (!msg.fromMe && (notFocused || isDifferentRoom)) playNotifySound();
        } catch (e) {}

        try { console.debug('[useChatSocket] parsed message', msg); } catch (e) {}
        const incomingRoom = d.room_id || d.room || (d.message && (d.message.room || d.message.room_id)) || null;
        try { console.log('[STORE] ➕ addIncomingMessage: incoming msg', msg.id, 'roomHint', incomingRoom); } catch (e) {}

        setRooms((prev) => {
          try {
            const roomIdToFind = incomingRoom ? String(incomingRoom) : String(activeId);
            const idx = prev.findIndex((r) => String(r.id) === roomIdToFind);
            if (idx === -1) {
              console.debug('[useChatSocket] incoming message room not found in state', { incomingRoom, activeId });
              return prev;
            }
            const copy = prev.slice();
            const room = { ...(copy[idx] || {}) };
            const msgs = Array.isArray(room.messages) ? room.messages.slice() : [];
            if (msgs.some((m) => String(m.id) === String(msg.id))) return prev;

            // Use shared heuristic util to find optimistic index
            let optIdx = findOptimisticIndex(msgs, msg);

            if (optIdx !== -1) {
              try {
                const prevMsg = msgs[optIdx];
                try {
                  if (prevMsg) {
                    if ((!msg.media_spectrum || msg.media_spectrum === null) && prevMsg.media_spectrum) msg.media_spectrum = prevMsg.media_spectrum;
                    if ((!msg.media_url || msg.media_url === null) && prevMsg.media_url) msg.media_url = prevMsg.media_url;
                    if (prevMsg && prevMsg.media_url && typeof prevMsg.media_url === 'string' && prevMsg.media_url.startsWith('blob:') && msg.media_url && !msg.media_url.startsWith('blob:')) {
                      try { URL.revokeObjectURL(prevMsg.media_url); } catch (e) {}
                    }
                  }
                } catch (e) {}
                msgs[optIdx] = msg;
                try { console.debug('[useChatSocket] Replaced optimistic message at index', optIdx, 'with server id', msg.id, 'client_msg_id', d && d.client_msg_id); } catch (e) {}
              } catch (e) {}
            } else { msgs.push(msg); }

            room.messages = msgs;
            room.lastMessage = msg.text || room.lastMessage;
            room.last_activity = msg.timestamp || room.last_activity;
            copy[idx] = room;

            const sorted = copy.slice().sort((a, b) => {
              const ta = new Date(a.last_activity || (a.messages && a.messages.length ? a.messages[a.messages.length - 1].timestamp : 0)).getTime() || 0;
              const tb = new Date(b.last_activity || (b.messages && b.messages.length ? b.messages[b.messages.length - 1].timestamp : 0)).getTime() || 0;
              return tb - ta;
            });

            try {
              const isActiveRoom = String(roomIdToFind) === String(activeId);
              if (isActiveRoom && !msg.fromMe && typeof window !== 'undefined' && window._agrovet_chat_service && typeof window._agrovet_chat_service.send === 'function') {
                try { window._agrovet_chat_service.send({ type: 'read_receipt', message_id: msg.id, room_id: activeId }); console.log('[READ] 📤 Sent read_receipt for message', msg.id, 'room', activeId); } catch (e) {}
                try {
                  const me = typeof getCurrentUserId === 'function' ? getCurrentUserId() : null;
                  const nowIso = new Date().toISOString();
                  if (me && window._agrovet_chat_store && typeof window._agrovet_chat_store.updateMessage === 'function') {
                    const existingReceipts = upsertReceipt(Array.isArray(msg.receipts) ? msg.receipts.slice() : [], me, 'read');
                    try { window._agrovet_chat_store.updateMessage(msg.id, existingReceipts, activeId); } catch (e) {}
                  }
                  if (me) {
                    setRooms((prevR) => {
                      try {
                        const copyR = prevR.slice();
                        const idxR = copyR.findIndex((r) => String(r.id) === String(activeId));
                        if (idxR === -1) return prevR;
                        const roomR = { ...(copyR[idxR] || {}) };
                        const msgsR = Array.isArray(roomR.messages) ? roomR.messages.slice() : [];
                        for (let mi = 0; mi < msgsR.length; mi++) {
                          if (String(msgsR[mi].id) === String(msg.id)) {
                            let receipts = Array.isArray(msgsR[mi].receipts) ? msgsR[mi].receipts.slice() : [];
                            receipts = upsertReceipt(receipts, me, 'read');
                            const newStatus = deriveStatusFromReceipts(receipts, null);
                            msgsR[mi] = { ...msgsR[mi], receipts, status: newStatus };
                            break;
                          }
                        }
                        roomR.messages = msgsR;
                        copyR[idxR] = roomR;
                        return copyR;
                      } catch (e) { return prevR; }
                    });
                  }
                } catch (e) {}
              }
            } catch (e) {}

            return sorted;
          } catch (e) { return prev; }
        });

        if ((msg.media_id || msg.media_id === 0) && !msg.media_spectrum) {
          (async () => {
            try {
              const apiBase = (typeof window !== 'undefined' && window.__AGROVET_API_BASE) ? String(window.__AGROVET_API_BASE).replace(/\/$/, '') : `${location.protocol}//${location.hostname}${location.port ? ':'+location.port : ''}`;
              const url = `${apiBase}/api/media/media/${encodeURIComponent(msg.media_id)}/`;
              const raw = localStorage.getItem('token');
              const token = raw ? raw.replace(/^Token\s*/i, '').replace(/^Bearer\s*/i, '') : null;
              const headers = token ? { 'Authorization': `Token ${token}` } : {};
              const resp = await fetch(url, { headers });
              if (!resp.ok) return;
              const data = await resp.json();
              let descr = data && (data.description || data.desc || null);
              if (descr) {
                try {
                  const parsed = typeof descr === 'string' ? JSON.parse(descr) : descr;
                  if (Array.isArray(parsed) && parsed.length) {
                    setRooms((prev2) => {
                      try {
                        const copy2 = prev2.slice();
                        const idx2 = copy2.findIndex((r) => String(r.id) === String(activeId));
                        if (idx2 === -1) return prev2;
                        const room2 = { ...(copy2[idx2] || {}) };
                        const msgs2 = Array.isArray(room2.messages) ? room2.messages.slice() : [];
                        const mIdx = msgs2.findIndex((mm) => String(mm.id) === String(msg.id));
                        if (mIdx !== -1) msgs2[mIdx] = { ...(msgs2[mIdx] || {}), media_spectrum: parsed };
                        else msgs2.push({ ...(msg || {}), media_spectrum: parsed });
                        room2.messages = msgs2;
                        copy2[idx2] = room2;
                        return copy2;
                      } catch (e) { return prev2; }
                    });
                  }
                } catch (e) {}
              }
            } catch (e) {}
          })();
        }
      }
    } catch (e) {
      console.error('[Chat WS] parse error', e);
    }
  };
}
