import React, { useState } from 'react';
import Avatar from '../../atoms/Foro/Avatar';
import Timestamp from '../../atoms/Foro/Timestamp';
import ReactionBubble from '../../atoms/Foro/ReactionBubble';
import CommentComposer from './CommentComposer';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ReplyIcon from '@mui/icons-material/Reply';
import Typography from '@mui/material/Typography';
import { useReact } from '../../../hooks/Foro/useForoApi';

/**
 * CommentItem renders a comment and its replies recursively.
 * Supports `depth` prop for nested indentation.
 */
export default function CommentItem({ comment, depth = 0 }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  const [likes, setLikes] = useState(comment.likes_count || 0);
  const [dislikes, setDislikes] = useState(comment.dislikes_count || 0);
  const reactor = useReact();
  const author = comment.author || comment.user || {};

  function handleCreatedReply(newComment) {
    // append reply locally
    setReplies(prev => [newComment, ...prev]);
    setReplyOpen(false);
  }

  async function handleLike() {
    try {
      setLikes(l => l + 1);
      await reactor.mutateAsync({ type: 'like', content_type: 'comment', object_id: comment.id });
    } catch (e) {
      console.error('like failed', e);
      setLikes(l => Math.max(0, l - 1));
    }
  }

  async function handleDislike() {
    try {
      setDislikes(d => d + 1);
      await reactor.mutateAsync({ type: 'dislike', content_type: 'comment', object_id: comment.id });
    } catch (e) {
      console.error('dislike failed', e);
      setDislikes(d => Math.max(0, d - 1));
    }
  }

  const indent = depth * 16;

  return (
    <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
      {/* Gutter: shows vertical connector for threaded replies */}
      <Box sx={{ width: indent || 8, display: 'flex', justifyContent: 'center' }}>
        {depth > 0 ? (
          <Box sx={{ width: 2, bgcolor: '#cfd6df', borderRadius: 1, height: '100%' }} />
        ) : (
          <Box sx={{ width: 8 }} />
        )}
      </Box>

      <Box sx={{ flex: 1 }}>
        <Paper elevation={0} sx={{ p: 1, bgcolor: '#f3f4f6', border: '1px solid #cfd6df', borderRadius: 8 }} role="article">
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Box sx={{ pt: 0.5 }}>
              <Avatar user={author} size="small" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13 }}>{author?.name || author?.full_name || 'Usuario'}</Typography>
                <Timestamp iso={comment.created_at} sx={{ fontSize: 12 }} />
              </Box>

              <Box sx={{ mt: 0.5 }}>
                <Typography variant="body2" sx={{ fontSize: 13, lineHeight: 1.35 }}>{comment.content}</Typography>
                {(() => {
                  const media = Array.isArray(comment.media) ? comment.media[0] : comment.media;
                  if (media && (media.url || media.path)) {
                    const src = media.url || media.path || media;
                    return <img src={src} alt="comment-media" style={{ maxWidth: 160, marginTop: 8, borderRadius: 6 }} />;
                  }
                  return null;
                })()}
              </Box>

              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mt: 0.75 }}>
                <IconButton size="small" onClick={handleLike} aria-label="Me gusta" sx={{ p: 0.5 }}>
                  <ThumbUpIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{likes}</Typography>

                <IconButton size="small" onClick={handleDislike} aria-label="No me gusta" sx={{ p: 0.5, ml: 1 }}>
                  <ThumbDownIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{dislikes}</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <IconButton size="small" onClick={() => setReplyOpen(v => !v)} aria-label="Responder" sx={{ p: 0.5 }}>
                    <ReplyIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ color: '#1976d2', cursor: 'pointer', fontSize: 13 }} onClick={() => setReplyOpen(v => !v)}>Responder</Typography>
                </Box>
              </Box>

              {replyOpen && (
                <Box sx={{ mt: 1 }}>
                  <CommentComposer postId={comment.post} parentId={comment.id} onCreated={handleCreatedReply} />
                </Box>
              )}
            </Box>
          </Box>
        </Paper>

        {replies && replies.map(r => <CommentItem key={r.id} comment={r} depth={depth + 1} />)}
      </Box>
    </Box>
  );
}
