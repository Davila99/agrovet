import React, { useMemo, useState, useEffect } from "react";
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
import ImageIcon from "@mui/icons-material/Image";
import MicIcon from "@mui/icons-material/Mic";
import VideocamIcon from "@mui/icons-material/Videocam";
import SpecialistsList from "../../page/Dashboard/SpecialistsList";
import { resolveAvatar, cleanName } from "../../page/chat/chatUtils";
import { usePresenceStore } from '../../../store/usePresenceStore';
import VerificationBadge from '../../page/profile/molecules/VerificationBadge';
import { useNavigate } from 'react-router-dom';

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
  professionFilter = null,
  setProfessionFilter = null,
  businessTypeFilter = null,
  setBusinessTypeFilter = null,
}) {
  const presenceUsers = usePresenceStore((s) => s.users || {});
  const [chatSearch, setChatSearch] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const filterOpen = Boolean(filterAnchorEl);
  
  // Debug: verificar que las funciones se reciban
  useEffect(() => {
    console.log('[RoomList] Props recibidos:', {
      viewMode,
      hasSetProfessionFilter: !!setProfessionFilter,
      hasSetBusinessTypeFilter: !!setBusinessTypeFilter,
      professionFilter,
      businessTypeFilter,
    });
  }, [viewMode, setProfessionFilter, setBusinessTypeFilter, professionFilter, businessTypeFilter]);

  // Filter rooms by search query and business type filter
  const filteredRooms = useMemo(() => {
    if (viewMode !== "chats") return [];
    let filtered = rooms;
    
    // Aplicar filtro de tipo de negocio si está activo
    if (businessTypeFilter) {
      filtered = rooms.filter((room) => {
        const parts = room?.participants || [];
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
        const otherId = other && (other.id || other.user_id || other.pk) ? (other.id || other.user_id || other.pk) : null;
        const userData = otherId && usersMap[otherId] ? usersMap[otherId] : (other || {});
        const businessType = userData?.businessman_profile?.business_type;
        return businessType === businessTypeFilter;
      });
    }
    
    // Aplicar filtro de búsqueda si hay texto
    if (chatSearch) {
      const query = chatSearch.toLowerCase();
      filtered = filtered.filter((room) => {
        const parts = room?.participants || [];
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
    }
    
    return filtered;
  }, [rooms, chatSearch, viewMode, getCurrentUserId, businessTypeFilter, usersMap]);

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

        <Box sx={{ mt: 1.5, width: '100%', minWidth: 0, maxWidth: '100%', display: 'flex', gap: 1, alignItems: 'center' }}>
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
          
          {/* Botón de filtro */}
          {((viewMode === "specialists" && setProfessionFilter) || (viewMode === "chats" && setBusinessTypeFilter)) && (
            <>
              <IconButton
                size="small"
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                sx={{
                  border: '1px solid rgba(0,0,0,0.23)',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  flexShrink: 0,
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
                {viewMode === "specialists" && [
                  <MenuItem
                    key="all"
                    onClick={() => {
                      if (setProfessionFilter) setProfessionFilter(null);
                      setFilterAnchorEl(null);
                    }}
                    selected={!professionFilter}
                  >
                    Todos los especialistas
                  </MenuItem>,
                  <Divider key="divider1" />,
                  <MenuItem
                    key="veterinario"
                    onClick={() => {
                      if (setProfessionFilter) setProfessionFilter('Veterinario');
                      setFilterAnchorEl(null);
                    }}
                    selected={professionFilter === 'Veterinario'}
                  >
                    Veterinario
                  </MenuItem>,
                  <MenuItem
                    key="agronomo"
                    onClick={() => {
                      if (setProfessionFilter) setProfessionFilter('Agrónomo');
                      setFilterAnchorEl(null);
                    }}
                    selected={professionFilter === 'Agrónomo'}
                  >
                    Agrónomo
                  </MenuItem>,
                  <MenuItem
                    key="zootecnista"
                    onClick={() => {
                      if (setProfessionFilter) setProfessionFilter('Zootecnista');
                      setFilterAnchorEl(null);
                    }}
                    selected={professionFilter === 'Zootecnista'}
                  >
                    Zootecnista
                  </MenuItem>
                ]}
                {viewMode === "chats" && [
                  <MenuItem
                    key="all-chats"
                    onClick={() => {
                      if (setBusinessTypeFilter) setBusinessTypeFilter(null);
                      setFilterAnchorEl(null);
                    }}
                    selected={!businessTypeFilter}
                  >
                    Todas las conversaciones
                  </MenuItem>,
                  <Divider key="divider2" />,
                  <MenuItem
                    key="agroveterinaria"
                    onClick={() => {
                      if (setBusinessTypeFilter) setBusinessTypeFilter('Agroveterinaria');
                      setFilterAnchorEl(null);
                    }}
                    selected={businessTypeFilter === 'Agroveterinaria'}
                  >
                    Agroveterinaria
                  </MenuItem>,
                  <MenuItem
                    key="empresa-agropecuaria"
                    onClick={() => {
                      if (setBusinessTypeFilter) setBusinessTypeFilter('Empresa Agropecuaria');
                      setFilterAnchorEl(null);
                    }}
                    selected={businessTypeFilter === 'Empresa Agropecuaria'}
                  >
                    Empresa Agropecuaria
                  </MenuItem>
                ]}
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
                onDelete={() => setProfessionFilter && setProfessionFilter(null)}
                sx={{ fontSize: '0.7rem', height: 24 }}
              />
            )}
            {businessTypeFilter && (
              <Chip
                label={`Tipo: ${businessTypeFilter}`}
                size="small"
                onDelete={() => setBusinessTypeFilter && setBusinessTypeFilter(null)}
                sx={{ fontSize: '0.7rem', height: 24 }}
              />
            )}
          </Box>
        )}

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

                  // Obtener datos del usuario para verificación - PRIORIZAR usersMap que tiene datos completos
                  const userData = finalOtherId && usersMap[finalOtherId] ? usersMap[finalOtherId] : (other || {});
                  
                  // Verificar si es especialista (de múltiples formas)
                  const role = (userData?.role || other?.role || '').toString().toLowerCase();
                  const isSpecialist = role === 'specialist' || role === 'especialista' || !!userData?.specialist_profile || !!other?.specialist_profile;
                  
                  // Obtener verification_status de diferentes ubicaciones posibles
                  // Priorizar userData de usersMap, luego other del participante
                  const profile = userData?.specialist_profile || other?.specialist_profile || {};
                  
                  // Obtener valores directamente, verificando que no sean undefined/null
                  // Verificar explícitamente que el valor existe y no es undefined/null
                  let verificationStatus = (profile.verification_status && profile.verification_status !== undefined && profile.verification_status !== null) 
                    ? profile.verification_status 
                    : null;
                  let verificationType = (profile.verification_type && profile.verification_type !== undefined && profile.verification_type !== null)
                    ? profile.verification_type
                    : null;
                  
                  // Si profile tiene las keys pero valores undefined, intentar desde userData directamente
                  if (!verificationStatus && userData?.specialist_profile?.verification_status && 
                      userData.specialist_profile.verification_status !== undefined && 
                      userData.specialist_profile.verification_status !== null) {
                    verificationStatus = userData.specialist_profile.verification_status;
                    verificationType = userData.specialist_profile.verification_type;
                  }
                  
                  // Si aún no tiene status pero tiene documentos, determinar el status (igual que en SpecialistsList)
                  if (!verificationStatus) {
                    const hasTitle = !!(profile.verification_title_id || userData?.verification_title_id || other?.verification_title_id);
                    const hasStudentCard = !!(profile.verification_student_card_id || userData?.verification_student_card_id || other?.verification_student_card_id);
                    const hasGraduationLetter = !!(profile.verification_graduation_letter_id || userData?.verification_graduation_letter_id || other?.verification_graduation_letter_id);
                    
                    console.log(`[RoomList] 📋 Documentos para ${displayName}:`, {
                      hasTitle,
                      hasStudentCard,
                      hasGraduationLetter,
                      profileTitleId: profile.verification_title_id,
                      profileStudentCardId: profile.verification_student_card_id,
                      profileGraduationLetterId: profile.verification_graduation_letter_id
                    });
                    
                    if (hasTitle || hasGraduationLetter) {
                      verificationStatus = 'verified_professional';
                      verificationType = verificationType || 'Médico Titulado';
                    } else if (hasStudentCard) {
                      verificationStatus = 'verified_student';
                      verificationType = verificationType || 'Estudiante';
                    }
                  }
                  
                  // DEBUG: Log siempre para ver qué datos tenemos
                  console.log(`[RoomList] 🔍 Chat ${displayName}:`, {
                    finalOtherId,
                    role,
                    isSpecialist,
                    hasUserData: !!userData,
                    hasOther: !!other,
                    hasProfile: !!profile,
                    verificationStatus,
                    verificationType,
                    profileKeys: Object.keys(profile),
                    profileValues: {
                      verification_status: profile.verification_status,
                      verification_type: profile.verification_type,
                      verification_title_id: profile.verification_title_id,
                      verification_student_card_id: profile.verification_student_card_id,
                      verification_graduation_letter_id: profile.verification_graduation_letter_id
                    },
                    userDataSpecialistProfile: userData?.specialist_profile,
                    otherSpecialistProfile: other?.specialist_profile,
                    fullProfile: JSON.stringify(profile).substring(0, 500)
                  });

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

                  const handleAvatarClick = (e) => {
                    e.stopPropagation(); // Prevenir que se active el chat al hacer clic en el avatar
                    if (finalOtherId) {
                      navigate(`/perfil?userId=${finalOtherId}`);
                    }
                  };

                  const handleNameClick = (e) => {
                    e.stopPropagation(); // Prevenir que se active el chat al hacer clic en el nombre
                    if (finalOtherId) {
                      navigate(`/perfil?userId=${finalOtherId}`);
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
                            <Typography 
                              variant="body1" 
                              sx={{ fontWeight: 500, flex: 1, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                              onClick={handleNameClick}
                            >
                              {cleanName(displayName)}
                            </Typography>
                            {/* Badge de verificación si el usuario es especialista */}
                            {(() => {
                              if (!isSpecialist) return null;
                              if (!verificationStatus) {
                                console.log(`[RoomList] ❌ No badge para ${displayName}: isSpecialist=${isSpecialist}, verificationStatus=${verificationStatus}`);
                                return null;
                              }
                              console.log(`[RoomList] ✅ MOSTRANDO BADGE para ${displayName}: verificationStatus=${verificationStatus}`);
                              return (
                                <VerificationBadge
                                  verificationStatus={verificationStatus}
                                  verificationType={verificationType}
                                  size="small"
                                />
                              );
                            })()}
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
            professionFilter={professionFilter}
          />
        </Box>
      )}
    </Box>
  );
}

