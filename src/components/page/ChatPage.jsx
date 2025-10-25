import React from "react";
import ChatBot from "./HomePage/ChatBot";
import { Box, Typography } from "@mui/material";

const ChatPage = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, color: "#103E68" }}>
        AVA - Asistente Virtual
      </Typography>
      <Box
        sx={{
          height: "70vh",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <ChatBot />
      </Box>
    </Box>
  );
};

export default ChatPage;
