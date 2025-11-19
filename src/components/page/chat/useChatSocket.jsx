import { useEffect } from "react";
import useChatWebSocket from "../../../hooks/useChatWebSocket";
import { normalizeStoredToken, dedupeMessages } from "./chatUtils";
import { createOnMessageHandler } from "./chatSocketHandlers";
import { playNotifySound } from "../../../services/sound";
import { connectPresence } from '../../../services/endpoints/chat';
import { usePresenceStore } from '../../../store/usePresenceStore';

export default function useChatSocket({
    activeId,
    setRooms,
    markUserOnline,
    markUserOffline,
    getReceiptUserId,
    getCurrentUserId,
}) {
    // compute token unconditionally (hooks must be called at top level)
    const rawStored = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const token = normalizeStoredToken(rawStored);

    // Presence websocket connection: separate from chat WS. This allows the
    // client to receive presence.online/presence.offline and init_rooms even
    // when no specific chat room is open.
    useEffect(() => {
        if (!token) return;
        let pres = null;
        try {
                pres = connectPresence(token, {
                    onOpen: (ev) => {
                        try { console.info('[presence] connected'); } catch (e) {}
                    },
                    onMessage: (ev) => {
                        try {
                            const raw = (ev && ev.data) ? ev.data : ev;
                            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                            try { console.info('[presence.onMessage]', parsed && parsed.type ? parsed.type : 'unknown', parsed); } catch (e) {}
                            if (!parsed || !parsed.type) return;
                            if (parsed.type === 'presence.online') {
                                try {
                                    const raw = parsed.user_id || parsed.user || parsed.userId || parsed.user_id;
                                    const pid = raw && typeof raw === 'object' ? (raw.id || raw.user_id || raw.pk) : raw;
                                    // update global presence store
                                    try { usePresenceStore.getState().updateUser(pid, { isOnline: true, lastSeen: null }); } catch (e) {}
                                    try { console.info('[presence] user_online', pid, usePresenceStore.getState().users && usePresenceStore.getState().users[String(pid)]); } catch (e) {}
                                    markUserOnline(pid);
                                } catch (e) { console.warn('[presence] online handler error', e); }
                                return;
                            }
                            if (parsed.type === 'presence.offline') {
                                try {
                                    const raw = parsed.user_id || parsed.user || parsed.userId || parsed.user_id;
                                    const pid = raw && typeof raw === 'object' ? (raw.id || raw.user_id || raw.pk) : raw;
                                    const last_seen = parsed.last_seen || parsed.lastSeen || null;
                                    try { usePresenceStore.getState().updateUser(pid, { isOnline: false, lastSeen: last_seen || new Date().toISOString() }); } catch (e) {}
                                    try { console.info('[presence] user_offline', pid, usePresenceStore.getState().users && usePresenceStore.getState().users[String(pid)]); } catch (e) {}
                                    markUserOffline(pid);
                                } catch (e) { console.warn('[presence] offline handler error', e); }
                                return;
                            }
                        if (parsed.type === 'init_rooms' && Array.isArray(parsed.rooms)) {
                            try {
                                // Annotate existing rooms state with participant online flags from presence
                                setRooms((prev) => {
                                    try {
                                        const copy = prev.slice();
                                        for (const r of parsed.rooms) {
                                            const rid = String(r.id);
                                            const idx = copy.findIndex(rr => String(rr.id) === rid);
                                            if (idx === -1) continue;
                                            const annotatedParts = r.participants || [];
                                            const roomCopy = { ...copy[idx] };
                                            roomCopy.participants = (roomCopy.participants || []).map(p => {
                                                try {
                                                    const pid = p && (p.id || p.user_id || p.pk) ? (p.id || p.user_id || p.pk) : p;
                                                    const ann = annotatedParts.find(ap => String(ap.id) === String(pid));
                                                    if (ann && typeof ann.online !== 'undefined') return { ...p, online: !!ann.online };
                                                } catch (e) {}
                                                return p;
                                            });
                                            copy[idx] = roomCopy;
                                        }
                                        // Also populate global presence store from init_rooms
                                        try {
                                            for (const r of parsed.rooms) {
                                                const parts = r.participants || [];
                                                for (const ap of parts) {
                                                    try {
                                                        const raw = ap && (ap.id || ap.user_id || ap.pk) ? (ap.id || ap.user_id || ap.pk) : ap;
                                                        const pid = raw && typeof raw === 'object' ? (raw.id || raw.user_id || raw.pk) : raw;
                                                        if (!pid) continue;
                                                        usePresenceStore.getState().updateUser(pid, { isOnline: !!ap.online, lastSeen: ap.last_seen || ap.lastSeen || null });
                                                    } catch (e) {}
                                                }
                                            }
                                        } catch (e) {}
                                        return copy;
                                    } catch (e) { return prev; }
                                });
                            } catch (e) {}
                        }
                    } catch (e) {}
                },
                onClose: () => {},
            });
        } catch (e) {}

        return () => {
            try { if (pres && typeof pres.disconnect === 'function') pres.disconnect(); } catch (e) {}
        };
    }, [token, markUserOnline, markUserOffline, setRooms]);

    // Attach websocket via the shared hook. The connect factory is called by
    // useChatWebSocket inside its own effect; we only provide the connect function.
    useChatWebSocket((svc) => {
        try {
            // Connect the websocket even if no chat is actively opened so
            // the client receives incoming messages for other rooms (chat list updates).
            // createOnMessageHandler will receive `activeId` (possibly null) and
            // route updates appropriately.
            // Do not attempt to connect when there's no active room selected.
            if (!activeId || String(activeId) === "bot-chat") {
                try { console.warn('[SOCKET] connect skipped, invalid or empty activeId:', activeId); } catch(e){}
                return;
            }

            try {
                svc.connect(activeId, token, {
                    onMessage: createOnMessageHandler({ activeId, setRooms, markUserOnline, markUserOffline, getCurrentUserId, playNotifySound }),
                    onError: (e) => { try { console.error('[Chat] WS error', { activeId, errorEvent: e }); } catch(err){} },
                });
            } catch (outer) { console.error('[useChatSocket] svc.connect threw', outer, { activeId }); }
        } catch (e) {}
    }, [activeId, token]);

    // Subscribe to debug store and visibility/focus events. Wrap in effect to
    // ensure subscription and handlers are registered/cleaned up per activeId.
    useEffect(() => {
        let _unsubscribe_store = null;

        // store subscription for external debug helpers
        try {
            if (typeof window !== 'undefined' && window._agrovet_chat_store && typeof window._agrovet_chat_store.subscribe === 'function') {
                _unsubscribe_store = window._agrovet_chat_store.subscribe((ev) => {
                    try {
                        if (!ev || !ev.type) return;
                        if (ev.type === 'updateMessage' && ev.message && ev.message.id) {
                            const payload = ev.message;
                            const mid = String(payload.id || payload.message_id || payload.id);
                            const receipts = Array.isArray(payload.receipts) ? payload.receipts : [];
                            setRooms((prev) => {
                                try {
                                    const copy = prev.slice();
                                    let changed = false;
                                    for (let ri = 0; ri < copy.length; ri++) {
                                        const room = { ...(copy[ri] || {}) };
                                        const msgs = Array.isArray(room.messages) ? room.messages.slice() : [];
                                        for (let mi = 0; mi < msgs.length; mi++) {
                                            const m = msgs[mi];
                                            if (!m || !m.id) continue;
                                            if (String(m.id) === mid) {
                                                // Merge all incoming fields from payload into stored message
                                                const merged = { ...m, ...(payload || {}) };
                                                // Prefer incoming receipts when provided
                                                if (Array.isArray(payload.receipts) && payload.receipts.length) merged.receipts = payload.receipts;
                                                // Preserve existing media_spectrum if payload didn't include it
                                                if ((merged.media_spectrum === null || merged.media_spectrum === undefined) && m.media_spectrum) {
                                                    merged.media_spectrum = m.media_spectrum;
                                                }
                                                msgs[mi] = merged;
                                                room.messages = msgs;
                                                copy[ri] = room;
                                                changed = true;
                                            }
                                        }
                                    }
                                    // suppressed noisy debug log: room update completed
                                    return changed ? copy : prev;
                                } catch (e) { return prev; }
                            });
                        }

                        if (ev.type === 'addIncomingMessage' && ev.message) {
                            let payload = ev.message || {};
                            // Prefer cross-client preview (data URL) when provided by sender.
                            try {
                                if (payload && payload.preview_data_url) {
                                    payload.media_url = payload.preview_data_url;
                                    payload.previewUrl = payload.preview_data_url;
                                    payload.media_uploading = payload.media_uploading || (String(payload.status) === 'uploading');
                                }
                            } catch (e) {}
                            // Normalize timestamp: ensure there's a valid ISO timestamp
                            try {
                                if (!payload.timestamp) payload.timestamp = new Date().toISOString();
                                else {
                                    const parsed = new Date(payload.timestamp);
                                    if (Number.isNaN(parsed.getTime())) payload.timestamp = new Date().toISOString();
                                }
                            } catch (e) { payload.timestamp = new Date().toISOString(); }
                            // Ensure messages from me appear as newest immediately
                            try {
                                const me = typeof getCurrentUserId === 'function' ? getCurrentUserId() : (Number(localStorage.getItem('userId')) || null);
                                const maybeFromMe = Boolean(payload && (payload.from_me || payload.fromMe)) || (payload && payload.sender_id && me && String(payload.sender_id) === String(me));
                                if (maybeFromMe) payload.timestamp = new Date().toISOString();
                            } catch (e) {}
                            // Ensure stable uid exists for dedupe and rendering
                            try {
                                if (!payload.uid) payload.uid = `${payload.id || payload.message_id || 'tmp'}-${payload.timestamp}-${Math.random().toString(36).slice(2,8)}`;
                            } catch (e) {}
                            const roomHint = payload && (payload.room || payload.room_id || payload.roomId) || null;
                            setRooms((prev) => {
                                try {
                                    const roomIdToFind = roomHint ? String(roomHint) : String(activeId);

                                    // Quick dedupe: if the target room already contains this message id, ignore
                                    try {
                                        const existingRoom = prev.find(r => String(r.id) === String(roomIdToFind));
                                            if (existingRoom && Array.isArray(existingRoom.messages)) {
                                                // Diagnostic: log existing messages' ids and client_msg_ids to inspect dedupe
                                                try {
                                                    const existingKeys = existingRoom.messages.map(mm => ({ id: mm && mm.id, client_msg_id: mm && (mm.client_msg_id || mm.clientMsgId || mm.client_msgid) }));
                                                    console.info('[ROOM_UPDATE] addIncomingMessage: existingRoom keys', { room: String(existingRoom.id), existingKeys, incomingId: payload.id, incomingClientMsgId: payload.client_msg_id || payload.client_msgid || null });
                                                } catch (e) {}
                                                // If a message with the same server id already exists, skip
                                                const already = existingRoom.messages.some(m => m && (String(m.id) === String(payload.id) || String(m.message_id) === String(payload.id)));
                                                if (already) {
                                                    // Check for optimistic message that used client_msg_id / client_msg_id mapping
                                                    try {
                                                        const clientId = payload.client_msg_id || payload.client_msgid || payload.clientId || null;
                                                        if (clientId) {
                                                            // Find optimistic message by client_msg_id and merge server payload into it
                                                            const idx = existingRoom.messages.findIndex(m => m && (m.client_msg_id === clientId || m.client_msgid === clientId || m.clientMsgId === clientId));
                                                            if (idx !== -1) {
                                                                try { console.log('[ROOM_UPDATE] addIncomingMessage: merging server message into optimistic message via client_msg_id', payload.id, clientId); } catch(e){}
                                                                const copy = prev.slice();
                                                                const roomCopy = { ...copy[copy.findIndex(r=>String(r.id)===String(roomIdToFind))] };
                                                                const msgs = Array.isArray(roomCopy.messages) ? roomCopy.messages.slice() : [];
                                                                const existing = msgs[idx];
                                                                const merged = { ...existing, ...(payload || {}) };
                                                                // mark upload as finished when server provides a final media_url
                                                                if (payload.media_url || payload.file_url || payload.mediaUrl) merged.media_uploading = false;
                                                                msgs[idx] = merged;
                                                                roomCopy.messages = msgs;
                                                                copy[copy.findIndex(r=>String(r.id)===String(roomIdToFind))] = roomCopy;
                                                                return copy;
                                                            }
                                                        }
                                                    } catch(e) {}

                                                    try { console.log('[ROOM_UPDATE] addIncomingMessage: message already present, skipping', payload.id); } catch(e){}
                                                    return prev;
                                                }
                                            }
                                    } catch(e) {}

                                    // compute if message is from me
                                    let fromMe = Boolean(payload && (payload.from_me || payload.fromMe));
                                    try {
                                        const me = typeof getCurrentUserId === 'function' ? getCurrentUserId() : (Number(localStorage.getItem('userId')) || null);
                                        if (!fromMe && payload && payload.sender_id && me) {
                                            fromMe = String(payload.sender_id) === String(me);
                                        }
                                    } catch (e) {}

                                    // Build a new rooms array immutably, updating only the target room
                                    const mapped = prev.map((r) => {
                                        if (String(r.id) !== String(roomIdToFind)) return r;
                                        const msgs = Array.isArray(r.messages) ? r.messages.slice() : [];
                                            let newMsgs = dedupeMessages([...msgs, payload]);
                                            // Normalize timestamps to avoid string ordering issues
                                            try { newMsgs = newMsgs.map(m => ({ ...m, timestamp: (m && m.timestamp) || new Date().toISOString() })); } catch (e) {}
                                            try { newMsgs.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)); } catch (e) {}
                                        return {
                                            ...r,
                                            messages: newMsgs,
                                            lastMessage: payload.text || r.lastMessage,
                                            last_activity: payload.timestamp || r.last_activity,
                                            unread: !!r.unread || (!fromMe),
                                        };
                                    });

                                    // If room wasn't present, create it and put on top
                                    const exists = mapped.some((r) => String(r.id) === String(roomIdToFind));
                                    let resultArr;
                                    if (!exists) {
                                        const newRoom = {
                                            id: String(roomIdToFind),
                                            name: 'Chat ' + String(roomIdToFind),
                                            avatar: '',
                                            participants: [],
                                            messages: (function(){ const m = dedupeMessages([payload]); try{ m.sort((a,b)=> new Date(a.timestamp||0) - new Date(b.timestamp||0)); }catch(e){} return m; })(),
                                            lastMessage: payload.text || '',
                                            last_activity: payload.timestamp || new Date().toISOString(),
                                            unread: !fromMe,
                                        };
                                        try { console.log('[ROOM_UPDATE] (addIncomingMessage) created newRoom', roomIdToFind, 'messages before: 0 after: 1', payload.id); } catch (e) {}
                                        resultArr = [newRoom, ...prev];
                                    } else {
                                        // Move updated room to the top preserving order for others
                                        const updatedRoom = mapped.find((r) => String(r.id) === String(roomIdToFind));
                                        const others = mapped.filter((r) => String(r.id) !== String(roomIdToFind));
                                        try { console.log('[ROOM_UPDATE] (addIncomingMessage) room', roomIdToFind, 'before msgs:', (prev.find(p => String(p.id) === String(roomIdToFind))?.messages || []).length, 'incoming id:', payload.id); } catch (e) {}
                                        try { console.log('[ROOM_UPDATE] (addIncomingMessage) room', roomIdToFind, 'after msgs:', (updatedRoom.messages || []).length, 'incoming id:', payload.id); } catch (e) {}
                                        resultArr = [updatedRoom, ...others];
                                    }

                                    // Ensure rooms list is sorted by most-recent activity (descending)
                                    try {
                                        resultArr = resultArr.slice().sort((a, b) => {
                                            const ta = new Date(a.last_activity || (a.messages && a.messages.length ? a.messages[a.messages.length - 1].timestamp : 0)).getTime() || 0;
                                            const tb = new Date(b.last_activity || (b.messages && b.messages.length ? b.messages[b.messages.length - 1].timestamp : 0)).getTime() || 0;
                                            return tb - ta;
                                        });
                                    } catch (e) {}

                                    return resultArr;
                                } catch (e) { return prev; }
                            });
                        }
                    } catch (e) {}
                });
            }
        } catch (e) {}

        // mark_read when the tab becomes visible or window gains focus
        const onVisibleOrFocus = () => {
            try {
                if (!activeId) return;
                const me = typeof getCurrentUserId === 'function' ? getCurrentUserId() : null;
                if (me) {
                    const nowIso = new Date().toISOString();
                    try {
                        if (typeof window !== 'undefined' && window._agrovet_chat_store && typeof window._agrovet_chat_store.dumpRoom === 'function') {
                            const msgs = window._agrovet_chat_store.dumpRoom(activeId) || [];
                            for (const m of msgs) {
                                try {
                                    const receipts = Array.isArray(m.receipts) ? m.receipts.slice() : [];
                                    let found = false;
                                    for (let i = 0; i < receipts.length; i++) {
                                        if (String(receipts[i].user_id) === String(me)) {
                                            receipts[i] = { ...receipts[i], delivered: true, delivered_at: receipts[i].delivered_at || nowIso, read: true, read_at: nowIso };
                                            found = true; break;
                                        }
                                    }
                                    if (!found) receipts.push({ user_id: me, delivered: true, delivered_at: nowIso, read: true, read_at: nowIso });
                                    try { window._agrovet_chat_store.updateMessage(m.id || m.message_id || m.messageId, receipts, activeId); } catch (e) {}
                                } catch (e) {}
                            }
                        }
                    } catch (e) {}

                    try {
                        setRooms((prev) => {
                            try {
                                const copy = prev.slice();
                                const idx = copy.findIndex((r) => String(r.id) === String(activeId));
                                if (idx === -1) return prev;
                                const room = { ...(copy[idx] || {}) };
                                const msgs = Array.isArray(room.messages) ? room.messages.slice() : [];
                                let mutated = false;
                                for (let mi = 0; mi < msgs.length; mi++) {
                                    const m = msgs[mi];
                                    if (!m || !m.id) continue;
                                    const receipts = Array.isArray(m.receipts) ? m.receipts.slice() : [];
                                    let found = false;
                                    for (let ri = 0; ri < receipts.length; ri++) {
                                        if (String(receipts[ri].user_id) === String(me)) {
                                            receipts[ri] = { ...receipts[ri], delivered: true, delivered_at: receipts[ri].delivered_at || nowIso, read: true, read_at: nowIso };
                                            found = true; break;
                                        }
                                    }
                                    if (!found) receipts.push({ user_id: me, delivered: true, delivered_at: nowIso, read: true, read_at: nowIso });
                                    const anyRead = receipts.some(r => r && (r.read === true || r.read === 'true'));
                                    const allDelivered = receipts.length && receipts.every(r => r && (r.delivered === true || r.delivered === 'true'));
                                    msgs[mi] = { ...m, receipts, status: anyRead ? 'read' : (allDelivered ? 'delivered' : 'sent') };
                                    mutated = true;
                                }
                                if (!mutated) return prev;
                                room.messages = msgs;
                                // clear unread flag when user views/marks read
                                try { room.unread = false; } catch (e) {}
                                copy[idx] = room;
                                return copy;
                            } catch (e) { return prev; }
                        });
                    } catch (e) {}
                }

                if (typeof window !== 'undefined' && window._agrovet_chat_service && typeof window._agrovet_chat_service.send === 'function') {
                    try {
                        window._agrovet_chat_service.send({ type: 'mark_read', room: activeId });
                        console.log('[READ] 🔹 Enviando mark_read (WS) para room', activeId);
                        // Also attempt an HTTP fallback to ensure server persists the read
                                                        try {
                                                                const tokenRaw = localStorage.getItem('token');
                                                                const token = tokenRaw ? tokenRaw.replace(/^Token\s*/i, '').replace(/^Bearer\s*/i, '') : null;
                                                                if (token) {
                                                                        // use dynamic import (works in browser) to avoid 'require is not defined'
                                                                        import('../../../services/endpoints/chat')
                                                                            .then((mod) => {
                                                                                try {
                                                                                    const chatAPI = mod.chatAPI || (mod.default && mod.default.chatAPI) || mod;
                                                                                    if (chatAPI && typeof chatAPI.markRead === 'function') {
                                                                                        chatAPI.markRead(activeId)({ token }).catch((err) => {
                                                                                            try { console.warn('[READ] HTTP markRead fallback failed', err); } catch (e) {}
                                                                                        });
                                                                                    }
                                                                                } catch (err) {
                                                                                    try { console.warn('[READ] dynamic import succeeded but markRead call failed', err); } catch(e){}
                                                                                }
                                                                            })
                                                                            .catch((err) => {
                                                                                try { console.warn('[READ] dynamic import of chatAPI failed', err); } catch(e){}
                                                                            });
                                                                }
                                                        } catch (e) { console.warn('[READ] HTTP fallback failed to start', e); }
                    } catch (e) {
                        console.warn('[READ] failed sending mark_read', e);
                    }
                }
            } catch (e) {}
        };

        const visibilityHandler = () => { if (document.visibilityState === 'visible') onVisibleOrFocus(); };
        try { document.addEventListener && document.addEventListener('visibilitychange', visibilityHandler); } catch (e) {}
        try { window.addEventListener && window.addEventListener('focus', onVisibleOrFocus); } catch (e) {}

        return () => {
            try { if (typeof _unsubscribe_store === 'function') _unsubscribe_store(); } catch (e) {}
            try { document.removeEventListener && document.removeEventListener('visibilitychange', visibilityHandler); } catch (e) {}
            try { window.removeEventListener && window.removeEventListener('focus', onVisibleOrFocus); } catch (e) {}
        };
    }, [activeId, getCurrentUserId, setRooms]);
}
