import React, { useState, useRef, useEffect } from "react";
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

  // Debug: print rooms state whenever it changes to trace propagation
  useEffect(() => {
    try {
      console.log('[DEBUG] Estado actual de rooms:', (rooms || []).length, 'activeId:', activeId);
      (rooms || []).forEach((room) => {
        try {
          console.log(`[DEBUG] Room ${room.id}:`, {
            messages: (room.messages && room.messages.length) || 0,
            lastMessage: room.lastMessage,
            unread: room.unread,
          });
        } catch (e) {}
      });
    } catch (e) {}
  }, [rooms, activeId]);

  // Rooms hook: returns helper to open/create 1:1 and uses shared state
  const { openOneToOne } = useChatRooms(activeId, [rooms, setRooms]);

  // NOTE: useMemo removed intentionally for debugging: ensure activeConv
  // is recalculated whenever `rooms` or `activeId` change. If this fixes
  // the missing render it indicates `rooms` reference was not updating.
  const activeConv = rooms.find((c) => String(c.id) === String(activeId)) || null;

  // WS hook
  useChatSocket({
    activeId,
    setRooms,
    markUserOnline: () => {},
    markUserOffline: () => {},
    getReceiptUserId: () => {},
    getCurrentUserId,
  });

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
  } = useChatController({ activeId, setRooms, getCurrentUserId });

  const goBackToList = () => setActiveId(null);

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
          />
        )}
        <ChatMessages
          activeConv={activeConv}
          activeId={activeId}
          messagesEndRef={messagesEndRef}
          getCurrentUserId={getCurrentUserId}
        />

        {/* If there's a pending attachment, show a compact preview above the input box */}
        {pendingAttachment && (
          <Box sx={{ p: 1, borderTop: '1px solid rgba(0,0,0,0.04)', bgcolor: 'background.default' }}>
            <AttachmentPreview pending={pendingAttachment} onConfirm={confirmSendAttachment} onCancel={cancelPendingAttachment} />
          </Box>
        )}
        {activeId && (
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
          />
        )}
      </Box>
    </Box>
  );
}
