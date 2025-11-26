import React, { memo, useMemo } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { resolveAvatar, formatTimestamp } from '../chatUtils';
import MessageStatusTicks from '../MessageStatusTicks';
import WhatsAppAudioBubble from '../WhatsAppAudioBubble';

// Memoized MessageItem to avoid unnecessary re-renders
const MessageItem = memo(({ m, index, userId, activeConv, activeId }) => {
  const { fromMe, mediaUrl, mediaType, resolvedSpectrum, avatarSrc } = useMemo(() => {
  const fromMe = String(m.sender_id) === String(userId) || m.fromMe;
  // Support backend field `file_url` as canonical final URL; fall back to legacy keys
  const mediaUrl = m.file_url || m.media_url || m.mediaUrl || m.previewUrl || m.preview_url || m.media_preview_url || null;

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

  // Removed noisy render-time diagnostics to reduce console noise in production.

    return (
    <Box key={key} data-msg-id={m.id} data-fromme={fromMe} sx={{ display: 'flex', justifyContent: fromMe ? 'flex-end' : 'flex-start', mb: 0.75 }}>
      <Paper elevation={1} sx={{ px: '10px', py: '6px', bgcolor: fromMe ? '#DCF8C6' : '#FFFFFF', borderRadius: '12px', maxWidth: '70%', my: '6px', boxShadow: 1, wordBreak: 'break-word' }}>
        {/* Render only when there's a valid final URL, otherwise show uploading placeholder */}
        {mediaUrl ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {mediaType === 'image' && (
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <img src={mediaUrl} alt={m.text || 'image'} style={{ maxWidth: '260px', borderRadius: 6, display: 'block', objectFit: 'cover' }} />
                {m.media_uploading && typeof m.media_upload_percent === 'number' && (
                  <Box sx={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                    <CircularProgress variant="determinate" value={m.media_upload_percent} size={44} thickness={4} sx={{ color: '#21a366' }} />
                    <Typography variant="caption" sx={{ mt: '-32px', color: 'white', fontWeight: 700, fontSize: '0.65rem' }}>{Math.round(m.media_upload_percent)}%</Typography>
                  </Box>
                )}
              </Box>
            )}

            {mediaType === 'video' && (
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <video src={mediaUrl} controls style={{ maxWidth: '260px', borderRadius: 6 }} />
                {m.media_uploading && typeof m.media_upload_percent === 'number' && (
                  <Box sx={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                    <CircularProgress variant="determinate" value={m.media_upload_percent} size={44} thickness={4} sx={{ color: '#21a366' }} />
                    <Typography variant="caption" sx={{ mt: '-32px', color: 'white', fontWeight: 700, fontSize: '0.65rem' }}>{Math.round(m.media_upload_percent)}%</Typography>
                  </Box>
                )}
              </Box>
            )}

            {mediaType === 'audio' && (
              <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1 }}>
                {fromMe && avatarSrc && (
                  <img src={avatarSrc} alt="me" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', marginRight: 8, border: '2px solid rgba(255,255,255,0.85)' }} />
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
                  <Box sx={{ position: 'absolute', right: 6, top: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <CircularProgress variant="determinate" value={m.media_upload_percent} size={30} thickness={4} sx={{ color: '#21a366' }} />
                    <Typography variant="caption" sx={{ mt: '-24px', color: 'white', fontWeight: 600, fontSize: '0.6rem' }}>{Math.round(m.media_upload_percent)}%</Typography>
                  </Box>
                )}
              </Box>
            )}

            {mediaType !== 'audio' && !m.media_uploading && <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>{m.text}</Typography>}
            {m.media_uploading && typeof m.media_upload_percent === 'number' && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>Enviando: {m.media_upload_percent}%</Typography>
            )}
          </Box>
        ) : (
          // No mediaUrl yet: if upload is in progress show loader + optional local preview; otherwise show a friendly placeholder
          (() => {
            const localPreview = m.preview_data_url || m.previewUrl || m.media_url || null;
            if (m.media_uploading || m.status === 'uploading') {
              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  {localPreview ? (
                    <img src={localPreview} alt="preview" style={{ maxWidth: 260, borderRadius: 6, display: 'block', objectFit: 'cover' }} />
                  ) : (
                    <Box sx={{ width: 260, height: 140, bgcolor: '#f0f0f0', borderRadius: 6 }} />
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>Subiendo archivo...</Typography>
                </Box>
              );
            }
            const displayText = (m.text || "").toString().trim();
            if (displayText === "(" || displayText === ")") return null;
            return <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>{displayText}</Typography>;
          })()
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 0.4 }}>
          <Typography variant="caption" sx={{ color: 'gray', fontSize: '0.55rem', mr: 1 }}>{formatTimestamp(m.timestamp)}</Typography>
          <MessageStatusTicks message={m} isOwnMessage={fromMe} currentUserId={userId} />
        </Box>
      </Paper>
    </Box>
  );
}, (prevProps, nextProps) => {
  // Compare the most relevant fields by value so updates (including nested spectrum)
  // cause a re-render instead of requiring a full page reload to reflect changes.
    try {
      const a = prevProps.m || {};
      const b = nextProps.m || {};

      const aMediaUrl = String(a.media_url || a.mediaUrl || a.previewUrl || (a.media && (a.media.url || a.media.media_url)) || '');
      const bMediaUrl = String(b.media_url || b.mediaUrl || b.previewUrl || (b.media && (b.media.url || b.media.media_url)) || '');

      const getSpectrum = (x) => {
        try {
          if (!x) return null;
          if (Array.isArray(x.media_spectrum)) return x.media_spectrum;
          if (x.media && x.media.description) return typeof x.media.description === 'string' ? JSON.parse(x.media.description) : x.media.description;
          if (x.description) return typeof x.description === 'string' ? JSON.parse(x.description) : x.description;
          if (typeof x.media_spectrum === 'string' && x.media_spectrum.startsWith('[')) return JSON.parse(x.media_spectrum);
        } catch (e) {}
        return null;
      };

      const aSpec = getSpectrum(a);
      const bSpec = getSpectrum(b);

      const fieldsEqual = (
        String(a.id || '') === String(b.id || '') &&
        String(a.timestamp || '') === String(b.timestamp || '') &&
        String(a.text || '') === String(b.text || '') &&
        aMediaUrl === bMediaUrl &&
        Boolean(a.media_uploading) === Boolean(b.media_uploading) &&
        (typeof a.media_upload_percent === 'number' ? a.media_upload_percent : -1) === (typeof b.media_upload_percent === 'number' ? b.media_upload_percent : -1) &&
        JSON.stringify(aSpec || null) === JSON.stringify(bSpec || null) &&
        JSON.stringify(a.receipts || null) === JSON.stringify(b.receipts || null) &&
        prevProps.userId === nextProps.userId &&
        prevProps.activeId === nextProps.activeId
      );

      return fieldsEqual;
    } catch (e) {
      return false;
    }
});

MessageItem.displayName = 'MessageItem';

export default MessageItem;




