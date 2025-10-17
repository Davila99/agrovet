import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  InputBase,
  Paper,
  useMediaQuery,
  AppBar,
  Toolbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const initialConversations = [
  {
    id: "c1",
    name: "María García",
    avatar: "https://i.pravatar.cc/40?img=12",
    lastMessage: "Gracias, lo reviso esta tarde",
    messages: [
      { id: 1, fromMe: false, text: "¿Puedes revisar el informe?" },
      { id: 2, fromMe: true, text: "Sí, en 10 minutos te lo envío" },
      { id: 3, fromMe: false, text: "Perfecto, gracias" },
    ],
  },
  {
    id: "c2",
    name: "Comunidad Agro",
    avatar: "https://i.pravatar.cc/40?img=5",
    lastMessage: "Nuevo anuncio publicado",
    messages: [
      { id: 1, fromMe: false, text: "Recordatorio: plática mañana 10AM" },
    ],
  },
  {
    id: "c3",
    name: "Tienda Local",
    avatar: "https://i.pravatar.cc/40?img=3",
    lastMessage: "Pedido listo para recogida",
    messages: [{ id: 1, fromMe: false, text: "Tu pedido está listo" }],
  },
];

export default function Chat() {
  const isMd = useMediaQuery("(min-width:900px)");
  const [conversations, setConversations] = useState(initialConversations);
  // No seleccionar automáticamente ningún chat al cargar — comportamiento tipo WhatsApp
  const [activeId, setActiveId] = useState(null);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeId) || null,
    [conversations, activeId]
  );

  const selectChat = (id) => {
    setActiveId(id);
  };

  const goBackToList = () => setActiveId(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !activeId) return;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c;
        const nextMsg = { id: Date.now(), fromMe: true, text: trimmed };
        return {
          ...c,
          messages: [...c.messages, nextMsg],
          lastMessage: trimmed,
        };
      })
    );
    setText("");
    // Scroll to bottom
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      {/* Lista lateral - oculta en móvil cuando se está en un chat */}
      {(!activeId || isMd) && (
        <Box
          sx={{
            width: { xs: "100%", md: 320 },
            borderRight: { md: "1px solid rgba(0,0,0,0.08)" },
            bgcolor: "background.paper",
            display: { xs: activeId && !isMd ? "none" : "block" },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Chats</Typography>
            <Typography variant="caption" color="text.secondary">
              Conversaciones recientes
            </Typography>
          </Box>
          <Divider />
          <List>
            {conversations.map((c) => (
              <ListItemButton
                key={c.id}
                onClick={() => selectChat(c.id)}
                selected={activeId === c.id}
              >
                <ListItemAvatar>
                  <Avatar src={c.avatar} alt={c.name} />
                </ListItemAvatar>
                <ListItemText
                  primary={c.name}
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {c.lastMessage}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}

      {/* Panel de conversación */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header en mobile con botón atrás */}
        {!isMd && activeId && (
          <AppBar position="static" color="transparent" elevation={1}>
            <Toolbar>
              <IconButton edge="start" onClick={goBackToList} aria-label="back">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="subtitle1">{activeConv?.name}</Typography>
            </Toolbar>
          </AppBar>
        )}

        {/* Mostrar placeholder sólo en escritorio cuando no hay chat seleccionado */}
        {!activeId && isMd ? (
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
        ) : activeId ? (
          <Box
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
              {activeConv?.messages.map((m) => (
                <Box
                  key={m.id}
                  sx={{
                    display: "flex",
                    justifyContent: m.fromMe ? "flex-end" : "flex-start",
                    mb: 1,
                  }}
                >
                  <Paper
                    sx={{
                      p: 1.2,
                      maxWidth: "75%",
                      bgcolor: m.fromMe ? "primary.main" : "grey.100",
                      color: m.fromMe ? "#fff" : "text.primary",
                    }}
                  >
                    <Typography variant="body2">{m.text}</Typography>
                  </Paper>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box
              sx={{
                p: 1,
                borderTop: "1px solid rgba(0,0,0,0.08)",
                display: "flex",
                gap: 1,
                alignItems: "center",
              }}
            >
              <IconButton>
                <AttachFileIcon />
              </IconButton>
              <Paper
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                sx={{ flex: 1, display: "flex", alignItems: "center", px: 1 }}
              >
                <InputBase
                  multiline
                  maxRows={4}
                  placeholder="Escribe un mensaje"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  sx={{ width: "100%" }}
                />
              </Paper>
              <IconButton
                color="primary"
                onClick={handleSend}
                aria-label="send"
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
