import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Divider,
  TextField,
  InputAdornment,
  Button,
  Stack,
  Badge,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SpecialistsList from "../Dashboard/SpecialistsList";
import { resolveAvatar, cleanName } from "./chatUtils";

export default function ChatList({
  rooms,
  activeId,
  viewMode,
  setViewMode,
  specialistSearch,
  setSpecialistSearch,
  onSelectChat,
  openOneToOne,
  isMd,
  getCurrentUserId,
  computeLastTsForRoom,
  isParticipantOnline,
}) {
  return (
   
    <Box
      sx={{
        width: { xs: "100%", md: 420 },
        borderRight: { md: "1px solid rgba(0,0,0,0.08)" },
        bgcolor: "background.paper",
        // responsive display: hide on xs when a chat is active (narrow layout),
        // otherwise show as block on xs and as flex on md+.
        display: { xs: activeId && !isMd ? "none" : "block", md: "flex" },
        height: "100%",
        flexDirection: "column",
      }}
    >
  {/* CHAT_LIST render log removed */}
  <Box sx={{ p: 2 }}>
        <Typography variant="h6">Chats</Typography>
        <Typography variant="caption" color="text.secondary">
          Conversaciones recientes
        </Typography>

        <Box sx={{ mt: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Buscar especialistas"
            value={specialistSearch}
            onChange={(e) => setSpecialistSearch(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "999px",
                backgroundColor: "rgba(0,0,0,0.02)",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {["chats", "specialists", "bot"].map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "contained" : "outlined"}
              size="small"
              onClick={() => setViewMode(mode)}
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                ...(viewMode === mode
                  ? {
                      backgroundColor: "#1565C0",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#0f4a86" },
                    }
                  : { borderColor: "#1565C0", color: "#1565C0" }),
              }}
            >
              {mode === "chats"
                ? "Chats"
                : mode === "specialists"
                ? "Especialistas"
                : "ChatBot"}
            </Button>
          ))}
        </Stack>
      </Box>
      <Divider />

      {viewMode === "chats" && (
        <List sx={{ flex: 1, overflowY: "auto" }}>
          {rooms
            .slice()
            .sort(
              (a, b) =>
                (computeLastTsForRoom(b) || 0) -
                (computeLastTsForRoom(a) || 0)
            )
            .map((c) => {
              const avatarSrc = resolveAvatar(c.avatar || "");
              return (
                <ListItemButton
                  key={c.id}
                  onClick={() => onSelectChat(String(c.id))}
                  selected={String(activeId) === String(c.id)}
                >
                  <ListItemAvatar>
                    <Avatar src={avatarSrc} alt={c.name}>
                      {!avatarSrc && c.name ? c.name.charAt(0) : null}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={cleanName(c.name)}
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {c.lastMessage}
                      </Typography>
                    }
                  />
                </ListItemButton>
              );
            })}
        </List>
      )}

      {viewMode === "specialists" && (
        <SpecialistsList
          onSelectSpecialist={(u) => {
            try {
              const p = openOneToOne(u);
              if (p && p.then) {
                p.then((room) => {
                  if (room && room.id) {
                    // switch to chats view and select the newly opened room
                    setViewMode("chats");
                    onSelectChat(String(room.id));
                  } else {
                    // fallback: do nothing (SpecialistsList will navigate if no handler)
                  }
                }).catch((err) => {
                  console.warn('openOneToOne failed in ChatList wrapper', err);
                });
              }
            } catch (e) {
              console.warn('openOneToOne wrapper error', e);
            }
          }}
          searchQuery={specialistSearch}
        />
      )}
    </Box>
  );
}
