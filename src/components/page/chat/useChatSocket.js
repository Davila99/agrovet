import { useEffect } from "react";
import { chatServiceFactory } from "../../../services/endpoints";
import { normalizeStoredToken, mergeRooms } from "./chatUtils";
import { playNotifySound } from "../../../services/sound";

export default function useChatSocket({
  activeId,
  setRooms,
  markUserOnline,
  markUserOffline,
  getReceiptUserId,
  getCurrentUserId,
}) {
  useEffect(() => {
    if (!activeId) return;
    if (String(activeId) === "bot-chat") return;

    const svc = chatServiceFactory();
    const rawStored = localStorage.getItem("token");
    const token = normalizeStoredToken(rawStored);
    try {
      console.debug('[useChatSocket] connecting', { activeId, rawTokenLength: rawStored ? String(rawStored).length : 0, rawTokenMasked: rawStored ? String(rawStored).slice(0,8) + '...' : null, tokenMasked: token ? String(token).slice(0,8) + '...' : null });
    } catch (e) {}

    try {
      svc.connect(activeId, token, {
      onOpen: () => {
        console.debug("[Chat] WS open", { activeId });
      },
      onMessage: (ev) => {
        try {
          const raw = typeof ev === "string" ? ev : ev.data;
          const d = JSON.parse(raw);
          if (d.type === "presence.online")
            return markUserOnline(d.user_id || d.user);
          if (d.type === "presence.offline")
            return markUserOffline(d.user_id || d.user);

          // Only handle chat.message / chat.* payloads that carry message content
          if (d.type && d.type.startsWith("chat.")) {
            const msg = {
              id: d.message_id || d.id || "msg_" + Date.now(),
              sender_id: d.sender_id || d.sender || (d.sender && d.sender.id),
              text: d.message || d.content || d.text || "",
              timestamp: d.timestamp || d.created_at || new Date().toISOString(),
              fromMe: String(d.sender_id) === String(getCurrentUserId()) || false,
              receipts: d.receipts || [],
            };

            // Play notification sound when a message arrives and either
            // - the tab/window is not focused, or
            // - the active chat isn't the room for this message
            try {
              const incomingRoom = d.room_id || d.room || null;
              const focused = typeof document !== 'undefined' ? document.hasFocus && document.hasFocus() : true;
              const notFocused = typeof document !== 'undefined' ? document.hidden || !focused : false;
              const isDifferentRoom = incomingRoom && String(incomingRoom) !== String(activeId);
              if (!msg.fromMe && (notFocused || isDifferentRoom)) {
                playNotifySound();
              }
            } catch (e) {}

            setRooms((prev) => {
              try {
                const idx = prev.findIndex((r) => String(r.id) === String(activeId));
                if (idx === -1) return prev;
                const copy = prev.slice();
                const room = { ...(copy[idx] || {}) };
                const msgs = Array.isArray(room.messages) ? room.messages.slice() : [];

                // If server message already present by id, do nothing
                if (msgs.some((m) => String(m.id) === String(msg.id))) return prev;

                // Try to find an optimistic message that matches (fromMe and same text)
                const optIdx = msgs.findIndex(
                  (m) => String(m.id).startsWith("tmp_") && String(m.sender_id) === String(msg.sender_id) && String((m.text||"").trim()) === String((msg.text||"").trim())
                );

                if (optIdx !== -1) {
                  // Replace optimistic message with server message
                  msgs[optIdx] = msg;
                } else {
                  msgs.push(msg);
                }

                room.messages = msgs;
                room.lastMessage = msg.text || room.lastMessage;
                room.last_activity = msg.timestamp || room.last_activity;
                copy[idx] = room;

                // Resort rooms by last_activity / latest message timestamp
                const sorted = copy.slice().sort((a, b) => {
                  const ta = new Date(a.last_activity || (a.messages && a.messages.length ? a.messages[a.messages.length - 1].timestamp : 0)).getTime() || 0;
                  const tb = new Date(b.last_activity || (b.messages && b.messages.length ? b.messages[b.messages.length - 1].timestamp : 0)).getTime() || 0;
                  return tb - ta;
                });

                return sorted;
              } catch (e) {
                return prev;
              }
            });
          }
        } catch (e) {
          console.error("[Chat WS] parse error", e);
        }
      },
      onClose: (ev) => {
        try { console.debug('[Chat] WS closed', { activeId, code: ev && ev.code, reason: ev && ev.reason, wasClean: ev && ev.wasClean }); } catch(e){}
      },
      onError: (e) => {
        try { console.error('[Chat] WS error', { activeId, errorEvent: e }); } catch(err){}
      },
    });
    } catch (outer) {
      console.error('[useChatSocket] svc.connect threw', outer, { activeId });
    }

    return () => {
      try {
        svc.disconnect();
      } catch (e) {}
    };
  }, [activeId]);
}
