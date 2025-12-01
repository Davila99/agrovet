import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  Edit,
  CameraAlt,
  People,
  Article,
  Add,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCommunities, usePosts } from '../../../hooks/Foro/useForoApi';
import PostList from './PostList';
import PostComposer from '../../molecules/Foro/PostComposer';
import foroService from '../../../services/endpoints/foro';
import authClient from '../../../services/authClient';
import useAuth from '../../../hooks/Foro/useAuth';
import { COMMUNITY_SLUGS } from '../../../utils/Foro/autoJoinCommunities';

// Colors for each community
const communityColors = {
  [COMMUNITY_SLUGS.GENERAL]: '#6366F1',
  [COMMUNITY_SLUGS.CONSUMERS]: '#F59E0B',
  [COMMUNITY_SLUGS.SPECIALISTS]: '#10B981',
  [COMMUNITY_SLUGS.BUSINESSMEN]: '#3B82F6',
};

const getCommunityColor = (slug) => {
  return communityColors[slug] || '#00695c';
};

/**
 * CommunityView - Full community page with header, posts and sidebar
 */
export default function CommunityView({ communityId }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: communitiesData, isLoading } = useCommunities();
  const communities = communitiesData || [];
  // Be robust to id types (strings vs numbers) coming from params or API
  const community = communities.find(c => String(c.id) === String(communityId));

  // If community is not present in cached list, try fetching it directly
  const [communityFromApi, setCommunityFromApi] = React.useState(null);
  React.useEffect(() => {
    let mounted = true;
    if (!community && communityId) {
      foroService.getCommunityDetail(communityId).then(res => {
        if (!mounted) return;
        setCommunityFromApi(res);
      }).catch(() => {
        // ignore — will show not found message below
      });
    }
    return () => { mounted = false; };
  }, [communityId, community]);

  const effectiveCommunity = community || communityFromApi;
  const { data: postsData } = usePosts({ community: communityId });
  const postsCount = Array.isArray(postsData) ? postsData.length : 0;

  const [openComposer, setOpenComposer] = useState(false);
  const [createdPosts, setCreatedPosts] = useState([]);
  const [editingInfo, setEditingInfo] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    short_description: '',
    description: '',
  });

  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const color = effectiveCommunity ? getCommunityColor(effectiveCommunity.slug) : '#00695c';

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      // Quick client-side check for token to provide immediate feedback
      const token = authClient.getAccessToken && authClient.getAccessToken();
      if (!token) {
        alert('No está autenticado. Inicia sesión e inténtalo de nuevo.');
        setUploading(false);
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      await foroService.uploadCommunityCover(communityId, formData);
      window.location.reload();
    } catch (error) {
      console.error('Error subiendo portada:', error);
      if (error && error.status === 401) {
        alert('No autorizado. Las credenciales no se proveyeron o expiraron. Inicia sesión de nuevo.');
      } else {
        alert('Error al subir la imagen de portada: ' + (error && error.message ? error.message : 'Error desconocido'));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const token = authClient.getAccessToken && authClient.getAccessToken();
      if (!token) {
        alert('No está autenticado. Inicia sesión e inténtalo de nuevo.');
        setUploading(false);
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      await foroService.uploadCommunityAvatar(communityId, formData);
      window.location.reload();
    } catch (error) {
      console.error('Error subiendo avatar:', error);
      if (error && error.status === 401) {
        alert('No autorizado. Las credenciales no se proveyeron o expiraron. Inicia sesión de nuevo.');
      } else {
        alert('Error al subir el avatar: ' + (error && error.message ? error.message : 'Error desconocido'));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateInfo = async () => {
    try {
      await foroService.updateCommunity(communityId, editForm);
      window.location.reload();
    } catch (error) {
      console.error('Error actualizando comunidad:', error);
      alert('Error al actualizar la comunidad');
    }
  };

  const openEditInfo = () => {
    setEditForm({
      name: effectiveCommunity?.name || '',
      short_description: effectiveCommunity?.short_description || '',
      description: effectiveCommunity?.description || '',
    });
    setEditingInfo(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#00695c' }} />
      </Box>
    );
  }

  if (!effectiveCommunity) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Comunidad no encontrada
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/foro')}
          sx={{ borderRadius: 2 }}
        >
          Volver al foro
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', pb: 4 }}>
      {/* Header with cover image */}
      <Box sx={{ position: 'relative' }}>
        {/* Cover image */}
        <Box
          sx={{
            height: { xs: 140, md: 200 },
            background: effectiveCommunity.cover_image
              ? `url(${effectiveCommunity.cover_image}) center/cover`
              : `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
            position: 'relative',
          }}
        >
          {/* Edit cover button */}
          <Tooltip title="Cambiar portada">
            <IconButton
              onClick={() => coverInputRef.current?.click()}
              disabled={uploading}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
              }}
            >
              {uploading ? <CircularProgress size={20} /> : <CameraAlt />}
            </IconButton>
          </Tooltip>
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {/* Back button */}
          <IconButton
            onClick={() => navigate('/foro')}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
            }}
          >
            <ArrowBack />
          </IconButton>
        </Box>

        {/* Community info card */}
        <Box
          sx={{
            maxWidth: 1100,
            mx: 'auto',
            px: { xs: 2, md: 3 },
            mt: { xs: -5, md: -6 },
            position: 'relative',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              bgcolor: '#ffffff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2.5 }}>
              {/* Avatar */}
              <Box sx={{ position: 'relative', alignSelf: { xs: 'center', md: 'flex-start' } }}>
                <Avatar
                  src={effectiveCommunity.avatar}
                  sx={{
                    width: { xs: 80, md: 100 },
                    height: { xs: 80, md: 100 },
                    border: '4px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    bgcolor: color,
                    fontSize: { xs: 32, md: 40 },
                    fontWeight: 700,
                  }}
                >
                  {effectiveCommunity.name?.[0]}
                </Avatar>
                <Tooltip title="Cambiar foto">
                  <IconButton
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploading}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: color,
                      color: 'white',
                      width: 32,
                      height: 32,
                      '&:hover': { bgcolor: `${color}dd` },
                    }}
                  >
                    <CameraAlt sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </Box>

              {/* Info */}
              <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 1, mb: 0.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    {effectiveCommunity.name}
                  </Typography>
                  <Tooltip title="Editar información">
                    <IconButton size="small" onClick={openEditInfo}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {effectiveCommunity.short_description || effectiveCommunity.description || 'Sin descripción'}
                </Typography>

                <Stack 
                  direction="row" 
                  spacing={3} 
                  sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <People sx={{ color: 'text.secondary', fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary">
                      <strong>{effectiveCommunity.members_count || 0}</strong> miembros
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Article sx={{ color: 'text.secondary', fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary">
                      <strong>{postsCount}</strong> publicaciones
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Actions */}
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, alignItems: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenComposer(true)}
                  sx={{
                    bgcolor: '#00695c',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    '&:hover': { bgcolor: '#00796b' },
                  }}
                >
                  + Crear publicación
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 }, mt: 3 }}>
        <Grid container spacing={3}>
          {/* Posts */}
          <Grid item xs={12} md={8}>
            <PostList params={{ community: communityId }} extraPosts={createdPosts} orderBy="relevance" />
          </Grid>

          {/* Right Sidebar intentionally removed: the forum's blue left sidebar is mounted globally in App.jsx */}
        </Grid>
      </Box>

      {/* Create post dialog */}
      <Dialog 
        open={openComposer} 
        onClose={() => setOpenComposer(false)} 
        fullWidth 
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogContent sx={{ p: 3 }}>
          <PostComposer 
            communityId={communityId} 
            onCreated={(post) => {
              setCreatedPosts(prev => [post, ...prev]);
              setOpenComposer(false);
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit info dialog */}
      <Dialog 
        open={editingInfo} 
        onClose={() => setEditingInfo(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Editar comunidad</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre"
              fullWidth
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              label="Descripción corta"
              fullWidth
              value={editForm.short_description}
              onChange={(e) => setEditForm(prev => ({ ...prev, short_description: e.target.value }))}
            />
            <TextField
              label="Descripción completa"
              fullWidth
              multiline
              rows={4}
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditingInfo(false)} sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateInfo}
            sx={{ 
              borderRadius: 2, 
              bgcolor: '#00695c', 
              '&:hover': { bgcolor: '#00796b' } 
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
