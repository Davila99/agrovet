import React, { useState } from "react";
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
  IconButton,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SpecialistsList from "../Dashboard/SpecialistsList";
import { resolveAvatar, cleanName } from "./chatUtils";
import { usePresenceStore } from '../../../store/usePresenceStore';
import { useNavigate } from 'react-router-dom';
import VerificationBadge from '../profile/molecules/VerificationBadge';

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
  usersMap = {},
  professionFilter,
  setProfessionFilter,
  businessTypeFilter,
  setBusinessTypeFilter,
}) {
  const navigate = useNavigate();
  const presenceUsers = usePresenceStore((s) => s.users || {});
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const filterOpen = Boolean(filterAnchorEl);
  return (
   
    <Box
      sx={{
        width: { xs: "100%", md: 500 },
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
        <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600 }}>Chats</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
          Conversaciones recientes
        </Typography>

        <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            fullWidth
            placeholder={viewMode === "specialists" ? "Buscar especialistas" : "Buscar conversaciones"}
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
          {/* Botón de filtro */}
          {(viewMode === "specialists" || viewMode === "chats") && (
            <>
              <IconButton
                size="small"
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                sx={{
                  border: '1px solid rgba(0,0,0,0.23)',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  color: (professionFilter || businessTypeFilter) ? '#1565C0' : 'inherit',
                  bgcolor: (professionFilter || businessTypeFilter) ? 'rgba(21, 101, 192, 0.08)' : 'transparent',
                }}
              >
                <FilterListIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={filterAnchorEl}
                open={filterOpen}
                onClose={() => setFilterAnchorEl(null)}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                  }
                }}
              >
                {viewMode === "specialists" ? (
                  <>
                    <MenuItem
                      onClick={() => {
                        setProfessionFilter(null);
                        setFilterAnchorEl(null);
                      }}
                      selected={!professionFilter}
                    >
                      Todos los especialistas
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        setProfessionFilter('Veterinario');
                        setFilterAnchorEl(null);
                      }}
                      selected={professionFilter === 'Veterinario'}
                    >
                      Veterinario
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setProfessionFilter('Agrónomo');
                        setFilterAnchorEl(null);
                      }}
                      selected={professionFilter === 'Agrónomo'}
                    >
                      Agrónomo
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setProfessionFilter('Zootecnista');
                        setFilterAnchorEl(null);
                      }}
                      selected={professionFilter === 'Zootecnista'}
                    >
                      Zootecnista
                    </MenuItem>
                  </>
                ) : viewMode === "chats" ? (
                  <>
                    <MenuItem
                      onClick={() => {
                        setBusinessTypeFilter(null);
                        setFilterAnchorEl(null);
                      }}
                      selected={!businessTypeFilter}
                    >
                      Todas las conversaciones
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        setBusinessTypeFilter('Agroveterinaria');
                        setFilterAnchorEl(null);
                      }}
                      selected={businessTypeFilter === 'Agroveterinaria'}
                    >
                      Agroveterinaria
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setBusinessTypeFilter('Empresa Agropecuaria');
                        setFilterAnchorEl(null);
                      }}
                      selected={businessTypeFilter === 'Empresa Agropecuaria'}
                    >
                      Empresa Agropecuaria
                    </MenuItem>
                  </>
                ) : null}
              </Menu>
            </>
          )}
        </Box>
        
        {/* Mostrar filtro activo */}
        {(professionFilter || businessTypeFilter) && (
          <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {professionFilter && (
              <Chip
                label={`Profesión: ${professionFilter}`}
                size="small"
                onDelete={() => setProfessionFilter(null)}
                sx={{ fontSize: '0.7rem', height: 24 }}
              />
            )}
            {businessTypeFilter && (
              <Chip
                label={`Tipo: ${businessTypeFilter}`}
                size="small"
                onDelete={() => setBusinessTypeFilter(null)}
                sx={{ fontSize: '0.7rem', height: 24 }}
              />
            )}
          </Box>
        )}

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
                fontSize: "0.7rem",
                px: 1.25,
                py: 0.4,
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
                  if (typeof isParticipantOnline === 'function' && otherId) {
                    return isParticipantOnline(otherId);
                  }
                  // Fallback: verificar en el store de presencia
                  if (presenceUsers && otherId) {
                    const st = presenceUsers[String(otherId)] || presenceUsers[otherId];
                    return st && (st.isOnline === true || st.online === true);
                  }
                  return false;
                } catch (e) { 
                  console.warn('[ChatList] Error checking online status:', e);
                  return false; 
                }
              })();

              // Obtener datos del usuario para verificación
              const userData = otherId && usersMap[otherId] ? usersMap[otherId] : (other || {});
              const isSpecialist = (userData?.role || '').toString().toLowerCase() === 'specialist' || !!userData?.specialist_profile;
              const profile = userData?.specialist_profile || {};
              let verificationStatus = profile.verification_status;
              let verificationType = profile.verification_type;
              
              // Si no tiene status pero tiene documentos, determinar el status
              if (!verificationStatus) {
                const hasTitle = !!profile.verification_title_id;
                const hasStudentCard = !!profile.verification_student_card_id;
                const hasGraduationLetter = !!profile.verification_graduation_letter_id;
                
                if (hasTitle || hasGraduationLetter) {
                  verificationStatus = 'verified_professional';
                  verificationType = verificationType || 'Médico Titulado';
                } else if (hasStudentCard) {
                  verificationStatus = 'verified_student';
                  verificationType = verificationType || 'Estudiante';
                }
              }

              const handleAvatarClick = (e) => {
                e.stopPropagation(); // Prevenir que se active el chat al hacer clic en el avatar
                if (otherId) {
                  navigate(`/perfil?userId=${otherId}`);
                }
              };

              return (
                <ListItemButton
                  key={c.id}
                  onClick={() => onSelectChat(String(c.id))}
                  selected={String(activeId) === String(c.id)}
                >
                  <ListItemAvatar>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Avatar 
                        src={avatarSrc} 
                        alt={displayName}
                        onClick={handleAvatarClick}
                        sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                      >
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 500 }}>
                          {cleanName(displayName)}
                        </Typography>
                        {/* Badge de verificación si el usuario es especialista */}
                        {isSpecialist && verificationStatus && (
                          <VerificationBadge
                            verificationStatus={verificationStatus}
                            verificationType={verificationType}
                            size="small"
                          />
                        )}
                      </Box>
                    }
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
                            fontSize: "0.7rem",
                          }}
                        >
                          {c.lastMessage}
                        </Typography>
                        {online && (
                          <Typography component="span" variant="caption" sx={{ color: 'success.main', fontWeight: 600, fontSize: "0.6rem" }}>
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
          professionFilter={professionFilter}
        />
      )}
    </Box>
  );
}




