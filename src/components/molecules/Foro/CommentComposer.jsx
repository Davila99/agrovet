import React, { useState } from 'react';
import Avatar from '../../atoms/Foro/Avatar';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import { useCreateComment } from '../../../hooks/Foro/useForoApi';

/**
 * CommentComposer: single-line composer with user avatar and green send button.
 * Props:
 * - postId: number
 * - parentId: number (optional)
 * - onCreated: function(newComment)
 */
export default function CommentComposer({ postId, parentId = null, onCreated }) {
  const [content, setContent] = useState('');
  const create = useCreateComment();

  async function submit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!content || !content.trim()) return;
    try {
      const payload = { post: postId, parent: parentId, content };
      const res = await create.mutateAsync(payload);
      setContent('');
      if (onCreated) onCreated(res);
    } catch (err) {
      console.error('Failed to create comment', err);
    }
  }

  return (
    <Box component="form" onSubmit={submit} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <Box sx={{ pt: 0.5 }}>
        <Avatar size="small" />
      </Box>
      <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          placeholder="Añadir un comentario..."
          fullWidth
          size="small"
          value={content}
          onChange={e => setContent(e.target.value)}
          inputProps={{ 'aria-label': 'Comentario' }}
          variant="outlined"
          InputProps={{
            sx: {
              borderRadius: 6,
              bgcolor: 'background.paper',
              px: 1.5,
            }
          }}
        />
        {content && content.trim() ? (
          <IconButton type="submit" color="success" aria-label="Enviar comentario" sx={{ p: 0.5 }}>
            <SendIcon />
          </IconButton>
        ) : null}
      </Box>
    </Box>
  );
}
