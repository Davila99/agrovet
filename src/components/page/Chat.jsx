import React, { useState, useRef, useMemo } from "react";
import { Box, useMediaQuery } from "@mui/material";
import {
  ChatList,
  ChatMessages,
  ChatHeader,
  ChatInput,
  useChatRooms,
  useChatSocket,
  resolveAvatar,
  normalizeStoredToken,
  mergeRooms,
} from "./chat/index.js";
import { chatAPI, connectPresence, getProfile } from "../../services/endpoints";

export default function Chat() {
  const isMd = useMediaQuery("(min-width:900px)");
  const [activeId, setActiveId] = useState(null);
  const [viewMode, setViewMode] = useState("chats");
  const [text, setText] = useState("");
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

  // Rooms hook: returns rooms and helper to open/create 1:1
  const { rooms, setRooms, openOneToOne } = useChatRooms(mergeRooms, activeId);

  const activeConv = useMemo(
    () => rooms.find((c) => String(c.id) === String(activeId)) || null,
    [rooms, activeId]
  );

  // WS hook
  useChatSocket({
    activeId,
    setRooms,
    markUserOnline: () => {},
    markUserOffline: () => {},
    getReceiptUserId: () => {},
    getCurrentUserId,
  });

  // ChatList receives openOneToOne to open chats from specialists list

  const handleSend = async () => {
    if (!text.trim() || !activeId) return;
    // optimistic message (temporary id)
    const tempId = "tmp_" + Date.now();
    const msg = {
      id: tempId,
      text,
      fromMe: true,
      timestamp: new Date().toISOString(),
      sender_id: getCurrentUserId(),
    };

    // optimistic UI update
    setRooms((prev) =>
      prev.map((r) =>
        String(r.id) === String(activeId)
          ? { ...r, messages: [...(r.messages || []), msg] }
          : r
      )
    );
    setText("");

    // send to server in background, try to reconcile optimistic msg with server response
    (async () => {
      try {
        const token = normalizeStoredToken(localStorage.getItem("token"));
        const res = await chatAPI.sendMessage(activeId, text)({ token });

        // If server returned the created message, replace the optimistic one
        if (res && (res.id || res.pk)) {
          const serverMsg = {
            id: res.id || res.pk,
            text: res.content || res.message || res.text || text,
            timestamp: res.timestamp || res.created_at || new Date().toISOString(),
            sender_id: res.sender_id || (res.sender && (res.sender.id || res.sender.user_id)) || getCurrentUserId(),
            receipts: res.receipts || [],
          };
          setRooms((prev) =>
            prev.map((r) => {
              if (String(r.id) !== String(activeId)) return r;
              const msgs = Array.isArray(r.messages) ? r.messages.slice() : [];
              let replaced = false;
              const newMsgs = msgs.map((m) => {
                if (String(m.id) === String(tempId)) {
                  replaced = true;
                  return serverMsg;
                }
                return m;
              });
              if (!replaced) newMsgs.push(serverMsg);
              return { ...r, messages: newMsgs };
            })
          );
        }
      } catch (e) {
        console.warn("sendMessage failed", e);
        // mark optimistic message as errored so UI can show retry affordance
        setRooms((prev) =>
          prev.map((r) => {
            if (String(r.id) !== String(activeId)) return r;
            const msgs = (r.messages || []).map((m) =>
              String(m.id) === String(tempId) ? { ...m, sendError: true } : m
            );
            return { ...r, messages: msgs };
          })
        );
      }
    })();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
        {activeId && (
          <ChatInput
            text={text}
            setText={setText}
            handleSend={handleSend}
            handleKeyDown={handleKeyDown}
          />
        )}
      </Box>
    </Box>
  );
}
