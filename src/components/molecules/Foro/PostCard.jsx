import React from 'react';
import Avatar from '../../atoms/Foro/Avatar';
import Timestamp from '../../atoms/Foro/Timestamp';
import ReactionBubble from '../../atoms/Foro/ReactionBubble';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Typography, Paper } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import useAuth from '../../../hooks/Foro/useAuth';
import { useDeletePost, useReact } from '../../../hooks/Foro/useForoApi';
import { confirm } from '../../../utils/Foro/confirm';
import { useState } from 'react';

/**
 * Redesigned PostCard: Reddit-like layout with vote column on left
 */
export default function PostCard({ post, onDeleted }) {
  const nav = useNavigate();
  const { user } = useAuth();
  const deleter = useDeletePost();
  const reactor = useReact();
  const [localReacts, setLocalReacts] = useState(post.reactions_count || 0);

  const isOwner = user && post.author && user.id === post.author.id;

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

  async function handleReact() {
    try {
      // optimistic update
      setLocalReacts(r => r + 1);
      await reactor.mutateAsync({ type: 'heart', content_type: 'post', object_id: post.id });
    } catch (e) {
      console.error('react failed', e);
      setLocalReacts(r => Math.max(0, r - 1));
    }
  }

  return (
    <Box sx={{ display: 'flex', mb: 2, alignItems: 'flex-start' }}>
      {/* Vote column */}
      <Box sx={{ width: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
        <IconButton size="small" aria-label="vote up" sx={{ borderRadius: 2, bgcolor: 'transparent', '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-2px)' }, transition: 'transform 160ms ease' }}>
          <ArrowUpwardIcon fontSize="small" />
        </IconButton>
        <Typography sx={{ fontWeight: 700, mt: 1 }}>{post.score ?? post.reactions_count ?? 0}</Typography>
        <IconButton size="small" aria-label="vote down" sx={{ borderRadius: 2, bgcolor: 'transparent', '&:hover': { bgcolor: 'action.hover', transform: 'translateY(2px)' }, transition: 'transform 160ms ease' }}>
          <ArrowDownwardIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Main card */}
      <Paper
        elevation={2}
        tabIndex={0}
        role="article"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nav(`/foro/post/${post.id}`); } }}
        sx={{
          flex: 1,
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: '#e6e9ef',
          bgcolor: '#ffffff',
          boxShadow: '0 6px 18px rgba(2,6,23,0.06)',
          transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 180ms ease',
          '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 24px 60px rgba(2,6,23,0.12)', borderColor: '#cfcfcf' },
          '&:focus-visible': { outline: '3px solid rgba(25,118,210,0.12)', outlineOffset: '4px' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2 }}>
          <Avatar user={post.author} size="medium" />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{post.author?.name || 'Usuario'}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>/ {post.community?.name || 'general'}</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}><Timestamp iso={post.created_at} /></Typography>
          </Box>
          {isOwner && (
            <IconButton onClick={handleDelete} aria-label="delete post" size="small" sx={{ color: 'text.secondary' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Box sx={{ p: 2, pt: 0 }}>
          <Typography variant="h6" component="h3" sx={{ mb: 1 }}>{post.title}</Typography>
          {post.content && (
            <Typography variant="body2" sx={{ color: 'text.primary', mb: 1 }}>{post.content}</Typography>
          )}

          {(() => {
            const media = Array.isArray(post.media) ? post.media[0] : post.media;
            if (media && (media.url || media.path)) {
              const src = media.url || media.path || media;
              return (
                <Box sx={{ mt: 1 }}>
                  <img src={src} alt="media" style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 8 }} />
                </Box>
              );
            }
            return null;
          })()}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <ReactionBubble type="heart" count={localReacts} onClick={handleReact} />
            <Typography variant="body2" sx={{ color: 'text.secondary', cursor: 'pointer' }} onClick={() => nav(`/foro/post/${post.id}`)}>
              Comentarios ({post.comments_count || 0})
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
