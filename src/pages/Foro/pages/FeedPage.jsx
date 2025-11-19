import React, { useState } from 'react';
import PostList from '../organisms/PostList';
import PostComposer from '../molecules/PostComposer';
import SidebarCommunities from '../organisms/SidebarCommunities';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';

export default function FeedPage() {
  const [openComposer, setOpenComposer] = useState(false);
  const [extraPosts, setExtraPosts] = useState([]);

  function handleNewPost(post) {
    if (!post) return;
    setExtraPosts(prev => [post, ...prev]);
    setOpenComposer(false);
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' } }}>
        <Box>
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }} onClick={() => setOpenComposer(true)}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#e6eefb' }} />
              <Button variant="text" onClick={() => setOpenComposer(true)}>Create post</Button>
            </Box>
          </Paper>

          <PostList extraPosts={extraPosts} />
        </Box>
        <Box>
          <SidebarCommunities />
        </Box>
      </Box>

      <Dialog open={openComposer} onClose={() => setOpenComposer(false)} maxWidth="md" fullWidth>
        <PostComposer onCreated={handleNewPost} />
      </Dialog>
    </Container>
  );
}
