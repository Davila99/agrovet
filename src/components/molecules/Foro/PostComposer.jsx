import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Avatar,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Image,
  VideoCall,
  Close,
  Send,
} from '@mui/icons-material';
import { validatePost } from '../../../utils/Foro/validators';
import { useCreatePost, useUploadMedia, useCommunities } from '../../../hooks/Foro/useForoApi';
import { filterCommunitiesByRole } from '../../../utils/Foro/autoJoinCommunities';
import foroService from '../../../services/endpoints/foro';
import useAuth from '../../../hooks/Foro/useAuth';

/**
 * PostComposer: Modern form for creating posts with image/video support
 */
export default function PostComposer({ onCreated, communityId = null, communities: propCommunities = null }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaId, setMediaId] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
  const [selectedCommunity, setSelectedCommunity] = useState(communityId || '');
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const create = useCreatePost();
  const uploader = useUploadMedia();
  
  // Get communities for the user's role
  const { data: hookCommunities } = useCommunities();
  const allCommunities = propCommunities || hookCommunities || [];
  const communities = filterCommunitiesByRole(allCommunities, user?.role);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
      setMediaType('image');
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const result = await uploader.mutateAsync(file);
      setMediaId(result.id || result.media_id);
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      setErrors({ image: 'Error al subir la imagen' });
      setMediaPreview(null);
      setMediaType(null);
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 100MB for videos)
    if (file.size > 100 * 1024 * 1024) {
      setErrors({ video: 'El video no puede superar los 100MB' });
      return;
    }

    // Preview
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
    setMediaType('video');

    // Upload
    setUploading(true);
    try {
      const result = await uploader.mutateAsync(file);
      setMediaId(result.id || result.media_id);
    } catch (error) {
      console.error('Error subiendo video:', error);
      setErrors({ video: 'Error al subir el video' });
      setMediaPreview(null);
      setMediaType(null);
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = () => {
    setMediaId(null);
    setMediaPreview(null);
    setMediaType(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  async function submit(e) {
    e.preventDefault();
    setErrors({});

    const v = validatePost({ title, content });
    if (Object.keys(v).length) return setErrors(v);

    if (!selectedCommunity) {
      return setErrors({ community: 'Selecciona una comunidad' });
    }

    try {
      const payload = { 
        title, 
        content,
        community_id: Number(selectedCommunity),
      };

      if (mediaId) {
        payload.media_id = Number(mediaId);
      }

      const res = await create.mutateAsync(payload);
      
      // Clear form
      setTitle('');
      setContent('');
      setMediaId(null);
      setMediaPreview(null);
      setMediaType(null);

      // Get full post if needed
      let created = res;
      try {
        if (res && res.id && (!res.title || !res.author)) {
          const full = await foroService.getPostDetail(res.id);
          if (full) created = full;
        }
      } catch (e) {
        console.debug('fallback getPostDetail failed', e);
      }

      if (onCreated) onCreated(created);
    } catch (err) {
      const body = err?.body;
      if (body && typeof body === 'object') {
        setErrors(body);
      } else {
        setErrors({ submit: err.message || 'Error al crear la publicación' });
      }
    }
  }

  // Get selected community data for display
  const selectedCommunityData = communities.find(c => c.id === Number(selectedCommunity));
  const hasContent = title.trim().length > 0;

  return (
    <Box component="form" onSubmit={submit}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>
        Crear publicación
      </Typography>

      {/* User info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Avatar 
          src={user?.profile_picture}
          sx={{ 
            width: 44, 
            height: 44, 
            bgcolor: '#00695c',
            fontWeight: 600,
          }}
        >
          {user?.full_name?.[0] || user?.name?.[0] || '?'}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user?.full_name || user?.name || 'Usuario'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Publicando en la comunidad
          </Typography>
        </Box>
      </Box>

      {/* Community selector */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Comunidad</InputLabel>
        <Select
          value={selectedCommunity}
          onChange={(e) => setSelectedCommunity(e.target.value)}
          label="Comunidad"
          disabled={!!communityId}
          sx={{ borderRadius: 2 }}
        >
          {communities.map((community) => (
            <MenuItem key={community.id} value={community.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar src={community.avatar} sx={{ width: 24, height: 24, bgcolor: '#00695c' }}>
                  {community.name?.[0]}
                </Avatar>
                <Typography>{community.name}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
        {errors.community && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
            {errors.community}
          </Typography>
        )}
      </FormControl>

      {/* Selected community chip */}
      {selectedCommunityData && (
        <Chip
          avatar={<Avatar src={selectedCommunityData.avatar}>{selectedCommunityData.name?.[0]}</Avatar>}
          label={selectedCommunityData.name}
          sx={{ mb: 2 }}
          color="primary"
          variant="outlined"
        />
      )}

      {/* Title */}
      <TextField
        placeholder="Título de tu publicación"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={!!errors.title}
        helperText={errors.title}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: '#f8f9fa',
          },
        }}
      />

      {/* Content */}
      <TextField
        placeholder="¿Qué quieres compartir?"
        fullWidth
        multiline
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        error={!!errors.content}
        helperText={errors.content}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      {/* Media preview */}
      {mediaPreview && (
        <Box sx={{ position: 'relative', mb: 2 }}>
          {mediaType === 'video' ? (
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: '#000',
              }}
            >
              <video
                src={mediaPreview}
                controls
                style={{
                  width: '100%',
                  maxHeight: 300,
                }}
              />
            </Box>
          ) : (
            <Box
              component="img"
              src={mediaPreview}
              sx={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'cover',
                borderRadius: 2,
              }}
            />
          )}
          <IconButton
            onClick={removeMedia}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.6)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
            }}
          >
            <Close />
          </IconButton>
        </Box>
      )}

      {/* Actions bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1}>
          {/* Image upload */}
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <Tooltip title="Agregar imagen">
            <IconButton
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading || !!mediaPreview}
              sx={{
                bgcolor: '#f0f0f0',
                '&:hover': { bgcolor: '#e0e0e0' },
              }}
            >
              {uploading && mediaType === 'image' ? <CircularProgress size={20} /> : <Image />}
            </IconButton>
          </Tooltip>

          {/* Video upload */}
          <input
            type="file"
            accept="video/*"
            ref={videoInputRef}
            style={{ display: 'none' }}
            onChange={handleVideoUpload}
          />
          <Tooltip title="Agregar video">
            <IconButton
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading || !!mediaPreview}
              sx={{
                bgcolor: '#f0f0f0',
                '&:hover': { bgcolor: '#e0e0e0' },
              }}
            >
              {uploading && mediaType === 'video' ? <CircularProgress size={20} /> : <VideoCall />}
            </IconButton>
          </Tooltip>
        </Stack>

        <Button
          type="submit"
          variant="contained"
          disabled={create.isLoading || !hasContent || uploading}
          startIcon={create.isLoading ? <CircularProgress size={18} /> : <Send />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            bgcolor: '#00695c',
            '&:hover': { bgcolor: '#00796b' },
            '&.Mui-disabled': {
              bgcolor: '#b2dfdb',
              color: 'white',
            },
          }}
        >
          Publicar
        </Button>
      </Box>

      {/* Error messages */}
      {errors.submit && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errors.submit}
        </Alert>
      )}
      {errors.image && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errors.image}
        </Alert>
      )}
      {errors.video && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errors.video}
        </Alert>
      )}
    </Box>
  );
}
