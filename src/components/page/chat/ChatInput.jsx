import React from "react";
import { Box, IconButton, TextField, InputAdornment } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";

export default function ChatInput({
  text,
  setText,
  handleSend,
  handleKeyDown,
}) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderTop: "1px solid rgba(0,0,0,0.08)",
        backgroundColor: "background.paper",
        flexShrink: 0,
      }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Escribe un mensaje..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton>
                <AttachFileIcon />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton color="primary" onClick={handleSend}>
                <SendIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
