import { useEffect } from "react";
import { chatServiceFactory } from "../../../services/endpoints";

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
    const token = localStorage.getItem("token");

    svc.connect(activeId, token, {
      onOpen: () => console.debug("[Chat] WS open"),
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
      onClose: () => console.debug("[Chat] WS closed"),
      onError: (e) => console.debug("[Chat] WS error", e),
    });

    return () => {
      try {
        svc.disconnect();
      } catch (e) {}
    };
  }, [activeId]);
}
