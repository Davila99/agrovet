import React, { useState } from 'react';
import { useCommunities } from '../hooks/useForoApi';
import PostList from './PostList';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import PostComposer from '../molecules/PostComposer';
import ImageUploader from '../atoms/ImageUploader';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import foroService from '../../../services/endpoints/foro';
import SidebarCommunities from './SidebarCommunities';

export default function CommunityView({ communityId }) {
  const { data } = useCommunities();
  const comm = (data || []).find(c => c.id === Number(communityId));
  const [openComposer, setOpenComposer] = useState(false);
  const [createdPosts, setCreatedPosts] = useState([]);
  const [editingCover, setEditingCover] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  return (
    <div>
      <header style={{ marginBottom: 12 }}>
        {/* Center the cover to match feed width */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              maxWidth: 1100,
              width: '100%',
              height: 160,
              borderRadius: 2,
              mb: 2,
              display: 'flex',
              alignItems: 'flex-end',
              p: 2,
              position: 'relative',
              backgroundColor: comm?.cover_image ? 'transparent' : '#e6f7ff',
              backgroundImage: comm?.cover_image ? `url(${comm.cover_image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: comm?.cover_image ? '#fff' : 'inherit'
            }}
          >
            {/* Edit cover pencil top-right (relative to centered box) */}
            <Tooltip title="Editar portada">
              <IconButton
                onClick={() => { setEditingCover(true); document.activeElement && document.activeElement.blur(); }}
                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }, borderRadius: '999px' }}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => { setEditingAvatar(true); document.activeElement && document.activeElement.blur(); }} sx={{ p: 0 }} aria-label="Editar avatar">
                <Avatar src={comm?.avatar || ''} alt={comm?.name} sx={{ width: 96, height: 96, border: '4px solid rgba(255,255,255,0.85)', cursor: 'pointer' }} />
              </IconButton>
              <Box>
                <h1 style={{ margin: 0 }}>{comm?.name}</h1>
                <div style={{ opacity: 0.85 }}>{comm?.short_description}</div>
                <div style={{ marginTop: 8 }}>Miembros: {comm?.members_count || 0}</div>
              </Box>
              <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                <Button
                  variant="outlined"
                  onClick={() => { setEditingAvatar(true); document.activeElement && document.activeElement.blur(); }}
                  sx={{ borderRadius: '999px' }}
                >Editar foto</Button>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Centered action row */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ maxWidth: 1100, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button variant="text" onClick={() => { setEditingCover(true); document.activeElement && document.activeElement.blur(); }} sx={{ borderRadius: '999px' }}>Editar portada</Button>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => { setOpenComposer(true); document.activeElement && document.activeElement.blur(); }}
                sx={{ borderRadius: '999px', px: 4, py: 1.5 }}
              >
                + Crear publicación
              </Button>
            </Box>
          </Box>
        </Box>
      </header>

      {/* Centered container with two columns: main + right sidebar */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 320px' }, gap: 3, px: 2 }}>
        <Box>
          <PostList params={{ community: communityId }} extraPosts={createdPosts} />
        </Box>
        <Box>
          {/* Right sidebar: communities and info */}
          <div style={{ position: 'sticky', top: 96 }}>
            {/* Lazy-load sidebar component to avoid circular imports */}
            <React.Suspense fallback={<div>Loading sidebar...</div>}>
              <SidebarCommunities />
            </React.Suspense>
          </div>
        </Box>
      </Box>

      <Dialog open={openComposer} onClose={() => setOpenComposer(false)} fullWidth maxWidth="md">
        <Box sx={{ p: 2 }}>
          <PostComposer communityId={communityId} onCreated={() => setOpenComposer(false)} />
        </Box>
      </Dialog>

      <Dialog open={editingCover} onClose={() => setEditingCover(false)} fullWidth>
        <DialogTitle>Editar portada</DialogTitle>
        <DialogContent>
          <ImageUploader returnFile onUploaded={async (file) => {
            if (!file) return;
            const form = new FormData();
            form.append('file', file);
            await foroService.uploadCommunityCover(communityId, form);
            window.location.reload();
          }} />
        </DialogContent>
      </Dialog>

      <Dialog open={editingAvatar} onClose={() => setEditingAvatar(false)} fullWidth>
        <DialogTitle>Editar avatar</DialogTitle>
        <DialogContent>
          <ImageUploader returnFile onUploaded={async (file) => {
            if (!file) return;
            const form = new FormData();
            form.append('file', file);
            await foroService.uploadCommunityAvatar(communityId, form);
            window.location.reload();
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
