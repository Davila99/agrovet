import React from 'react';
import { Box, IconButton, LinearProgress, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import VideoFileIcon from '@mui/icons-material/VideoFile';

/**
 * AttachmentPreview: Shows preview of pending attachment (image/audio/video) before sending
 */
export default function AttachmentPreview({ attachment, onRemove, uploading = false }) {
  if (!attachment || !attachment.file) return null;

  const fileType = attachment.file.type?.split('/')[0] || 'image';
  const previewUrl = attachment.previewUrl;

  return (
    <Box
      sx={{
        position: 'relative',
        mb: 1,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        bgcolor: '#f5f5f5',
      }}
    >
      {fileType === 'image' && previewUrl && (
        <Box sx={{ position: 'relative', width: '100%', maxHeight: 200, overflow: 'hidden' }}>
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: 200,
              objectFit: 'cover',
              display: 'block',
            }}
          />
          {!uploading && (
            <IconButton
              size="small"
              onClick={onRemove}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      )}

      {fileType === 'audio' && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AudioFileIcon sx={{ fontSize: 40, color: '#1976d2' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Audio grabado
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {attachment.file.name || 'audio.webm'}
            </Typography>
          </Box>
          {!uploading && (
            <IconButton size="small" onClick={onRemove}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      )}

      {fileType === 'video' && previewUrl && (
        <Box sx={{ position: 'relative', width: '100%', maxHeight: 200 }}>
          <video
            src={previewUrl}
            style={{
              width: '100%',
              maxHeight: 200,
              display: 'block',
            }}
            controls
          />
          {!uploading && (
            <IconButton
              size="small"
              onClick={onRemove}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      )}

      {uploading && (
        <Box sx={{ p: 1 }}>
          <LinearProgress sx={{ mb: 0.5 }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Enviando...
          </Typography>
        </Box>
      )}
    </Box>
  );
}







