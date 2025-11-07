import React, { useRef, useEffect } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { formatTimestamp } from "./chatUtils";

export default function ChatMessages({
  activeConv,
  activeId,
  messagesEndRef,
  getCurrentUserId,
}) {
  const userId = getCurrentUserId();

  useEffect(() => {
    // Scroll to bottom when messages change. Use a short timeout to let React render
    // and then jump to the end to avoid layout shift from smooth scrolling.
    setTimeout(() => {
      try {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
      } catch (e) {
        // ignore
      }
    }, 50);
  }, [activeConv?.messages?.length]);

  if (!activeConv) {
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

  return (
    <Box
      id="chat-messages-container"
      sx={{
        flex: 1,
        overflowY: "auto",
        p: 2,
        backgroundColor: "#f6fff8",
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='%2339FF14' fill-opacity='0.06'><circle cx='20' cy='30' r='8'/><circle cx='34' cy='18' r='6'/><circle cx='12' cy='18' r='6'/><circle cx='58' cy='30' r='8'/><circle cx='72' cy='18' r='6'/><circle cx='50' cy='18' r='6'/></g></svg>")`,
        backgroundRepeat: "repeat",
        backgroundSize: "160px 160px",
      }}
    >
      {(activeConv?.messages || [])
        .slice()
        .sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0))
        .map((m, i) => {
          const fromMe = String(m.sender_id) === String(userId) || m.fromMe;
          const key = String(m.id || m.uid || `${m.timestamp || ''}_${i}`);
          return (
            <Box
              key={key}
              data-msg-id={m.id}
              data-fromme={fromMe}
              sx={{
                display: "flex",
                justifyContent: fromMe ? "flex-end" : "flex-start",
                mb: 1,
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 1.2,
                  maxWidth: "70%",
                  bgcolor: fromMe ? "#DCF8C6" : "white",
                  borderRadius: "12px",
                }}
              >
                <Typography variant="body2">{m.text}</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: "right",
                    color: "text.secondary",
                  }}
                >
                  {formatTimestamp(m.timestamp)}
                </Typography>
              </Paper>
            </Box>
          );
        })}
      <div ref={messagesEndRef} />
    </Box>
  );
}
