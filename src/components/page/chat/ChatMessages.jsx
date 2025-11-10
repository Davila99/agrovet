import React, { useEffect, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import MessageItem from './components/MessageItem';
import { formatTimestamp, dedupeMessages } from './chatUtils';

export default function ChatMessages({ activeConv, activeId, messagesEndRef, getCurrentUserId }) {
  const userId = getCurrentUserId();

  // Debug: (removed verbose render log)

  // Build deduped, chronological messages array once per activeConv
  const msgs = useMemo(() => {
    const raw = (activeConv?.messages || []).slice();
    // Dedupe first (preserve the first-seen ordering), then ensure chronological
    try {
      const deduped = dedupeMessages(raw || []);
      deduped.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
      return deduped;
    } catch (e) {
      try {
        raw.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
      } catch (ee) {}
      return raw || [];
    }
  }, [activeConv]);

  // Scroll to bottom when messages change
  useEffect(() => {
    const t = setTimeout(() => {
      try { messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' }); } catch (e) {}
    }, 50);
    return () => clearTimeout(t);
  }, [msgs.length]);

  // Send mark_read when user opens a conversation
  useEffect(() => {
    try {
      if (!activeId) return;
      if (typeof window !== 'undefined' && window._agrovet_chat_service && typeof window._agrovet_chat_service.send === 'function') {
        try { window._agrovet_chat_service.send({ type: 'mark_read', room: activeId }); console.log('[READ] Enviando mark_read para room', activeId); } catch (e) {}
      }
    } catch (e) {}
  }, [activeId]);

  if (!activeConv) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Typography variant="body1" color="text.secondary">Selecciona un chat para comenzar a conversar</Typography>
      </Box>
    );
  }

  // quiet: removed post-dedupe length log

  return (
    <Box id="chat-messages-container" sx={{ flex: 1, overflowY: 'auto', p: 2, backgroundColor: '#f6fff8', backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='%2339FF14' fill-opacity='0.06'><circle cx='20' cy='30' r='8'/><circle cx='34' cy='18' r='6'/><circle cx='12' cy='18' r='6'/><circle cx='58' cy='30' r='8'/><circle cx='72' cy='18' r='6'/><circle cx='50' cy='18' r='6'/></g></svg>")`, backgroundRepeat: 'repeat', backgroundSize: '160px 160px' }}>
      {msgs.map((m, i) => (
        <MessageItem key={String(m.uid || m.id || `${m.timestamp || ''}_${i}`)} m={m} index={i} userId={userId} activeConv={activeConv} activeId={activeId} />
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
}
