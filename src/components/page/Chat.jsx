import React, { useState, useRef, useEffect, useCallback } from "react";
import { Box, useMediaQuery } from "@mui/material";
import {
  ChatList,
  ChatMessages,
  ChatHeader,
  ChatInput,
  useChatRooms,
  useChatSocket,
} from "./chat/index.js";
import AttachmentPreview from "./chat/AttachmentPreview";
import useChatController from "./chat/useChatController";

export default function Chat() {
  const isMd = useMediaQuery("(min-width:900px)");
  const [activeId, setActiveId] = useState(null);
  // Shared rooms state to pass to hooks (useChatRooms, useChatSocket, controllers)
  const [rooms, setRooms] = useState([]);
  const [viewMode, setViewMode] = useState("chats");
  const messagesEndRef = useRef(null);

  const [specialistSearch, setSpecialistSearch] = useState("");

  // Helpers
  const getCurrentUserId = () => Number(localStorage.getItem("userId")) || null;

  const computeLastTsForRoom = (r) => {
    try {
      if (r.last_activity) return new Date(r.last_activity).getTime();
      const msgs = r.messages || [];
      return msgs.length
        ? new Date(msgs[msgs.length - 1].timestamp).getTime()
        : 0;
    } catch {
      return 0;
    }
  };

  // Removed noisy debug logs to reduce console spam in production/dev.

  // Rooms hook: returns helper to open/create 1:1 and uses shared state
  const { openOneToOne } = useChatRooms(activeId, [rooms, setRooms]);

  // NOTE: useMemo removed intentionally for debugging: ensure activeConv
  // is recalculated whenever `rooms` or `activeId` change. If this fixes
  // the missing render it indicates `rooms` reference was not updating.
  const activeConv = rooms.find((c) => String(c.id) === String(activeId)) || null;

  // WS hook
  // Track presence of online users locally and pass handlers into the socket
  const [onlineUsers, setOnlineUsers] = useState(() => new Set());
  const markUserOnline = useCallback((id) => {
    try {
      setOnlineUsers((prev) => {
        const copy = new Set(Array.from(prev || []));
        if (id === null || id === undefined) return copy;
        copy.add(String(id));
        return copy;
      });
    } catch (e) {}
  }, [setOnlineUsers]);

  const markUserOffline = useCallback((id) => {
    try {
      setOnlineUsers((prev) => {
        const copy = new Set(Array.from(prev || []));
        if (id === null || id === undefined) return copy;
        copy.delete(String(id));
        return copy;
      });
    } catch (e) {}
  }, [setOnlineUsers]);

  useChatSocket({
    activeId,
    setRooms,
    markUserOnline,
    markUserOffline,
    getReceiptUserId: () => {},
    getCurrentUserId,
  });

  // expose active room globally for auxiliary helpers (sound, legacy code)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') window.__AGROVET_ACTIVE_ROOM = activeId || null;
    } catch (e) {}
    return () => {
      try { if (typeof window !== 'undefined') window.__AGROVET_ACTIVE_ROOM = null; } catch (e) {}
    };
  }, [activeId]);

  // Local controller for send/attach/etc
  const {
    text,
    setText,
    sendingText,
    pendingAttachment,
    handleSend,
    handleAttach,
    cancelPendingAttachment,
    confirmSendAttachment,
    handleKeyDown,
    uploadingAttachment,
  } = useChatController({ activeId, setRooms, getCurrentUserId });

  const goBackToList = () => setActiveId(null);

  const isParticipantOnline = useCallback(
    (userId) => {
      try {
        return userId ? onlineUsers.has(String(userId)) : false;
      } catch (e) {
        return false;
      }
    },
    [onlineUsers]
  );

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      {(!activeId || isMd) && (
        <ChatList
          rooms={rooms}
          activeId={activeId}
          viewMode={viewMode}
          setViewMode={setViewMode}
          specialistSearch={specialistSearch}
          setSpecialistSearch={setSpecialistSearch}
          onSelectChat={setActiveId}
          openOneToOne={openOneToOne}
          isMd={isMd}
          computeLastTsForRoom={computeLastTsForRoom}
          getCurrentUserId={getCurrentUserId}
          isParticipantOnline={isParticipantOnline}
        />
      )}

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeId && (
          <ChatHeader
            activeConv={activeConv}
            wsStatus="OPEN"
            sendError={null}
            onBack={goBackToList}
            isMd={isMd}
            getCurrentUserId={getCurrentUserId}
            isParticipantOnline={isParticipantOnline}
          />
        )}
        <ChatMessages
          activeConv={activeConv}
          activeId={activeId}
          messagesEndRef={messagesEndRef}
          getCurrentUserId={getCurrentUserId}
        />

        {/* When there's a pending attachment, replace the input with the preview UI (WhatsApp-like). */}
        {activeId && (
          pendingAttachment ? (
            <Box sx={{ p: 1, borderTop: '1px solid rgba(0,0,0,0.04)', bgcolor: 'background.default' }}>
              <AttachmentPreview pending={pendingAttachment} onConfirm={confirmSendAttachment} onCancel={cancelPendingAttachment} isUploading={uploadingAttachment} />
            </Box>
          ) : (
            <ChatInput
              text={text}
              setText={setText}
              handleSend={handleSend}
              handleKeyDown={handleKeyDown}
              onAttach={handleAttach}
              pendingAttachment={pendingAttachment}
              onCancelAttachment={cancelPendingAttachment}
              onConfirmAttachment={confirmSendAttachment}
              sending={sendingText}
              uploadingAttachment={uploadingAttachment}
            />
          )
        )}
      </Box>
    </Box>
  );
}
