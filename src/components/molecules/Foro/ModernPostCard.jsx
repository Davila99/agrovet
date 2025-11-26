import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Stack,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Share,
  Bookmark,
  BookmarkBorder,
  MoreVert,
  Visibility,
  Pets,
  LocalHospital,
  Agriculture,
  Person,
  Message,
} from '@mui/icons-material';

// Función helper para formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'hace unos segundos';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    if (diffInSeconds < 31536000) return `hace ${Math.floor(diffInSeconds / 2592000)} meses`;
    return `hace ${Math.floor(diffInSeconds / 31536000)} años`;
  } catch {
    return dateString;
  }
};

/**
 * ModernPostCard - Tarjeta moderna de publicación con sombras elegantes
 * Diseñada para ganaderos y veterinarios
 */
const ModernPostCard = ({ post, onLike, onComment, onShare, onBookmark, onDelete, onConsult, currentUser }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || post.reactions_count || 0);
  const [anchorEl, setAnchorEl] = useState(null);
  const isOwner = currentUser?.id === post.author?.id;
  const canConsult = currentUser && post.author?.id && !isOwner;

  // Determinar categoría y color
  const getCategoryInfo = (category) => {
    const categories = {
      ganadero: { icon: <Agriculture />, color: '#2E7D32', label: 'Ganadero' },
      veterinario: { icon: <LocalHospital />, color: '#1976D2', label: 'Veterinario' },
      especialista: { icon: <Pets />, color: '#7B1FA2', label: 'Especialista' },
      general: { icon: <Person />, color: '#757575', label: 'General' },
    };
    return categories[category?.toLowerCase()] || categories.general;
  };

  const categoryInfo = getCategoryInfo(post.category || post.community?.name);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    if (onLike) onLike(post.id);
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    if (onBookmark) onBookmark(post.id);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 4,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(0,0,0,0.06)',
        overflow: 'hidden',
        bgcolor: '#ffffff',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.08)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      {/* Header con avatar y categoría */}
      <CardContent sx={{ pb: 1, pt: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={post.author?.profile_picture || post.author?.avatar}
              sx={{
                width: 52,
                height: 52,
                border: `3px solid ${categoryInfo.color}`,
                bgcolor: categoryInfo.color,
                boxShadow: `0 0 0 2px ${categoryInfo.color}20`,
              }}
            >
              {post.author?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a' }}>
                {post.author?.name || post.author?.full_name || 'Usuario Anónimo'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                <Chip
                  icon={categoryInfo.icon}
                  label={categoryInfo.label}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    bgcolor: `${categoryInfo.color}15`,
                    color: categoryInfo.color,
                    fontWeight: 600,
                    border: `1px solid ${categoryInfo.color}30`,
                    '& .MuiChip-icon': {
                      color: categoryInfo.color,
                    },
                  }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                  {formatDate(post.created_at)}
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton size="small" onClick={handleMenuOpen} sx={{ color: 'text.secondary' }}>
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        {/* Título */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 1.5,
            fontSize: '1.15rem',
            color: '#1a1a1a',
            lineHeight: 1.4,
          }}
        >
          {post.title}
        </Typography>

        {/* Contenido */}
        {post.content && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 2,
              lineHeight: 1.7,
              fontSize: '0.9rem',
            }}
          >
            {post.content}
          </Typography>
        )}

        {/* Imagen si existe */}
        {post.media && (() => {
          const media = Array.isArray(post.media) ? post.media[0] : post.media;
          const src = media?.url || media?.path || media;
          if (src) {
            return (
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  mb: 2,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }}
              >
                <img
                  src={src}
                  alt={post.title}
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </Box>
            );
          }
          return null;
        })()}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {post.tags.map((tag, index) => (
              <Chip
                key={index}
                label={`#${tag}`}
                size="small"
                sx={{
                  fontSize: '0.75rem',
                  bgcolor: 'rgba(0,0,0,0.04)',
                  color: 'text.secondary',
                  fontWeight: 500,
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              />
            ))}
          </Stack>
        )}
      </CardContent>

      <Divider sx={{ bgcolor: 'rgba(0,0,0,0.06)' }} />

      {/* Acciones */}
      <CardActions sx={{ px: 2, py: 1.5, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Like */}
          <Tooltip title={liked ? 'Quitar me gusta' : 'Me gusta'}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                px: 1,
                py: 0.5,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'rgba(233, 30, 99, 0.08)' },
              }}
              onClick={handleLike}
            >
              {liked ? (
                <Favorite sx={{ color: '#e91e63', fontSize: 20 }} />
              ) : (
                <FavoriteBorder sx={{ color: 'text.secondary', fontSize: 20 }} />
              )}
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {likesCount}
              </Typography>
            </Box>
          </Tooltip>

          {/* Comentarios */}
          <Tooltip title="Comentarios">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                px: 1,
                py: 0.5,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
              }}
              onClick={() => onComment && onComment(post.id)}
            >
              <Comment sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {post.comments_count || 0}
              </Typography>
            </Box>
          </Tooltip>

          {/* Vistas */}
          {post.views_count > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Visibility sx={{ color: 'text.secondary', fontSize: 18 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                {post.views_count}
              </Typography>
            </Box>
          )}
        </Stack>

        <Stack direction="row" spacing={1}>
          {/* Botón Consultar */}
          {canConsult && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Message />}
              onClick={() => onConsult && onConsult(post)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                fontWeight: 600,
                bgcolor: categoryInfo.color,
                boxShadow: `0 2px 8px ${categoryInfo.color}40`,
                '&:hover': {
                  bgcolor: categoryInfo.color,
                  boxShadow: `0 4px 12px ${categoryInfo.color}50`,
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Consultar
            </Button>
          )}

          {/* Compartir */}
          <Tooltip title="Compartir">
            <IconButton 
              size="small" 
              onClick={() => onShare && onShare(post)}
              sx={{
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
              }}
            >
              <Share fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Guardar */}
          <Tooltip title={bookmarked ? 'Quitar de guardados' : 'Guardar'}>
            <IconButton 
              size="small" 
              onClick={handleBookmark}
              sx={{
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
              }}
            >
              {bookmarked ? (
                <Bookmark sx={{ color: '#ff9800' }} fontSize="small" />
              ) : (
                <BookmarkBorder fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
      </CardActions>

      {/* Menú de opciones */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {isOwner && (
          <MenuItem onClick={() => { onDelete && onDelete(post.id); handleMenuClose(); }}>
            Eliminar publicación
          </MenuItem>
        )}
        <MenuItem onClick={handleMenuClose}>Reportar</MenuItem>
        <MenuItem onClick={() => { navigator.clipboard.writeText(window.location.href + `/post/${post.id}`); handleMenuClose(); }}>
          Copiar enlace
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ModernPostCard;
