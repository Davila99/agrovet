import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePost } from '../../../hooks/Foro/useForoApi';
import CommentItem from '../../molecules/Foro/CommentItem';
import CommentComposer from '../../molecules/Foro/CommentComposer';
import { 
  Box, 
  Paper, 
  Typography, 
  Avatar, 
  IconButton, 
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  ArrowBack,
  ArrowUpward,
  ArrowDownward,
  Verified,
  School,
  Comment as CommentIcon,
} from '@mui/icons-material';
import Timestamp from '../../atoms/Foro/Timestamp';
import ReactionBubble from '../../atoms/Foro/ReactionBubble';
import useAuth from '../../../hooks/Foro/useAuth';
import { useReact } from '../../../hooks/Foro/useForoApi';

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
  
  return null;
};

/**
 * PostDetail - Full post view with comments
 */
export default function PostDetail({ postId }) {
  const navigate = useNavigate();
  const { data, isLoading, error } = usePost(postId);
  const { user } = useAuth();
  const reactor = useReact();
  
  const [comments, setComments] = useState([]);
  const [localReacts, setLocalReacts] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  const post = data;
  const author = post?.author || {};
  const roleBadge = getRoleBadge(author.role, author.is_student, author.is_titled);

  // Update comments when post data loads
  useEffect(() => {
    if (post?.comments) {
      // Sort comments by relevance (likes + replies)
      const sorted = [...post.comments].sort((a, b) => {
        const aScore = (a.likes_count || 0) * 2 + (a.replies_count || 0);
        const bScore = (b.likes_count || 0) * 2 + (b.replies_count || 0);
        return bScore - aScore;
      });
      setComments(sorted);
    }
    if (post?.reactions_count !== undefined) {
      setLocalReacts(post.reactions_count || post.likes_count || 0);
    }
  }, [post]);

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

  function handleCreatedComment(newComment) {
    setComments(prev => [newComment, ...prev]);
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#00695c' }} />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', px: 2, py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Publicación no encontrada
        </Typography>
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
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: 3 }}>
      <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 3 } }}>
        {/* Back button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/foro')}
          sx={{ 
            mb: 2, 
            borderRadius: 2,
            color: 'text.secondary',
            '&:hover': { color: '#00695c' },
          }}
        >
          Volver
        </Button>

        {/* Post card */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
          {/* Vote column */}
          <Box 
            sx={{ 
              width: 48, 
              display: { xs: 'none', sm: 'flex' }, 
              flexDirection: 'column', 
              alignItems: 'center', 
              mr: 2,
              pt: 2,
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
                '&:hover': { bgcolor: '#e0f2f1' }, 
              }}
            >
              <ArrowUpward fontSize="small" />
            </IconButton>
            <Typography sx={{ fontWeight: 700, my: 0.5, color: localReacts > 0 ? '#00695c' : 'text.secondary' }}>
              {localReacts}
            </Typography>
            <IconButton size="small" sx={{ borderRadius: 2, color: 'text.secondary' }}>
              <ArrowDownward fontSize="small" />
            </IconButton>
          </Box>

          {/* Main post */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: '#ffffff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            {/* Header */}
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Avatar 
                  src={author.profile_picture || author.avatar}
                  sx={{ width: 48, height: 48, bgcolor: '#00695c', fontWeight: 600 }}
                >
                  {author.full_name?.[0] || author.name?.[0] || '?'}
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {author.full_name || author.name || 'Usuario'}
                    </Typography>
                    
                    {roleBadge && (
                      <Chip
                        icon={roleBadge.icon}
                        label={roleBadge.label}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          bgcolor: roleBadge.bgcolor,
                          color: roleBadge.color,
                          '& .MuiChip-icon': { color: roleBadge.color },
                        }}
                      />
                    )}
                    
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      / {post.community?.name || 'General'}
                    </Typography>
                  </Stack>
                  
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    <Timestamp iso={post.created_at} />
                  </Typography>
                </Box>
              </Box>

              {/* Title */}
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>
                {post.title}
              </Typography>
              
              {/* Content */}
              {post.content && (
                <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.primary', mb: 2 }}>
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
                      <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden', bgcolor: '#000' }}>
                        <video src={src} controls style={{ width: '100%', maxHeight: 500 }} />
                      </Box>
                    );
                  }
                  
                  return (
                    <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
                      <img src={src} alt="media" style={{ width: '100%', maxHeight: 500, objectFit: 'contain' }} />
                    </Box>
                  );
                }
                return null;
              })()}

              {/* Footer */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <ReactionBubble type="heart" count={localReacts} onClick={handleUpvote} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <CommentIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2">{comments.length} comentarios</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Comments section */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            bgcolor: '#ffffff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>
              Comentarios
            </Typography>

            {/* Comment composer */}
            <Box sx={{ mb: 3 }}>
              <CommentComposer postId={post.id} onCreated={handleCreatedComment} />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Comments list */}
            {comments.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Sé el primero en comentar
                </Typography>
              </Box>
            ) : (
              <Stack spacing={0}>
                {comments.map(c => (
                  <CommentItem key={c.id} comment={c} />
                ))}
              </Stack>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
