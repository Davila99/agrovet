import React, { useEffect, useState, useRef } from "react";
import { chatServiceFactory } from "../../services/endpoints";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";

export default function ChatView() {
  const [room, setRoom] = useState("1");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const serviceRef = useRef(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current)
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  function addMessage(who, body) {
    setMessages((m) => [...m, { who, body, id: Date.now() }]);
  }

  function connect() {
    const normalizeStoredToken = (raw) => {
      if (!raw) return null;
      const s = String(raw).trim();
      if (s === "null" || s === "undefined" || s === "") return null;
      return s.replace(/^Token\s*/i, "").replace(/^Bearer\s*/i, "");
    };
    const token =
      typeof window !== "undefined"
        ? normalizeStoredToken(localStorage.getItem("token"))
        : null;
    const svc = chatServiceFactory();
    serviceRef.current = svc;
    svc.connect(room, token, {
      onOpen: () => {
        setConnected(true);
        addMessage("system", "connected");
      },
      onClose: () => {
        setConnected(false);
        addMessage("system", "disconnected");
      },
      onError: (e) => {
        addMessage("system", "error");
      },
      onMessage: (ev) => {
        try {
          const d = JSON.parse(ev.data);
          addMessage("remote", JSON.stringify(d));
        } catch (e) {
          addMessage("remote", ev.data);
        }
      },
    });
  }

  function disconnect() {
    if (serviceRef.current) serviceRef.current.disconnect();
    setConnected(false);
  }

  function send() {
    if (!serviceRef.current) return addMessage("system", "not connected");
    const payload = { message: text };
    try {
      serviceRef.current.send(payload);
      addMessage("me", JSON.stringify(payload));
      setText("");
    } catch (e) {
      addMessage("system", "send failed: " + (e.message || e));
    }
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2, paddingTop: 10 }}>
      {/* <Typography variant="h5" sx={{ mb: 2 }}>
        Chat (WS)
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            label="Room id"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <Button variant="contained" onClick={connect} disabled={connected}>
            Connect
          </Button>
          <Button variant="outlined" onClick={disconnect} disabled={!connected}>
            Disconnect
          </Button>
          <Typography sx={{ ml: 2 }}>
            {connected ? "Connected" : "Disconnected"}
          </Typography>
        </Box>
      </Paper>

      <Paper
        sx={{ p: 2, mb: 2, height: 360, overflow: "auto" }}
        ref={messagesRef}
      >
        {messages.map((m) => (
          <Box key={m.id} sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {m.who}
            </Typography>
            <Typography>{m.body}</Typography>
          </Box>
        ))}
      </Paper>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          placeholder="Escribe mensaje"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <Button variant="contained" onClick={send}>
          Send
        </Button>
      </Box> */}
    </Box>
  );
}
