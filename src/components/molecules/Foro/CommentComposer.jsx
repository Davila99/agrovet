import React, { useState, useRef } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  Avatar,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { Send, Image, Close } from '@mui/icons-material';
import { useCreateComment, useUploadMedia } from '../../../hooks/Foro/useForoApi';
import useAuth from '../../../hooks/Foro/useAuth';

/**
 * CommentComposer: Modern comment input with validation
 * - Shows send button only when content is not empty
 * - Supports image/video upload
 */
export default function CommentComposer({ postId, parentId = null, onCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaId, setMediaId] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef(null);
  const create = useCreateComment();
  const uploader = useUploadMedia();

  const hasContent = content.trim().length > 0;
  const isSubmitting = create.isLoading;

  const handleMediaUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const result = await uploader.mutateAsync(file);
      setMediaId(result.id || result.media_id);
    } catch (error) {
      console.error('Error uploading media:', error);
      setMediaPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = () => {
    setMediaId(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  async function handleSubmit(e) {
    if (e?.preventDefault) e.preventDefault();
    if (!hasContent && !mediaId) return;
    
    try {
      const payload = { 
        post: postId, 
        parent: parentId, 
        content: content.trim(),
      };
      
      if (mediaId) {
        payload.media_id = mediaId;
      }
      
      const res = await create.mutateAsync(payload);
      
      // Reset form
      setContent('');
      setMediaId(null);
      setMediaPreview(null);
      
      if (onCreated) onCreated(res);
    } catch (err) {
      console.error('Failed to create comment', err);
    }
  }

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        display: 'flex', 
        gap: 1.5, 
        alignItems: 'flex-start',
      }}
    >
      <Avatar 
        src={user?.profile_picture}
        sx={{ 
          width: 36, 
          height: 36, 
          bgcolor: '#00695c',
          fontSize: '0.9rem',
          fontWeight: 600,
          mt: 0.5,
        }}
      >
        {user?.full_name?.[0] || user?.name?.[0] || '?'}
      </Avatar>
      
      <Box sx={{ flex: 1 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'flex-end',
            gap: 1,
            bgcolor: '#f5f7fa',
            borderRadius: 3,
            p: 1,
            border: '1px solid transparent',
            transition: 'all 0.2s ease',
            '&:focus-within': {
              borderColor: '#00695c',
              bgcolor: '#ffffff',
            },
          }}
        >
          <TextField
            placeholder="Añadir un comentario..."
            fullWidth
            multiline
            maxRows={4}
            value={content}
            onChange={e => setContent(e.target.value)}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: { 
                fontSize: '0.9rem',
                px: 1,
              },
            }}
            sx={{
              flex: 1,
            }}
          />
          
          {/* Media upload button */}
          <input
            type="file"
            accept="image/*,video/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleMediaUpload}
          />
          <Tooltip title="Adjuntar imagen o video">
            <IconButton 
              size="small" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: '#00695c' },
              }}
            >
              {uploading ? <CircularProgress size={18} /> : <Image fontSize="small" />}
            </IconButton>
          </Tooltip>
          
          {/* Send button - only visible when there's content */}
          {(hasContent || mediaId) && (
            <Tooltip title="Enviar comentario">
              <IconButton 
                type="submit" 
                disabled={isSubmitting}
                sx={{ 
                  bgcolor: '#00695c',
                  color: 'white',
                  width: 32,
                  height: 32,
                  '&:hover': { bgcolor: '#00796b' },
                  '&.Mui-disabled': { 
                    bgcolor: '#b2dfdb',
                    color: 'white',
                  },
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={16} sx={{ color: 'white' }} />
                ) : (
                  <Send sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        {/* Media preview */}
        {mediaPreview && (
          <Box sx={{ position: 'relative', mt: 1, maxWidth: 200 }}>
            <Box
              component="img"
              src={mediaPreview}
              sx={{
                width: '100%',
                borderRadius: 2,
                maxHeight: 150,
                objectFit: 'cover',
              }}
            />
            <IconButton
              size="small"
              onClick={removeMedia}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                bgcolor: 'rgba(0,0,0,0.6)',
                color: 'white',
                width: 24,
                height: 24,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
              }}
            >
              <Close sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}
