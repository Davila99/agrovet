import { useEffect } from "react";
import { chatServiceFactory } from "../../../services/endpoints";
import { normalizeStoredToken } from "./chatUtils";

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

            setRooms((prev) => {
              const idx = prev.findIndex((r) => String(r.id) === String(activeId));
              if (idx === -1) return prev;
              const copy = [...prev];
              const room = copy[idx] || { messages: [] };

              // Defensive: ensure messages array
              const msgs = Array.isArray(room.messages) ? room.messages : [];

              // Avoid inserting duplicate messages (same id)
              const exists = msgs.some((m) => String(m.id) === String(msg.id));
              if (exists) return prev;

              copy[idx] = { ...room, messages: [...msgs, msg] };
              return copy;
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
