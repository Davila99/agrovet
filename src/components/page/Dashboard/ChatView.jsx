import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  List,
  ListItem,
  Avatar,
  Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const chatsMock = [
  {
    id: 1,
    name: "Veterinario Juan",
    lastMessage: "Revisa el ganado",
    avatar: "VJ",
  },
  {
    id: 2,
    name: "Agrónoma Ana",
    lastMessage: "Problema con cultivos",
    avatar: "AA",
  },
  {
    id: 3,
    name: "Veterinario Carlos",
    lastMessage: "Chequeo semanal",
    avatar: "VC",
  },
  {
    id: 4,
    name: "Agrónomo Luis",
    lastMessage: "Actualización de finca",
    avatar: "AL",
  },
];

const ChatView = () => {
  const [activeChat, setActiveChat] = useState(chatsMock[0]);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hola, ¿cómo estás?", sender: "other" },
    { id: 2, text: "Bien, gracias.", sender: "user" },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), text: input, sender: "user" }]);
    setInput("");
  };

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box
      sx={{
        display: "flex",
        height: "79vh",
        width: "100%",
        mx: "auto",

      }}>
      {/* Lista de chats */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          width: 300,
          bgcolor: "#f8f9fa",
          borderRight: "1px solid #ddd",
      
        }}>
        <List>
          {chatsMock.map((chat) => (
            <ListItem
              button
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              sx={{
                mb: 1,
                borderRadius: 2,
                "&:hover": { bgcolor: "#e0f2f1" },
                bgcolor: activeChat.id === chat.id ? "#b2dfdb" : "transparent",
              }}>
              <Avatar sx={{ mr: 2 }}>{chat.avatar}</Avatar>
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {chat.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {chat.lastMessage}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Conversación */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            bgcolor: "#103E68",
            color: "#fff",
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}>
          <Avatar>{activeChat.avatar}</Avatar>
          <Box>
            <Typography variant="h6">{activeChat.name}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              En línea
            </Typography>
          </Box>
        </Box>

        {/* Mensajes */}
        <Box
          sx={{
            flex: 1,
            p: 2,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            bgcolor: "#f1f1f1",
          }}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: "flex",
                justifyContent:
                  msg.sender === "user" ? "flex-end" : "flex-start",
              }}>
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: msg.sender === "user" ? "#103E68" : "#fff",
                  color: msg.sender === "user" ? "#fff" : "#000",
                  borderRadius: 2,
                  maxWidth: "70%",
                  boxShadow: 1,
                }}>
                <Typography>{msg.text}</Typography>
              </Paper>
            </Box>
          ))}
          <div ref={scrollRef}></div>
        </Box>

        {/* Input */}
        <Box sx={{ display: "flex", p: 1, gap: 1, bgcolor: "#eee" }}>
          <TextField
            fullWidth
            placeholder="Escribe un mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            sx={{ borderRadius: 3, bgcolor: "#fff" }}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            sx={{
              bgcolor: "#103E68",
              "&:hover": { bgcolor: "#35722b" },
              color: "#fff",
              borderRadius: 2,
            }}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatView;
