import React, { useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import MessageItem from "./components/MessageItem";
import { formatTimestamp, dedupeMessages } from "./chatUtils";

export default function ChatMessages({
  activeConv,
  activeId,
  messagesEndRef,
  getCurrentUserId,
  isMd,
}) {
  const userId = getCurrentUserId();

  // Debug: (removed verbose render log)

  // Build deduped, chronological messages array once per activeConv
  const msgs = useMemo(() => {
    const raw = (activeConv?.messages || []).slice();
    // Dedupe first (preserve the first-seen ordering), then ensure chronological
    try {
      const deduped = dedupeMessages(raw || []);
      deduped.sort(
        (a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
      );
      return deduped;
    } catch (e) {
      try {
        raw.sort(
          (a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
        );
      } catch (ee) {}
      return raw || [];
    }
  }, [activeConv]);

  // Scroll to bottom when messages change
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        messagesEndRef.current?.scrollIntoView({
          behavior: "auto",
          block: "end",
        });
      } catch (e) {}
    }, 50);
    return () => clearTimeout(t);
  }, [msgs.length]);

  // Send mark_read when user opens a conversation
  useEffect(() => {
    try {
      if (!activeId) return;
      // 1) Send WS mark_read (best-effort)
      try {
        if (
          typeof window !== "undefined" &&
          window._agrovet_chat_service &&
          typeof window._agrovet_chat_service.send === "function"
        ) {
          try {
            window._agrovet_chat_service.send({
              type: "mark_read",
              room: activeId,
            });
          } catch (e) {
            /* ignore */
          }
        }
      } catch (e) {}

      // 2) Optimistically update local store receipts so ticks turn blue immediately
      try {
        const currentUserId =
          typeof getCurrentUserId === "function"
            ? String(getCurrentUserId())
            : null;
        const msgsSnapshot =
          activeConv && Array.isArray(activeConv.messages)
            ? activeConv.messages.slice()
            : [];
        if (
          msgsSnapshot.length &&
          typeof window !== "undefined" &&
          window._agrovet_chat_store &&
          typeof window._agrovet_chat_store.updateMessage === "function"
        ) {
          msgsSnapshot.forEach((m) => {
            try {
              const mid = m && (m.id || m.message_id);
              if (!mid) return;
              // Skip messages sent by current user
              const fromMe =
                String(m.sender_id) === String(currentUserId) || m.fromMe;
              if (fromMe) return;

              const existingReceipts = Array.isArray(m.receipts)
                ? m.receipts.slice()
                : [];
              const hasRead = existingReceipts.some(
                (r) =>
                  r &&
                  String(r.user_id) === String(currentUserId) &&
                  (r.read === true || r.read === "true")
              );
              if (hasRead) return;

              // append a local read receipt for UI purposes; server will reconcile
              const now = new Date().toISOString();
              const added = {
                user_id: currentUserId,
                read: true,
                read_at: now,
                delivered: true,
              };
              const nextReceipts = existingReceipts.concat([added]);
              // call debug store update: (mid, receipts, roomId)
              try {
                window._agrovet_chat_store.updateMessage(
                  mid,
                  nextReceipts,
                  activeId
                );
              } catch (e) {}
            } catch (e) {}
          });
        }
      } catch (e) {}

      // 3) Ensure server persists read state via HTTP fallback and apply
      // server-acknowledged updates locally when possible. Run in an
      // async IIFE so we can await the HTTP call without making the
      // effect callback async directly.
      (async () => {
        try {
          const raw =
            typeof window !== "undefined"
              ? localStorage.getItem("token")
              : null;
          const token = raw
            ? raw.replace(/^Token\s*/i, "").replace(/^Bearer\s*/i, "")
            : null;
          if (!token) return;
          try {
            // use dynamic import to avoid bundler/require issues in the browser
            const mod = await import("../../../services/endpoints/chat");
            const chatAPI =
              mod &&
              (mod.chatAPI ||
                (mod.default && mod.default.chatAPI) ||
                mod.default ||
                mod);
            const res = chatAPI
              ? await chatAPI.markRead(activeId)({ token })
              : null;
            // res is expected to be { updated: [<message_id>, ...] }
            if (res && Array.isArray(res.updated) && res.updated.length) {
              try {
                const me =
                  typeof getCurrentUserId === "function"
                    ? getCurrentUserId()
                    : null;
                const nowIso = new Date().toISOString();
                for (const mid of res.updated) {
                  try {
                    const receipts = [
                      {
                        user_id: me,
                        delivered: true,
                        delivered_at: nowIso,
                        read: true,
                        read_at: nowIso,
                      },
                    ];
                    if (
                      typeof window !== "undefined" &&
                      window._agrovet_chat_store &&
                      typeof window._agrovet_chat_store.updateMessage ===
                        "function"
                    ) {
                      window._agrovet_chat_store.updateMessage(
                        mid,
                        receipts,
                        activeId
                      );
                    }
                    // avoid directly mutating local rooms state here; rely on the debug store
                    // and existing subscription machinery to propagate updates.
                  } catch (e) {}
                }
              } catch (e) {}
            }
          } catch (e) {
            try {
              console.warn("[READ] HTTP markRead fallback failed", e);
            } catch (ee) {}
          }
        } catch (e) {}
      })();
    } catch (e) {}
  }, [activeId]);

  if (!activeConv) {
    // show the placeholder only on desktop (isMd === true). On mobile hide it so the list occupies the screen.
    if (!isMd) return null;
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Selecciona un chat para comenzar a conversar
        </Typography>
      </Box>
    );
  }

  // quiet: removed post-dedupe length log

  return (
    <Box
      id="chat-messages-container"
      sx={{
        flex: 1,
        overflowY: "auto",
        p: 1,
        backgroundColor: "#f6fff8",
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='%2339FF14' fill-opacity='0.06'><circle cx='20' cy='30' r='8'/><circle cx='34' cy='18' r='6'/><circle cx='12' cy='18' r='6'/><circle cx='58' cy='30' r='8'/><circle cx='72' cy='18' r='6'/><circle cx='50' cy='18' r='6'/></g></svg>")`,
        backgroundRepeat: "repeat",
        backgroundSize: "160px 160px",
      }}
    >
      {msgs.map((m, i) => (
        <MessageItem
          key={String(m.uid || m.id || `${m.timestamp || ""}_${i}`)}
          m={m}
          index={i}
          userId={userId}
          activeConv={activeConv}
          activeId={activeId}
        />
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
}




