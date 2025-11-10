import React, { memo, useMemo } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { resolveAvatar, formatTimestamp } from '../chatUtils';
import MessageStatusTicks from '../MessageStatusTicks';
import WhatsAppAudioBubble from '../WhatsAppAudioBubble';

// Memoized MessageItem to avoid unnecessary re-renders
const MessageItem = memo(({ m, index, userId, activeConv, activeId }) => {
  const { fromMe, mediaUrl, mediaType, resolvedSpectrum, avatarSrc } = useMemo(() => {
    const fromMe = String(m.sender_id) === String(userId) || m.fromMe;
    const mediaUrl = m.media_url || m.mediaUrl || m.previewUrl || m.preview_url || m.media_preview_url || null;

    const getExt = (u) => {
      try {
        if (!u || typeof u !== 'string') return null;
        const path = u.split('?')[0];
        const parts = path.split('.');
        return parts.length ? parts[parts.length - 1].toLowerCase() : null;
      } catch (e) { return null; }
    };

    const ext = getExt(mediaUrl);
    const imageExts = ['jpg','jpeg','png','gif','webp','bmp'];
    const audioExts = ['mp3','wav','m4a','aac','oga','ogg','opus','webm'];
    const videoExts = ['mp4','mov','mkv','avi'];

    let mediaType = null;
    if (m.media_type) mediaType = m.media_type;
    else if (ext && imageExts.includes(ext)) mediaType = 'image';
    else if (ext && audioExts.includes(ext)) mediaType = 'audio';
    else if (ext && videoExts.includes(ext)) mediaType = 'video';
    else if (m.media_uploading && mediaUrl && mediaUrl.startsWith('blob:')) mediaType = 'image';

    // Resolve spectrum but DO NOT create a default array here — keep null if absent
    let resolvedSpectrum = null;
    try {
      if (Array.isArray(m.media_spectrum) && m.media_spectrum.length) resolvedSpectrum = m.media_spectrum;
      else if (m.media && m.media.description) {
        const d = m.media.description;
        resolvedSpectrum = typeof d === 'string' ? JSON.parse(d) : d;
      } else if (m.description) {
        const d = m.description; resolvedSpectrum = typeof d === 'string' ? JSON.parse(d) : d;
      } else if (typeof m.media_spectrum === 'string' && m.media_spectrum.startsWith('[')) resolvedSpectrum = JSON.parse(m.media_spectrum);
    } catch (e) { resolvedSpectrum = null; }

    if (!Array.isArray(resolvedSpectrum)) resolvedSpectrum = null;

    const avatarSrc = activeConv && activeConv.avatar ? resolveAvatar(activeConv.avatar) : null;

    return { fromMe, mediaUrl, mediaType, resolvedSpectrum, avatarSrc };
  }, [m, userId, activeConv]);

  const key = String(m.uid || m.id || `${m.timestamp || ''}_${index}`);

  if (process.env.NODE_ENV === 'development') {
    try { console.log('[MESSAGE_ITEM] render id=', m && m.id, 'media_spectrum=', resolvedSpectrum); } catch (e) {}
  }

  return (
    <Box key={key} data-msg-id={m.id} data-fromme={fromMe} sx={{ display: 'flex', justifyContent: fromMe ? 'flex-end' : 'flex-start', mb: 1 }}>
      <Paper elevation={1} sx={{ px: '12px', py: '8px', bgcolor: fromMe ? '#DCF8C6' : '#FFFFFF', borderRadius: '16px', maxWidth: '80%', my: '6px', boxShadow: 1, wordBreak: 'break-word' }}>
        {mediaUrl ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {mediaType === 'image' && (
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <img src={mediaUrl} alt={m.text || 'image'} style={{ maxWidth: '320px', borderRadius: 8, display: 'block' }} />
                {m.media_uploading && typeof m.media_upload_percent === 'number' && (
                  <Box sx={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                    <CircularProgress variant="determinate" value={m.media_upload_percent} size={56} thickness={4} sx={{ color: '#21a366' }} />
                    <Typography variant="caption" sx={{ mt: '-40px', color: 'white', fontWeight: 700, fontSize: '0.7rem' }}>{Math.round(m.media_upload_percent)}%</Typography>
                  </Box>
                )}
              </Box>
            )}

            {mediaType === 'video' && (
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <video src={mediaUrl} controls style={{ maxWidth: '320px', borderRadius: 8 }} />
                {m.media_uploading && typeof m.media_upload_percent === 'number' && (
                  <Box sx={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                    <CircularProgress variant="determinate" value={m.media_upload_percent} size={56} thickness={4} sx={{ color: '#21a366' }} />
                    <Typography variant="caption" sx={{ mt: '-40px', color: 'white', fontWeight: 700, fontSize: '0.7rem' }}>{Math.round(m.media_upload_percent)}%</Typography>
                  </Box>
                )}
              </Box>
            )}

            {mediaType === 'audio' && (
              <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1 }}>
                {fromMe && avatarSrc && (
                  <img src={avatarSrc} alt="me" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', marginRight: 8, border: '3px solid rgba(255,255,255,0.85)' }} />
                )}

                <WhatsAppAudioBubble 
                  src={mediaUrl} 
                  avatarUrl={fromMe ? avatarSrc : null} 
                  fromMe={fromMe} 
                  timestamp={m.timestamp} 
                  duration={m.duration || (m.media && m.media.duration) || undefined} 
                  waveformData={resolvedSpectrum} 
                  receipts={m.receipts} 
                  currentUserId={userId} 
                  id={m.id} 
                />

                {m.media_uploading && typeof m.media_upload_percent === 'number' && (
                  <Box sx={{ position: 'absolute', right: 8, top: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <CircularProgress variant="determinate" value={m.media_upload_percent} size={36} thickness={4} sx={{ color: '#21a366' }} />
                    <Typography variant="caption" sx={{ mt: '-28px', color: 'white', fontWeight: 600, fontSize: '0.65rem' }}>{Math.round(m.media_upload_percent)}%</Typography>
                  </Box>
                )}
              </Box>
            )}

            {mediaType !== 'audio' && !m.media_uploading && <Typography variant="body2">{m.text}</Typography>}
            {m.media_uploading && typeof m.media_upload_percent === 'number' && (
              <Typography variant="caption" color="text.secondary">Enviando: {m.media_upload_percent}%</Typography>
            )}
          </Box>
        ) : (
          (() => {
            const displayText = (m.text || "").toString().trim();
            if (displayText === "(" || displayText === ")") return null;
            return <Typography variant="body2">{displayText}</Typography>;
          })()
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'gray', fontSize: '0.7rem', mr: 1 }}>{formatTimestamp(m.timestamp)}</Typography>
          <MessageStatusTicks message={m} isOwnMessage={fromMe} currentUserId={userId} />
        </Box>
      </Paper>
    </Box>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo: shallow comparisons for relevant fields
  return (
    prevProps.m.id === nextProps.m.id &&
    prevProps.m.text === nextProps.m.text &&
    prevProps.m.media_url === nextProps.m.media_url &&
    prevProps.m.media_spectrum === nextProps.m.media_spectrum &&
    prevProps.m.media_uploading === nextProps.m.media_uploading &&
    prevProps.m.media_upload_percent === nextProps.m.media_upload_percent &&
    prevProps.m.receipts === nextProps.m.receipts &&
    prevProps.userId === nextProps.userId &&
    prevProps.activeId === nextProps.activeId
  );
});

MessageItem.displayName = 'MessageItem';

export default MessageItem;
