import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MessageItem from './components/MessageItem';
import { formatTimestamp } from './chatUtils';

export default function ChatMessages({ activeConv, activeId, messagesEndRef, getCurrentUserId }) {
  const userId = getCurrentUserId();

  useEffect(() => {
    setTimeout(() => {
      try { messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' }); } catch (e) {}
    }, 50);
  }, [activeConv?.messages?.length]);

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

  const raw = (activeConv?.messages || []).slice().sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

  // Deduplicate using the same strategy as before (id, client_msg_id, uid, fallback)
  const byKey = new Map();
  for (let idx = 0; idx < raw.length; idx++) {
    const mm = raw[idx];
    const hasId = mm && (mm.id || mm.message_id);
    const clientId = mm && (mm.client_msg_id || mm.clientId || null);
    const uid = mm && mm.uid;
    const fallbackKey = `${mm.timestamp || ''}_${idx}`;
    const key = hasId ? `id:${mm.id || mm.message_id}` : (clientId ? `client:${clientId}` : (uid ? `uid:${uid}` : `fallback:${fallbackKey}`));
    if (!byKey.has(key)) { byKey.set(key, mm); continue; }
    const existing = byKey.get(key);
    const existingHasId = existing && (existing.id || existing.message_id);
    if (!existingHasId && hasId) { byKey.set(key, mm); continue; }
    const existingHasMedia = existing && (existing.media_url || existing.mediaUrl || existing.media || existing.media_uploading);
    const mmHasMedia = mm && (mm.media_url || mm.mediaUrl || mm.media || mm.media_uploading);
    if (!existingHasMedia && mmHasMedia) { byKey.set(key, mm); continue; }
  }

  const msgs = Array.from(byKey.values());

  return (
    <Box id="chat-messages-container" sx={{ flex: 1, overflowY: 'auto', p: 2, backgroundColor: '#f6fff8', backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='%2339FF14' fill-opacity='0.06'><circle cx='20' cy='30' r='8'/><circle cx='34' cy='18' r='6'/><circle cx='12' cy='18' r='6'/><circle cx='58' cy='30' r='8'/><circle cx='72' cy='18' r='6'/><circle cx='50' cy='18' r='6'/></g></svg>")`, backgroundRepeat: 'repeat', backgroundSize: '160px 160px' }}>
      {msgs.map((m, i) => (
        <MessageItem key={String(m.uid || m.id || `${m.timestamp || ''}_${i}`)} m={m} index={i} userId={userId} activeConv={activeConv} activeId={activeId} />
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
}
