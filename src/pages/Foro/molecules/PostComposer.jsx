import React, { useState } from 'react';
import ImageUploader from '../atoms/ImageUploader';
import Button from '../atoms/Button';
import { validatePost } from '../utils/validators';
import { useCreatePost, useUploadMedia } from '../hooks/useForoApi';
import foroService from '../../../services/endpoints/foro';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';

/**
 * PostComposer: form to create a post (used for feed and for comments reply mode)
 */
export default function PostComposer({ onCreated, communityId = null }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaId, setMediaId] = useState(null);
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState(0);
  const create = useCreatePost();

  async function submit(e) {
    e.preventDefault();
    const v = validatePost({ title, content });
    if (Object.keys(v).length) return setErrors(v);
    try {
      // Build payload with only present fields and normalize types
      const payload = { title, content };
      if (mediaId !== null && mediaId !== undefined && mediaId !== '') {
        // mediaId may be a plain id, an array, or an object {id, url}
        let mid = mediaId;
        if (Array.isArray(mid)) mid = mid[0];
        if (typeof mid === 'object' && mid !== null) mid = mid.id || mid.media_id || mid[0];
        payload.media_id = Number(mid) || mid;
      }
      if (communityId !== null && communityId !== undefined && communityId !== '') {
        const cid = Array.isArray(communityId) ? communityId[0] : communityId;
        payload.community_id = Number(cid) || cid;
      }

      const res = await create.mutateAsync(payload);
      setTitle(''); setContent(''); setMediaId(null);
      // Prefer to forward the created object if available. If backend returns only minimal data,
      // fetch full post detail as fallback so feed can render media/author.
      let created = res;
      try {
        if (res && res.id && (!res.title || !res.author || !res.created_at)) {
          const full = await foroService.getPostDetail(res.id);
          if (full) created = full;
        }
      } catch (e) {
        // ignore fallback failure; use whatever we have
        console.debug('fallback getPostDetail failed', e);
      }
      if (onCreated) onCreated(created);
    } catch (err) {
      // Try to show server validation details when available
      const body = err && err.body;
      if (body && typeof body === 'object') {
        setErrors(body);
      } else {
        setErrors({ submit: 'Error al crear el post' });
      }
    }
  }

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }} component="form" onSubmit={submit}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Create post</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button variant="outline" size="sm">r/NoStupidQuestions</Button>
          </Box>
        </Box>
        <Box>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} textColor="primary" indicatorColor="primary">
            <Tab label="Text" />
            <Tab label="Images & Video" />
            <Tab label="Link" />
            <Tab label="Poll" />
          </Tabs>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          alignItems: 'start',
        }}
      >
        <Box sx={{ gridColumn: '1/-1' }}>
          <TextField
            placeholder="Title*"
            fullWidth
            value={title}
            onChange={e => setTitle(e.target.value)}
            InputProps={{ sx: { borderRadius: 6, bgcolor: '#fbfdff', px: 2 } }}
            variant="outlined"
            size="small"
          />
          {errors.title && <div style={{ color: 'red' }}>{errors.title}</div>}
        </Box>

        <Box sx={{ gridColumn: '1/-1' }}>
          <TextField
            placeholder="Body text (optional)"
            fullWidth
            multiline
            rows={6}
            value={content}
            onChange={e => setContent(e.target.value)}
            variant="outlined"
            InputProps={{ sx: { borderRadius: 2 } }}
          />
          {errors.content && <div style={{ color: 'red' }}>{errors.content}</div>}
        </Box>

        <Box sx={{ gridColumn: { xs: '1/-1', md: '1/2' } }}>
          <ImageUploader onUploaded={setMediaId} />
        </Box>

        <Box sx={{ gridColumn: { xs: '1/-1', md: '2/3' }, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outline">Save Draft</Button>
            <Button type="submit" disabled={create.isLoading}>
              {create.isLoading ? <CircularProgress size={18} /> : 'Post'}
            </Button>
          </Box>
        </Box>
      </Box>

      {errors.submit && <div style={{ color: 'red' }}>{errors.submit}</div>}
    </Paper>
  );
}
