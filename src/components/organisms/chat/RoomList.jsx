import React, { useMemo, useState } from "react";
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
import ImageIcon from "@mui/icons-material/Image";
import MicIcon from "@mui/icons-material/Mic";
import VideocamIcon from "@mui/icons-material/Videocam";
import SpecialistsList from "../../page/Dashboard/SpecialistsList";
import { resolveAvatar, cleanName } from "../../page/chat/chatUtils";
import { usePresenceStore } from '../../../store/usePresenceStore';

export default function RoomList({
  rooms = [],
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
  loading = false,
  error = null,
  usersMap = {},
}) {
  const presenceUsers = usePresenceStore((s) => s.users || {});
  const [chatSearch, setChatSearch] = useState("");

  // Filter rooms by search query
  const filteredRooms = useMemo(() => {
    if (viewMode !== "chats") return [];
    if (!chatSearch) return rooms;
    const query = chatSearch.toLowerCase();
    return rooms.filter((room) => {
      const parts = room?.participants || [];
      const me = getCurrentUserId ? getCurrentUserId() : null;
      let other = null;
      if (Array.isArray(parts)) {
        for (const p of parts) {
          try {
            const pid = p && (p.id || p.user_id || p.pk) ? (p.id || p.user_id || p.pk) : p;
            if (pid && String(pid) !== String(me)) { other = p; break; }
          } catch (e) { }
        }
      }
      // Get display name with multiple fallbacks
      let displayName = '';
      if (other) {
        displayName = other.full_name ||
          other.name ||
          other.username ||
          other.display_name ||
          (other.first_name && other.last_name ? `${other.first_name} ${other.last_name}` : other.first_name) ||
          other.email?.split('@')[0] ||
          '';
      }

      // Fallback to room name or last message sender
      if (!displayName) {
        if (room.last_message && room.last_message.sender) {
          const sender = room.last_message.sender;
          displayName = sender.full_name ||
            sender.name ||
            sender.username ||
            sender.display_name ||
            (sender.first_name && sender.last_name ? `${sender.first_name} ${sender.last_name}` : sender.first_name) ||
            '';
        }
        if (!displayName) {
          displayName = room.name || `Chat ${room.id}`;
        }
      }
      const lastMsg = room.last_message?.text || room.last_message?.content || room.lastMessage || "";
      return displayName.toLowerCase().includes(query) || lastMsg.toLowerCase().includes(query);
    });
  }, [rooms, chatSearch, viewMode, getCurrentUserId]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        borderRight: { md: "1px solid rgba(0,0,0,0.08)" },
        bgcolor: "background.paper",
        display: { xs: activeId && !isMd ? "none" : "flex", md: "flex" },
        height: "100%",
        flexDirection: "column",
        overflow: "hidden",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ p: 2, flexShrink: 0, minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, wordBreak: 'break-word' }}>
          Chats
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
          Conversaciones recientes
        </Typography>

        <Box sx={{ mt: 1.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
          {viewMode === "chats" ? (
            <TextField
              size="small"
              fullWidth
              placeholder="Buscar conversaciones"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              sx={{
                width: '100%',
                maxWidth: '100%',
                "& .MuiOutlinedInput-root": {
                  borderRadius: "999px",
                  backgroundColor: "rgba(0,0,0,0.02)",
                  width: '100%',
                  maxWidth: '100%',
                  paddingRight: '8px',
                },
                "& .MuiInputBase-input": {
                  width: '100%',
                  maxWidth: '100%',
                  padding: '8px 14px',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ marginRight: 0.5 }}>
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          ) : (
            <TextField
              size="small"
              fullWidth
              placeholder="Buscar especialistas"
              value={specialistSearch}
              onChange={(e) => setSpecialistSearch(e.target.value)}
              sx={{
                width: '100%',
                maxWidth: '100%',
                "& .MuiOutlinedInput-root": {
                  borderRadius: "999px",
                  backgroundColor: "rgba(0,0,0,0.02)",
                  width: '100%',
                  maxWidth: '100%',
                  paddingRight: '8px',
                },
                "& .MuiInputBase-input": {
                  width: '100%',
                  maxWidth: '100%',
                  padding: '8px 14px',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ marginRight: 0.5 }}>
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        </Box>

        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            mt: 1.5,
            width: '100%',
            flexWrap: 'wrap',
            gap: 0.75,
          }}
        >
          {["chats", "specialists"].map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "contained" : "outlined"}
              size="small"
              onClick={() => setViewMode(mode)}
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontSize: "0.75rem",
                px: { xs: 1.2, sm: 1.5 },
                py: 0.5,
                minWidth: 'auto',
                flex: { xs: '1 1 auto', sm: '0 1 auto' },
                whiteSpace: 'nowrap',
                maxWidth: '100%',
                ...(viewMode === mode
                  ? {
                    backgroundColor: "#1565C0",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#0f4a86" },
                  }
                  : { borderColor: "#1565C0", color: "#1565C0" }),
              }}
            >
              {mode === "chats" ? "Chats" : "Especialistas"}
            </Button>
          ))}
        </Stack>
      </Box>
      <Divider />

      {viewMode === "chats" && (
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Cargando conversaciones...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            </Box>
          ) : filteredRooms.length === 0 ? (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {chatSearch ? "No se encontraron conversaciones" : "No hay conversaciones"}
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredRooms
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
                  let otherId = null;

                  if (Array.isArray(parts)) {
                    for (const p of parts) {
                      try {
                        const pid = p && (p.id || p.user_id || p.pk) ? (p.id || p.user_id || p.pk) : p;
                        // Robust comparison for ID
                        if (pid && me && String(pid) !== String(me)) {
                          other = p;
                          otherId = pid;
                          break;
                        }
                      } catch (e) { }
                    }
                  }

                  // Get display name with multiple fallbacks - PRIORIZAR siempre el nombre del participante
                  let displayName = '';
                  let avatarRaw = '';

                  if (other) {
                    displayName = other.full_name ||
                      other.name ||
                      other.username ||
                      other.display_name ||
                      (other.first_name && other.last_name ? `${other.first_name} ${other.last_name}` : other.first_name) ||
                      other.email?.split('@')[0] ||
                      '';

                    // Handle avatar as string or object with url property
                    const avatarValue = other.profile_picture_url || other.profile_picture || other.avatar || other.picture || other.photo;
                    avatarRaw = typeof avatarValue === 'object' && avatarValue?.url ? avatarValue.url : (avatarValue || '');
                  }

                  // Use usersMap as fallback if we have otherId but no display name
                  if (!displayName && otherId && usersMap[otherId]) {
                    const userFromMap = usersMap[otherId];
                    displayName = userFromMap.full_name ||
                      userFromMap.username ||
                      userFromMap.name ||
                      userFromMap.display_name ||
                      (userFromMap.first_name && userFromMap.last_name ? `${userFromMap.first_name} ${userFromMap.last_name}` : userFromMap.first_name) ||
                      '';
                  }

                  // Always try to get avatar from usersMap if available (not just when displayName is missing)
                  if (!avatarRaw && otherId && usersMap[otherId]) {
                    const userFromMap = usersMap[otherId];
                    avatarRaw = userFromMap.profile_picture || userFromMap.avatar || userFromMap.picture || userFromMap.profile_picture_url || '';
                  }

                  // Final fallback
                  if (!displayName) {
                    displayName = c.name || `Chat ${c.id}`;
                  }

                  const avatarSrc = resolveAvatar(avatarRaw || c.avatar || "");
                  // Asegurar que otherId tenga valor si other existe pero otherId no se asignó
                  const finalOtherId = otherId || (other && (other.id || other.user_id || other.pk)) || null;
                  const online = (() => {
                    try {
                      if (typeof isParticipantOnline === 'function' && finalOtherId) return isParticipantOnline(finalOtherId);
                      const st = presenceUsers && finalOtherId ? presenceUsers[String(finalOtherId)] : null;
                      return st && st.isOnline;
                    } catch (e) { return false; }
                  })();

                  // Detectar tipo de media del último mensaje
                  const lastMsg = c.last_message;
                  const lastMsgMediaUrl = lastMsg?.media_url || (lastMsg?.attachments && lastMsg.attachments[0]?.url);
                  const lastMsgMediaType = lastMsgMediaUrl ? (
                    lastMsg.attachments?.[0]?.type ||
                    (lastMsgMediaUrl.match(/\.(mp4|webm|mov)$/i) ? 'video' :
                      lastMsgMediaUrl.match(/\.(mp3|wav|ogg|webm|m4a|aac)$/i) ? 'audio' : 'image')
                  ) : null;

                  // Verificar si el último mensaje no ha sido leído (si no es del usuario actual)
                  const lastMsgIsFromMe = lastMsg?.sender?.id === parseInt(getCurrentUserId ? getCurrentUserId() : 0);
                  const lastMsgIsUnread = !lastMsgIsFromMe && lastMsg && !lastMsg.is_read && !lastMsg.read;

                  // Contar mensajes no leídos (simplificado - usar unread_count del backend si existe)
                  const unreadCount = c.unread_count || c.unreadCount || (lastMsgIsUnread ? 1 : 0);

                  // Debug: verificar que los valores se están calculando correctamente
                  if (process.env.NODE_ENV === 'development') {
                    if (lastMsgMediaType || unreadCount > 0) {
                      console.debug('[RoomList] Room:', c.id, {
                        lastMsgMediaType,
                        lastMsgIsUnread,
                        unreadCount,
                        lastMsg: lastMsg ? { text: lastMsg.text?.substring(0, 20), media_url: lastMsg.media_url } : null
                      });
                    }
                  }

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
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500, flex: 1 }}>
                              {cleanName(displayName)}
                            </Typography>
                            {unreadCount > 0 && (
                              <Box
                                sx={{
                                  backgroundColor: '#4caf50',
                                  color: '#fff',
                                  borderRadius: '10px',
                                  minWidth: '20px',
                                  height: '20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  px: 0.5,
                                  flexShrink: 0,
                                }}
                              >
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </Box>
                            )}
                          </Box>
                        }
                        // Render secondary content as inline elements to avoid nesting block <div> inside
                        // the internal <p> that MUI may use for ListItemText secondary.
                        secondary={
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, width: '100%' }}>
                            {lastMsgMediaType && lastMsgIsUnread ? (
                              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
                                {lastMsgMediaType === 'audio' ? (
                                  <MicIcon sx={{ fontSize: 16, color: '#1976d2' }} />
                                ) : lastMsgMediaType === 'video' ? (
                                  <VideocamIcon sx={{ fontSize: 16, color: '#1976d2' }} />
                                ) : (
                                  <ImageIcon sx={{ fontSize: 16, color: '#1976d2' }} />
                                )}
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{
                                    color: '#1976d2',
                                    fontWeight: 500,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {lastMsgMediaType === 'audio' ? 'Audio' : lastMsgMediaType === 'video' ? 'Video' : 'Imagen'}
                                </Typography>
                              </Box>
                            ) : lastMsg?.text || lastMsg?.content ? (
                              <Typography
                                component="span"
                                variant="body2"
                                sx={{
                                  color: lastMsgIsUnread ? '#1976d2' : "text.secondary",
                                  fontWeight: lastMsgIsUnread ? 500 : 400,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  flex: 1,
                                }}
                              >
                                {lastMsg.text || lastMsg.content}
                              </Typography>
                            ) : (
                              <Typography component="span" variant="body2" sx={{ color: "text.secondary", fontStyle: 'italic', flex: 1 }}>
                                Sin mensajes
                              </Typography>
                            )}
                            {online && (
                              <Typography component="span" variant="caption" sx={{ color: '#4caf50', fontWeight: 600, ml: 'auto', flexShrink: 0 }}>
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
        </Box>
      )}

      {viewMode === "specialists" && (
        <Box sx={{ flex: 1, overflow: "hidden", minWidth: 0, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
          <SpecialistsList
            onSelectSpecialist={async (u) => {
              try {
                if (!openOneToOne) return;
                const p = openOneToOne(u);
                if (p && p.then) {
                  const room = await p;
                  if (room && room.id) {
                    // switch to chats view and select the newly opened room
                    setViewMode("chats");
                    // Call parent's onSelectChat to update selectedRoom
                    onSelectChat(String(room.id));
                  }
                } else if (p && p.id) {
                  // Already a room object
                  setViewMode("chats");
                  onSelectChat(String(p.id));
                }
              } catch (err) {
                console.warn('openOneToOne failed in RoomList', err);
              }
            }}
            searchQuery={specialistSearch}
          />
        </Box>
      )}
    </Box>
  );
}

