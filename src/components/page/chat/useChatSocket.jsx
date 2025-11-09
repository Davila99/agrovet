import { useEffect } from "react";
import useChatWebSocket from "../../../hooks/useChatWebSocket";
import { normalizeStoredToken } from "./chatUtils";
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

            try {
                console.debug('[useChatSocket] connecting', { activeId, rawTokenLength: rawStored ? String(rawStored).length : 0 });
            } catch (e) {}

            try {
                svc.connect(activeId, token, {
                    onOpen: () => { console.debug("[Chat] WS open", { activeId }); },
                    onMessage: createOnMessageHandler({ activeId, setRooms, markUserOnline, markUserOffline, getCurrentUserId, playNotifySound }),
                    onClose: (ev) => { try { console.debug('[Chat] WS closed', { activeId, code: ev && ev.code, reason: ev && ev.reason, wasClean: ev && ev.wasClean }); } catch(e){} },
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
                                                msgs[mi] = { ...m, receipts };
                                                room.messages = msgs;
                                                copy[ri] = room;
                                                changed = true;
                                            }
                                        }
                                    }
                                    return changed ? copy : prev;
                                } catch (e) { return prev; }
                            });
                        }

                        if (ev.type === 'addIncomingMessage' && ev.message) {
                            const payload = ev.message;
                            const roomHint = payload && (payload.room || payload.room_id || payload.roomId) || null;
                            setRooms((prev) => {
                                try {
                                    const copy = prev.slice();
                                    const roomIdToFind = roomHint ? String(roomHint) : String(activeId);
                                    const idx = copy.findIndex((r) => String(r.id) === roomIdToFind);
                                    if (idx === -1) {
                                        const newRoom = {
                                            id: String(roomIdToFind),
                                            name: 'Chat ' + String(roomIdToFind),
                                            avatar: '',
                                            participants: [],
                                            messages: [payload],
                                            lastMessage: payload.text || '',
                                            last_activity: payload.timestamp || new Date().toISOString(),
                                        };
                                        const newCopy = [newRoom, ...copy];
                                        console.debug('[useChatSocket][store] addIncomingMessage: created new room for incoming message', newRoom.id);
                                        return newCopy;
                                    }
                                    const room = { ...(copy[idx] || {}) };
                                    const msgs = Array.isArray(room.messages) ? room.messages.slice() : [];
                                    if (!msgs.some(m => String(m.id) === String(payload.id))) msgs.push(payload);
                                    room.messages = msgs;
                                    room.lastMessage = payload.text || room.lastMessage;
                                    room.last_activity = payload.timestamp || room.last_activity;
                                    copy[idx] = room;
                                    return copy;
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
