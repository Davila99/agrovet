import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  TextField,
  Paper,
  useMediaQuery,
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SendIcon from "@mui/icons-material/Send";

const mockChats = [
  {
    id: "1",
    name: "María",
    lastMessage: "¿Cómo va ese proyecto?",
    avatar: "",
    messages: [
      { id: 1, from: "them", text: "Hola!" },
      { id: 2, from: "me", text: "Bien, trabajando en ello." },
    ],
  },
  {
    id: "2",
    name: "Carlos",
    lastMessage: "Nos vemos mañana",
    avatar: "",
    messages: [{ id: 1, from: "them", text: "Listo, confirmé hora" }],
  },
];

const Sidebar = ({ chats, onSelect, selectedId }) => {
  return (
    <Box
      sx={{
        width: 300,
        bgcolor: "background.paper",
        height: "100%",
        borderRight: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6">Chats</Typography>
        <IconButton size="small">{/* placeholder for new chat */}+</IconButton>
      </Box>
      <Divider />
      <List>
        {chats.map((c) => (
          <ListItemButton
            key={c.id}
            selected={selectedId === c.id}
            onClick={() => onSelect(c.id)}
            sx={{ py: 1.25 }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                {c.name?.[0] || "U"}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={c.name}
              secondary={c.lastMessage}
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

const ChatWindow = ({ chat, onSend }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6">
            {chat?.name || "Selecciona un chat"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {chat?.lastMessage}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <IconButton size="small">📎</IconButton>
          <IconButton size="small">⋯</IconButton>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, p: 2, overflowY: "auto", bgcolor: "#fafbfd" }}>
        {chat?.messages?.map((m) => (
          <Box
            key={m.id}
            sx={{
              display: "flex",
              mb: 1.25,
              justifyContent: m.from === "me" ? "flex-end" : "flex-start",
              px: 1,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 1.25,
                maxWidth: { xs: "80%", md: "60%" },
                borderRadius: 2,
                bgcolor: m.from === "me" ? "primary.main" : "#fff",
                color: m.from === "me" ? "#fff" : "text.primary",
                boxShadow: m.from === "me" ? 2 : 1,
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {m.text}
              </Typography>
            </Paper>
          </Box>
        ))}
        <div ref={bottomRef} />
      </Box>

      <Box
        sx={{
          p: 1.5,
          borderTop: "1px solid rgba(0,0,0,0.06)",
          background: "linear-gradient(180deg, #fff, #f7fbff)",
        }}
      >
        <MessageInput onSend={onSend} />
      </Box>
    </Box>
  );
};

const MessageInput = ({ onSend }) => {
  const [value, setValue] = useState("");

  const send = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <TextField
        multiline
        maxRows={4}
        placeholder="Escribe un mensaje"
        fullWidth
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        size="small"
      />
      <IconButton color="primary" onClick={send} sx={{ alignSelf: "flex-end" }}>
        <SendIcon />
      </IconButton>
    </Box>
  );
};

const Chat = () => {
  const [chats, setChats] = useState(mockChats);
  const [selectedId, setSelectedId] = useState(chats[0]?.id || null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMd = useMediaQuery("(min-width:900px)");

  useEffect(() => {
    if (!selectedId && chats.length) setSelectedId(chats[0].id);
  }, [chats, selectedId]);

  const selectedChat = chats.find((c) => c.id === selectedId) || null;

  const handleSelect = (id) => {
    setSelectedId(id);
    if (!isMd) setMobileOpen(false);
  };

  const handleSend = (text) => {
    if (!selectedId) return;
    setChats((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              lastMessage: text,
              messages: [
                ...(c.messages || []),
                { id: Date.now(), from: "me", text },
              ],
            }
          : c
      )
    );
  };

  return (
    <Box sx={{ height: "100%", display: { xs: "block", md: "flex" } }}>
      {isMd ? (
        <Sidebar
          chats={chats}
          onSelect={handleSelect}
          selectedId={selectedId}
        />
      ) : (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{ position: "absolute", top: 86, left: 18, zIndex: 1200 }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      >
        <Sidebar
          chats={chats}
          onSelect={handleSelect}
          selectedId={selectedId}
        />
      </Drawer>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 420,
        }}
      >
        {selectedChat ? (
          <ChatWindow chat={selectedChat} onSend={handleSend} />
        ) : (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Selecciona un chat
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Chat;
