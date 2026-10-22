import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { resolveAvatar, cleanName } from "./chatUtils";
import { usePresenceStore } from '../../../../store/usePresenceStore';
import { useNavigate } from 'react-router-dom';
import VerificationBadge from '../../../../components/profile/molecules/VerificationBadge';

const formatLastSeen = (iso) => {
  try {
    if (!iso) return null;
    let then = new Date(iso);
    // Si no tiene 'Z' ni offset y parece ISO, asegurar parseo UTC
    if (typeof iso === 'string' && !iso.endsWith('Z') && !iso.includes('+') && !iso.includes('-') && iso.includes('T')) {
      then = new Date(iso + 'Z');
    }
    if (Number.isNaN(then.getTime())) return null;
    const diffMs = Date.now() - then.getTime();
    if (diffMs < 0) return 'hace unos momentos';

    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return 'hace unos segundos';
    if (mins === 1) return 'hace 1 minuto';
    if (mins < 60) return `hace ${mins} minutos`;
    if (hours === 1) return 'hace 1 hora';
    if (hours < 24) return `hace ${hours} horas`;
    if (days === 1) {
      const timeStr = then.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `ayer a las ${timeStr}`;
    }
    if (days < 7) return `hace ${days} días`;

    return then.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) { return null; }
};

export default function ChatHeader({
  activeConv,
  wsStatus,
  sendError,
  onBack,
  isMd,
  selectedContact,
  getDisplayNameFromParticipants,
  getCurrentUserId,
  isParticipantOnline,
}) {
  const navigate = useNavigate();
  
  if (!activeConv) return null;

  // derive other participant id and status from global presence store
  const parts = activeConv && activeConv.participants ? activeConv.participants : [];
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
  const presence = otherId ? usePresenceStore((s) => s.users[String(otherId)]) : null;

  // Obtener datos del usuario para verificación
  const userData = other || selectedContact || {};
  const isSpecialist = (userData?.role || '').toString().toLowerCase() === 'specialist' || !!userData?.specialist_profile;
  const verificationStatus = userData?.specialist_profile?.verification_status || null;
  const verificationType = userData?.specialist_profile?.verification_type || null;

  const handleAvatarClick = () => {
    if (otherId) {
      navigate(`/perfil?userId=${otherId}`);
    }
  };

  return (
    <>
      {!isMd && (
        <AppBar position="static" color="transparent" elevation={1}>
          <Toolbar>
            <IconButton edge="start" onClick={onBack} aria-label="back">
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontSize: "0.8rem", fontWeight: 500 }}>{cleanName(activeConv.name)}</Typography>
                {/* Badge de verificación si el usuario es especialista */}
                {isSpecialist && verificationStatus && (
                  <VerificationBadge
                    verificationStatus={verificationStatus}
                    verificationType={verificationType}
                    size="small"
                  />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: "0.65rem" }}>
                {(() => {
                  try {
                    const parts = activeConv && activeConv.participants ? activeConv.participants : [];
                    const me = getCurrentUserId ? getCurrentUserId() : null;
                    let otherId = null;
                    if (Array.isArray(parts)) {
                      for (const p of parts) {
                        try {
                          const pid = p && (p.id || p.user_id || p.pk) ? (p.id || p.user_id || p.pk) : p;
                          if (pid && String(pid) !== String(me)) { otherId = pid; break; }
                        } catch (e) {}
                      }
                    }
                    // Usar función o store de presencia
                    let online = false;
                    if (typeof isParticipantOnline === 'function' && otherId) {
                      online = isParticipantOnline(otherId);
                    } else if (presence) {
                      online = presence.isOnline === true || presence.online === true;
                    }
                    if (online) {
                      return (<><Box component="span" sx={{ width:8, height:8, bgcolor: 'success.main', borderRadius: '50%', display: 'inline-block' }} /> <span>En línea</span></>);
                    }
                    // Si no está online, mostrar última conexión si disponible
                    const rawLastSeen = presence?.lastSeen || other?.last_activity || other?.last_seen || selectedContact?.last_activity;
                    if (rawLastSeen) {
                      const formatted = formatLastSeen(rawLastSeen);
                      if (formatted) return (<span style={{ color: 'gray' }}>{`Última vez ${formatted}`}</span>);
                    }
                  } catch (e) {
                    console.warn('[ChatHeader] Error checking online:', e);
                  }
                  return (<span style={{ color: 'gray' }}>Desconectado</span>);
                })()}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {isMd && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 2,
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            backgroundColor: "background.paper",
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              src={resolveAvatar(
                activeConv?.avatar ||
                  selectedContact?.profile_picture_url ||
                  ""
              )}
              alt={activeConv?.name}
              onClick={handleAvatarClick}
              sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
            />
            {/* small online dot in corner of avatar */}
            {(() => {
              try {
                const parts = activeConv && activeConv.participants ? activeConv.participants : [];
                const me = getCurrentUserId ? getCurrentUserId() : null;
                let otherId = null;
                if (Array.isArray(parts)) {
                  for (const p of parts) {
                    try {
                      const pid = p && (p.id || p.user_id || p.pk) ? (p.id || p.user_id || p.pk) : p;
                      if (pid && String(pid) !== String(me)) { otherId = pid; break; }
                    } catch (e) {}
                  }
                }
                const online = typeof isParticipantOnline === 'function' && otherId ? isParticipantOnline(otherId) : false;
                if (online) {
                  return (
                    <Box sx={{ position: 'absolute', right: -2, bottom: -2, width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main', border: '2px solid white' }} />
                  );
                }
              } catch (e) {}
              return null;
            })()}
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" sx={{ fontSize: "0.8rem", fontWeight: 500 }}>{cleanName(activeConv.name)}</Typography>
              {/* Badge de verificación si el usuario es especialista */}
              {isSpecialist && verificationStatus && (
                <VerificationBadge
                  verificationStatus={verificationStatus}
                  verificationType={verificationType}
                  size="small"
                />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: "0.65rem" }}>
              {/* Online indicator: verificar presencia */}
              {(() => {
                try {
                  // Verificar online usando la función o el store
                  let online = false;
                  if (typeof isParticipantOnline === 'function' && otherId) {
                    online = isParticipantOnline(otherId);
                  } else if (presence) {
                    online = presence.isOnline === true || presence.online === true;
                  }
                  if (online) {
                    return (<><Box component="span" sx={{ width:8, height:8, bgcolor: 'success.main', borderRadius: '50%', display: 'inline-block' }} /> <span>En línea</span></>);
                  }
                  // Mostrar última conexión si disponible
                  const rawLastSeen = presence?.lastSeen || other?.last_activity || other?.last_seen || selectedContact?.last_activity;
                  const lastSeen = rawLastSeen ? formatLastSeen(rawLastSeen) : null;
                  if (lastSeen) return (<span style={{ color: 'gray' }}>{`Última vez ${lastSeen}`}</span>);
                } catch (e) {
                  console.warn('[ChatHeader Desktop] Error checking online:', e);
                }
                return (<span style={{ color: 'gray' }}>Desconectado</span>);
              })()}
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
}




