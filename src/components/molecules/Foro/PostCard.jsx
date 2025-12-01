import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  Avatar, 
  IconButton, 
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  ArrowUpward,
  ArrowDownward,
  Delete,
  Comment,
  Verified,
  School,
  Person,
} from '@mui/icons-material';
import Timestamp from '../../atoms/Foro/Timestamp';
import ReactionBubble from '../../atoms/Foro/ReactionBubble';
import useAuth from '../../../hooks/Foro/useAuth';
import { useDeletePost, useReact } from '../../../hooks/Foro/useForoApi';
import { confirm } from '../../../utils/Foro/confirm';

/**
 * Get role badge config based on user role
 */
const getRoleBadge = (role, isStudent = false, isTitled = false) => {
  if (isTitled) {
    return {
      icon: <Verified sx={{ fontSize: 14 }} />,
      label: 'Titulado',
      color: '#00695c',
      bgcolor: '#e0f2f1',
    };
  }
  
  if (isStudent) {
    return {
      icon: <School sx={{ fontSize: 14 }} />,
      label: 'Estudiante',
      color: '#1976d2',
      bgcolor: '#e3f2fd',
    };
  }
  
  const roleStr = String(role || '').toLowerCase();
  
  if (roleStr.includes('specialist') || roleStr.includes('especialista')) {
    return {
      icon: <Verified sx={{ fontSize: 14 }} />,
      label: 'Especialista',
      color: '#00695c',
      bgcolor: '#e0f2f1',
    };
  }
  
  if (roleStr.includes('business') || roleStr.includes('empresario')) {
    return {
      icon: <Verified sx={{ fontSize: 14 }} />,
      label: 'Empresario',
      color: '#1565c0',
      bgcolor: '#e3f2fd',
    };
  }
  
  // Consumer - no special badge, just show name
  return null;
};

/**
 * PostCard - Modern post card with vote column and role badges
 */
export default function PostCard({ post, onDeleted }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const deleter = useDeletePost();
  const reactor = useReact();
  const [localReacts, setLocalReacts] = useState(post.reactions_count || post.likes_count || 0);
  const [hasVoted, setHasVoted] = useState(false);

  const author = post.author || {};
  const isOwner = user && author && user.id === author.id;
  const roleBadge = getRoleBadge(author.role, author.is_student, author.is_titled);

  async function handleDelete() {
    const ok = await confirm('¿Eliminar publicación?', 'Esta acción no se puede deshacer');
    if (!ok) return;
    try {
      await deleter.mutateAsync(post.id);
      if (onDeleted) onDeleted(post.id);
    } catch (e) {
      console.error('delete failed', e);
    }
  }

  async function handleUpvote() {
    if (hasVoted) return;
    try {
      setLocalReacts(r => r + 1);
      setHasVoted(true);
      await reactor.mutateAsync({ type: 'heart', content_type: 'post', object_id: post.id });
    } catch (e) {
      console.error('react failed', e);
      setLocalReacts(r => Math.max(0, r - 1));
      setHasVoted(false);
    }
  }

  const goToPost = () => navigate(`/foro/post/${post.id}`);

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
      {/* Vote column */}
      <Box 
        sx={{ 
          width: 48, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          mr: 1.5,
          pt: 1,
        }}
      >
        <IconButton 
          size="small" 
          onClick={handleUpvote}
          disabled={hasVoted}
          sx={{ 
            borderRadius: 2, 
            bgcolor: hasVoted ? '#e0f2f1' : 'transparent',
            color: hasVoted ? '#00695c' : 'text.secondary',
            '&:hover': { 
              bgcolor: '#e0f2f1',
              transform: 'translateY(-2px)',
            }, 
            transition: 'all 160ms ease',
          }}
        >
          <ArrowUpward fontSize="small" />
        </IconButton>
        <Typography 
          sx={{ 
            fontWeight: 700, 
            my: 0.5, 
            color: localReacts > 0 ? '#00695c' : 'text.secondary',
            fontSize: '0.9rem',
          }}
        >
          {localReacts}
        </Typography>
        <IconButton 
          size="small" 
          sx={{ 
            borderRadius: 2, 
            color: 'text.secondary',
            '&:hover': { 
              bgcolor: '#ffebee',
              transform: 'translateY(2px)',
            }, 
            transition: 'all 160ms ease',
          }}
        >
          <ArrowDownward fontSize="small" />
        </IconButton>
      </Box>

      {/* Main card */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.08)',
          bgcolor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 220ms ease',
          cursor: 'pointer',
          '&:hover': { 
            transform: 'translateY(-2px)', 
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            borderColor: '#00695c',
          },
        }}
        onClick={goToPost}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 1.5 }}>
          <Avatar 
            src={author.profile_picture || author.avatar}
            sx={{ 
              width: 44, 
              height: 44,
              bgcolor: '#00695c',
              fontWeight: 600,
            }}
          >
            {author.full_name?.[0] || author.name?.[0] || '?'}
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography 
                variant="subtitle2" 
                sx={{ fontWeight: 700, color: '#1a1a1a' }}
              >
                {author.full_name || author.name || 'Usuario'}
              </Typography>
              
              {roleBadge && (
                <Chip
                  icon={roleBadge.icon}
                  label={roleBadge.label}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: roleBadge.bgcolor,
                    color: roleBadge.color,
                    '& .MuiChip-icon': {
                      color: roleBadge.color,
                    },
                  }}
                />
              )}
              
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                / {post.community?.name || 'General'}
              </Typography>
            </Stack>
            
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              <Timestamp iso={post.created_at} />
            </Typography>
          </Box>
          
          {isOwner && (
            <IconButton 
              onClick={(e) => { e.stopPropagation(); handleDelete(); }} 
              size="small" 
              sx={{ color: 'text.secondary' }}
            >
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Content */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography 
            variant="h6" 
            component="h3" 
            sx={{ 
              mb: 1, 
              fontWeight: 700,
              fontSize: '1.1rem',
              color: '#1a1a1a',
              lineHeight: 1.3,
            }}
          >
            {post.title}
          </Typography>
          
          {post.content && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.primary', 
                mb: 1.5,
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {post.content}
            </Typography>
          )}

          {/* Media */}
          {(() => {
            const media = Array.isArray(post.media) ? post.media[0] : post.media;
            if (media && (media.url || media.path)) {
              const src = media.url || media.path;
              const isVideo = src?.includes('.mp4') || src?.includes('.webm') || media.type === 'video';
              
              if (isVideo) {
                return (
                  <Box 
                    sx={{ 
                      mt: 1.5, 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      bgcolor: '#000',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <video 
                      src={src} 
                      controls 
                      style={{ width: '100%', maxHeight: 400 }}
                    />
                  </Box>
                );
              }
              
              return (
                <Box 
                  sx={{ 
                    mt: 1.5, 
                    borderRadius: 2, 
                    overflow: 'hidden',
                  }}
                >
                  <img 
                    src={src} 
                    alt="media" 
                    style={{ 
                      width: '100%', 
                      maxHeight: 400, 
                      objectFit: 'cover',
                    }} 
                  />
                </Box>
              );
            }
            return null;
          })()}

          {/* Footer */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mt: 2,
              pt: 1.5,
              borderTop: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <ReactionBubble 
              type="heart" 
              count={localReacts} 
              onClick={(e) => { e.stopPropagation(); handleUpvote(); }} 
            />
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                color: 'text.secondary',
                '&:hover': { color: '#00695c' },
              }}
            >
              <Comment sx={{ fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {post.comments_count || 0} comentarios
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
