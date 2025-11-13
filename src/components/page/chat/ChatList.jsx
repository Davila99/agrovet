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
import { usePresenceStore } from '../../../store/usePresenceStore';

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
  const presenceUsers = usePresenceStore((s) => s.users || {});
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
              // Determine display name and avatar from participants (prefer other participant in 1:1)
              const parts = c && c.participants ? c.participants : [];
              const me = getCurrentUserId ? getCurrentUserId() : null;
              let other = null;
              if (Array.isArray(parts)) {
                for (const p of parts) {
                  try {
                    const pid = p && (p.id || p.user_id || p.pk) ? (p.id || p.user_id || p.pk) : p;
                    if (pid && String(pid) !== String(me)) { other = p; break; }
                  } catch (e) {}
                }
              }
              // Fallback to room-level fields
              const displayName = other && (other.name || other.full_name || other.username || other.display_name || other.first_name) ? (other.name || other.full_name || other.username || other.display_name || other.first_name) : (c.name || `Chat ${c.id}`);
              const avatarRaw = (other && (other.profile_picture_url || other.avatar || other.picture || other.photo)) || c.avatar || '';
              const avatarSrc = resolveAvatar(avatarRaw || "");
              const otherId = other && (other.id || other.user_id || other.pk) ? (other.id || other.user_id || other.pk) : null;
              const online = (() => {
                try {
                  if (typeof isParticipantOnline === 'function' && otherId) return isParticipantOnline(otherId);
                  const st = presenceUsers && otherId ? presenceUsers[String(otherId)] : null;
                  return st && st.isOnline;
                } catch (e) { return false; }
              })();

              return (
                <ListItemButton
                  key={c.id}
                  onClick={() => onSelectChat(String(c.id))}
                  selected={String(activeId) === String(c.id)}
                >
                  <ListItemAvatar>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Avatar src={avatarSrc} alt={displayName}>
                        {!avatarSrc && displayName ? String(displayName).charAt(0) : null}
                      </Avatar>
                      {/* online dot for other participant */}
                      {online && (
                        <Box sx={{ position: 'absolute', right: -4, bottom: -4, width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main', border: '2px solid white' }} />
                      )}
                    </Box>
                  </ListItemAvatar>
                  <ListItemText
                    primary={cleanName(displayName)}
                    // Render secondary content as inline elements to avoid nesting block <div> inside
                    // the internal <p> that MUI may use for ListItemText secondary.
                    secondary={
                      <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                        <Typography
                          component="span"
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
                        {online && (
                          <Typography component="span" variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                            En línea
                          </Typography>
                        )}
                      </Box>
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
