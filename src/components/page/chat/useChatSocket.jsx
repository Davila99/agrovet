import { useEffect } from "react";
import useChatWebSocket from "../../../hooks/useChatWebSocket";
import { normalizeStoredToken, dedupeMessages } from "./chatUtils";
import { createOnMessageHandler } from "./chatSocketHandlers";
import { playNotifySound } from "../../../services/sound";

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

    // Attach websocket via the shared hook. The connect factory is called by
    // useChatWebSocket inside its own effect; we only provide the connect function.
    useChatWebSocket((svc) => {
        try {
            if (!activeId) return;
            if (String(activeId) === "bot-chat") return;

            // debug connecting log removed

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
                                    try { console.log('[ROOM_UPDATE] (updateMessage) completed scan, changed=', changed); } catch (e) {}
                                    return changed ? copy : prev;
                                } catch (e) { return prev; }
                            });
                        }

                        if (ev.type === 'addIncomingMessage' && ev.message) {
                            const payload = ev.message;
                            const roomHint = payload && (payload.room || payload.room_id || payload.roomId) || null;
                            setRooms((prev) => {
                                try {
                                    const roomIdToFind = roomHint ? String(roomHint) : String(activeId);

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
                                        const newMsgs = dedupeMessages([...msgs, payload]);
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
                                    if (!exists) {
                                        const newRoom = {
                                            id: String(roomIdToFind),
                                            name: 'Chat ' + String(roomIdToFind),
                                            avatar: '',
                                            participants: [],
                                            messages: dedupeMessages([payload]),
                                            lastMessage: payload.text || '',
                                            last_activity: payload.timestamp || new Date().toISOString(),
                                            unread: !fromMe,
                                        };
                                        try { console.log('[ROOM_UPDATE] (addIncomingMessage) created newRoom', roomIdToFind, 'messages before: 0 after: 1', payload.id); } catch (e) {}
                                        return [newRoom, ...prev];
                                    }

                                    // Move updated room to the top preserving order for others
                                    const updatedRoom = mapped.find((r) => String(r.id) === String(roomIdToFind));
                                    const others = mapped.filter((r) => String(r.id) !== String(roomIdToFind));
                                    try { console.log('[ROOM_UPDATE] (addIncomingMessage) room', roomIdToFind, 'before msgs:', (prev.find(p => String(p.id) === String(roomIdToFind))?.messages || []).length, 'incoming id:', payload.id); } catch (e) {}
                                    try { console.log('[ROOM_UPDATE] (addIncomingMessage) room', roomIdToFind, 'after msgs:', (updatedRoom.messages || []).length, 'incoming id:', payload.id); } catch (e) {}
                                    return [updatedRoom, ...others];
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
                        console.log('[READ] 🔹 Enviando mark_read para room', activeId);
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
