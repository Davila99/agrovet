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
  if (!activeConv) return null;

  return (
    <>
      {!isMd && (
        <AppBar position="static" color="transparent" elevation={1}>
          <Toolbar>
            <IconButton edge="start" onClick={onBack} aria-label="back">
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="subtitle1">{cleanName(activeConv.name)}</Typography>
              <Typography variant="caption" color="text.secondary">
                WS: {wsStatus}
                {sendError ? ` • err: ${sendError}` : ""}
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
          <Avatar
            src={resolveAvatar(
              activeConv?.avatar ||
                selectedContact?.profile_picture_url ||
                ""
            )}
            alt={activeConv?.name}
          />
          <Box>
            <Typography variant="subtitle1">{cleanName(activeConv.name)}</Typography>
            <Typography variant="caption" color="text.secondary">
              WS: {wsStatus}
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
}
