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
import { usePresenceStore } from '../../../store/usePresenceStore';
import { useNavigate } from 'react-router-dom';
import VerificationBadge from '../../profile/molecules/VerificationBadge';

const formatLastSeen = (iso) => {
  try {
    if (!iso) return null;
    const then = new Date(iso);
    if (Number.isNaN(then.getTime())) return null;
    const diffMs = Date.now() - then.getTime();
    const mins = Math.max(0, Math.round(diffMs / 60000));
    if (mins < 1) return 'hace unos segundos';
    if (mins === 1) return 'hace 1 minuto';
    return `hace ${mins} minutos`;
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
                    const online = typeof isParticipantOnline === 'function' && otherId ? isParticipantOnline(otherId) : false;
                    if (online) {
                      return (<><Box component="span" sx={{ width:8, height:8, bgcolor: 'success.main', borderRadius: '50%', display: 'inline-block' }} /> <span>En línea</span></>);
                    }
                  } catch (e) {}
                  return (<><span>WS: {wsStatus}</span>{sendError ? ` • err: ${sendError}` : ""}</>);
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
              {/* Online indicator: prefer presence from Zustand store */}
              {(() => {
                try {
                  const online = presence && presence.isOnline;
                  if (online) {
                    return (<><Box component="span" sx={{ width:8, height:8, bgcolor: 'success.main', borderRadius: '50%', display: 'inline-block' }} /> <span>En línea</span></>);
                  }
                  const lastSeen = presence && presence.lastSeen ? formatLastSeen(presence.lastSeen) : null;
                  if (lastSeen) return (<span style={{ color: 'gray' }}>{`Última vez ${lastSeen}`}</span>);
                } catch (e) {}
                return (<>WS: {wsStatus}</>);
              })()}
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
}




