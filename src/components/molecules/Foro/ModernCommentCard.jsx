import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Paper,
  IconButton,
  Stack,
  TextField,
  Button,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Reply,
  MoreVert,
  Send,
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
 * ModernCommentCard - Tarjeta moderna de comentario con diseño elegante
 */
const ModernCommentCard = ({
  comment,
  depth = 0,
  onLike,
  onReply,
  currentUser,
  onDelete,
}) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(comment.replies || []);
  const isOwner = currentUser?.id === comment.author?.id;


  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    if (onLike) onLike(comment.id);
  };

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    // Aquí deberías llamar a tu API para crear la respuesta
    const newReply = {
      id: Date.now(),
      content: replyText,
      author: currentUser,
      created_at: new Date().toISOString(),
      likes_count: 0,
    };
    setReplies(prev => [...prev, newReply]);
    setReplyText('');
    setShowReply(false);
    if (onReply) onReply(comment.id, replyText);
  };

  const indent = depth * 24;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, ml: `${indent}px` }}>
        {/* Avatar */}
        <Avatar
          src={comment.author?.profile_picture || comment.author?.avatar}
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
          }}
        >
          {comment.author?.name?.charAt(0) || 'U'}
        </Avatar>

        {/* Contenido del comentario */}
        <Box sx={{ flex: 1 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: depth === 0 ? '#f8f9fa' : '#ffffff',
              border: '1px solid',
              borderColor: depth === 0 ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.04)',
              boxShadow: depth === 0 
                ? '0 2px 4px rgba(0,0,0,0.04)' 
                : '0 1px 2px rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                borderColor: 'rgba(0,0,0,0.1)',
              },
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {comment.author?.name || comment.author?.full_name || 'Usuario Anónimo'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {formatDate(comment.created_at)}
                </Typography>
              </Box>
              {isOwner && (
                <IconButton size="small" onClick={() => onDelete && onDelete(comment.id)}>
                  <MoreVert fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* Contenido */}
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                mb: 1.5,
                lineHeight: 1.6,
                fontSize: '0.9rem',
              }}
            >
              {comment.content}
            </Typography>

            {/* Imagen si existe */}
            {comment.media && (() => {
              const media = Array.isArray(comment.media) ? comment.media[0] : comment.media;
              const src = media?.url || media?.path || media;
              if (src) {
                return (
                  <Box
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      mb: 1.5,
                      maxWidth: '300px',
                    }}
                  >
                    <img
                      src={src}
                      alt="comment media"
                      style={{
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                );
              }
              return null;
            })()}

            {/* Acciones */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Tooltip title={liked ? 'Quitar me gusta' : 'Me gusta'}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.7 },
                  }}
                  onClick={handleLike}
                >
                  {liked ? (
                    <Favorite sx={{ color: '#e91e63', fontSize: 18 }} />
                  ) : (
                    <FavoriteBorder sx={{ color: 'text.secondary', fontSize: 18 }} />
                  )}
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {likesCount}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Responder">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.7 },
                  }}
                  onClick={() => setShowReply(!showReply)}
                >
                  <Reply sx={{ color: 'text.secondary', fontSize: 18 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Responder
                  </Typography>
                </Box>
              </Tooltip>
            </Stack>

            {/* Formulario de respuesta */}
            {showReply && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Escribe tu respuesta..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" onClick={() => { setShowReply(false); setReplyText(''); }}>
                    Cancelar
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Send />}
                    onClick={handleReplySubmit}
                    disabled={!replyText.trim()}
                  >
                    Responder
                  </Button>
                </Stack>
              </Box>
            )}
          </Paper>

          {/* Respuestas anidadas */}
          {replies.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {replies.map((reply) => (
                <ModernCommentCard
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  onLike={onLike}
                  onReply={onReply}
                  currentUser={currentUser}
                  onDelete={onDelete}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ModernCommentCard;

