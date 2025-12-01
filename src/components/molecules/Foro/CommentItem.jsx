import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Reply,
  Verified,
  School,
} from '@mui/icons-material';
import CommentComposer from './CommentComposer';
import Timestamp from '../../atoms/Foro/Timestamp';
import { useReact } from '../../../hooks/Foro/useForoApi';

/**
 * Get role badge config based on user role
 */
const getRoleBadge = (role, isStudent = false, isTitled = false) => {
  if (isTitled) {
    return {
      icon: <Verified sx={{ fontSize: 12 }} />,
      label: 'Titulado',
      color: '#00695c',
      bgcolor: '#e0f2f1',
    };
  }
  
  if (isStudent) {
    return {
      icon: <School sx={{ fontSize: 12 }} />,
      label: 'Estudiante',
      color: '#1976d2',
      bgcolor: '#e3f2fd',
    };
  }
  
  const roleStr = String(role || '').toLowerCase();
  
  if (roleStr.includes('specialist') || roleStr.includes('especialista')) {
    return {
      icon: <Verified sx={{ fontSize: 12 }} />,
      label: 'Especialista',
      color: '#00695c',
      bgcolor: '#e0f2f1',
    };
  }
  
  if (roleStr.includes('business') || roleStr.includes('empresario')) {
    return {
      icon: <Verified sx={{ fontSize: 12 }} />,
      label: 'Empresario',
      color: '#1565c0',
      bgcolor: '#e3f2fd',
    };
  }
  
  return null;
};

/**
 * CommentItem - Renders a comment with role badge and nested replies
 */
export default function CommentItem({ comment, depth = 0 }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  const [likes, setLikes] = useState(comment.likes_count || 0);
  const [dislikes, setDislikes] = useState(comment.dislikes_count || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  
  const reactor = useReact();
  const author = comment.author || comment.user || {};
  const roleBadge = getRoleBadge(author.role, author.is_student, author.is_titled);

  function handleCreatedReply(newComment) {
    setReplies(prev => [newComment, ...prev]);
    setReplyOpen(false);
  }

  async function handleLike() {
    if (hasLiked) return;
    try {
      setLikes(l => l + 1);
      setHasLiked(true);
      if (hasDisliked) {
        setDislikes(d => Math.max(0, d - 1));
        setHasDisliked(false);
      }
      await reactor.mutateAsync({ type: 'like', content_type: 'comment', object_id: comment.id });
    } catch (e) {
      console.error('like failed', e);
      setLikes(l => Math.max(0, l - 1));
      setHasLiked(false);
    }
  }

  async function handleDislike() {
    if (hasDisliked) return;
    try {
      setDislikes(d => d + 1);
      setHasDisliked(true);
      if (hasLiked) {
        setLikes(l => Math.max(0, l - 1));
        setHasLiked(false);
      }
      await reactor.mutateAsync({ type: 'dislike', content_type: 'comment', object_id: comment.id });
    } catch (e) {
      console.error('dislike failed', e);
      setDislikes(d => Math.max(0, d - 1));
      setHasDisliked(false);
    }
  }

  const indent = Math.min(depth * 20, 60); // Max indent of 60px

  return (
    <Box sx={{ display: 'flex', gap: 1, mt: depth > 0 ? 1 : 1.5, ml: `${indent}px` }}>
      {/* Vertical connector line for nested comments */}
      {depth > 0 && (
        <Box 
          sx={{ 
            width: 2, 
            bgcolor: '#e0e0e0', 
            borderRadius: 1, 
            minHeight: 20,
            alignSelf: 'stretch',
            mr: 1,
          }} 
        />
      )}

      <Box sx={{ flex: 1 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 1.5, 
            bgcolor: depth > 0 ? '#fafafa' : '#f5f7fa', 
            border: '1px solid',
            borderColor: depth > 0 ? '#f0f0f0' : '#e8e8e8',
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Avatar 
              src={author.profile_picture || author.avatar}
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: '#00695c',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {author.full_name?.[0] || author.name?.[0] || '?'}
            </Avatar>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Author info */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {author.full_name || author.name || 'Usuario'}
                  </Typography>
                  
                  {roleBadge && (
                    <Chip
                      icon={roleBadge.icon}
                      label={roleBadge.label}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        bgcolor: roleBadge.bgcolor,
                        color: roleBadge.color,
                        '& .MuiChip-icon': { color: roleBadge.color },
                        '& .MuiChip-label': { px: 0.5 },
                      }}
                    />
                  )}
                </Stack>
                
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  <Timestamp iso={comment.created_at} />
                </Typography>
              </Box>

              {/* Content */}
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 0.5, 
                  fontSize: '0.875rem', 
                  lineHeight: 1.5,
                  color: 'text.primary',
                }}
              >
                {comment.content}
              </Typography>

              {/* Media */}
              {(() => {
                const media = Array.isArray(comment.media) ? comment.media[0] : comment.media;
                if (media && (media.url || media.path)) {
                  const src = media.url || media.path;
                  return (
                    <Box sx={{ mt: 1 }}>
                      <img 
                        src={src} 
                        alt="comment-media" 
                        style={{ maxWidth: 200, borderRadius: 8 }} 
                      />
                    </Box>
                  );
                }
                return null;
              })()}

              {/* Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton 
                    size="small" 
                    onClick={handleLike}
                    disabled={hasLiked}
                    sx={{ 
                      p: 0.5,
                      color: hasLiked ? '#00695c' : 'text.secondary',
                      '&:hover': { color: '#00695c' },
                    }}
                  >
                    <ThumbUp sx={{ fontSize: 16 }} />
                  </IconButton>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: hasLiked ? '#00695c' : 'text.secondary',
                      minWidth: 16,
                      fontWeight: hasLiked ? 600 : 400,
                    }}
                  >
                    {likes}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton 
                    size="small" 
                    onClick={handleDislike}
                    disabled={hasDisliked}
                    sx={{ 
                      p: 0.5,
                      color: hasDisliked ? '#d32f2f' : 'text.secondary',
                      '&:hover': { color: '#d32f2f' },
                    }}
                  >
                    <ThumbDown sx={{ fontSize: 16 }} />
                  </IconButton>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: hasDisliked ? '#d32f2f' : 'text.secondary',
                      minWidth: 16,
                      fontWeight: hasDisliked ? 600 : 400,
                    }}
                  >
                    {dislikes}
                  </Typography>
                </Box>

                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    ml: 1,
                    cursor: 'pointer',
                    color: replyOpen ? '#00695c' : 'text.secondary',
                    '&:hover': { color: '#00695c' },
                  }}
                  onClick={() => setReplyOpen(v => !v)}
                >
                  <Reply sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    Responder
                  </Typography>
                </Box>
              </Box>

              {/* Reply composer */}
              {replyOpen && (
                <Box sx={{ mt: 1.5 }}>
                  <CommentComposer 
                    postId={comment.post || comment.post_id} 
                    parentId={comment.id} 
                    onCreated={handleCreatedReply} 
                  />
                </Box>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Nested replies */}
        {replies && replies.length > 0 && (
          <Box>
            {replies.map(r => (
              <CommentItem key={r.id} comment={r} depth={depth + 1} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
