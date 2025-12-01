import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostList from '../../organisms/Foro/PostList';
import PostComposer from '../../molecules/Foro/PostComposer';
import SidebarCommunities from '../../organisms/Foro/SidebarCommunities';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import useAuth from '../../../hooks/Foro/useAuth';
import { autoJoinCommunitiesByRole } from '../../../utils/Foro/autoJoinCommunities';

/**
 * FeedPage - Página principal del foro
 * Layout: Posts a la izquierda, Comunidades a la derecha
 */
export default function FeedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openComposer, setOpenComposer] = useState(false);
  const [extraPosts, setExtraPosts] = useState([]);

  // Auto-join communities based on role when user loads
  useEffect(() => {
    if (user?.role) {
      autoJoinCommunitiesByRole(user.role, user.profession);
    }
  }, [user?.role, user?.profession]);

  function handleNewPost(post) {
    if (!post) return;
    setExtraPosts(prev => [post, ...prev]);
    setOpenComposer(false);
  }

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', pt: 3, pb: 6 }}>
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: 'grid', 
            gap: 3, 
            gridTemplateColumns: { xs: '1fr', md: '1fr 320px' } 
          }}
        >
          {/* Main content - Posts */}
          <Box>
            {/* Create post card */}
            <Paper 
              elevation={0}
              onClick={() => setOpenComposer(true)}
              sx={{ 
                p: 2, 
                mb: 3, 
                borderRadius: 3,
                cursor: 'pointer',
                bgcolor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderColor: 'primary.main',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  src={user?.profile_picture} 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    bgcolor: '#00695c',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                  }}
                >
                  {user?.full_name?.[0] || user?.name?.[0] || '?'}
                </Avatar>
                <Box 
                  sx={{ 
                    flex: 1, 
                    py: 1.5, 
                    px: 2, 
                    borderRadius: 6, 
                    bgcolor: '#f0f2f5',
                    color: 'text.secondary',
                    fontSize: '0.95rem',
                  }}
                >
                  ¿Qué quieres compartir hoy?
                </Box>
              </Box>
            </Paper>

            {/* Posts list */}
            <PostList extraPosts={extraPosts} orderBy="relevance" />
          </Box>

          {/* Right sidebar - Communities only */}
          <Box sx={{ position: { md: 'sticky' }, top: { md: 80 }, alignSelf: 'start' }}>
            <SidebarCommunities userRole={user?.role} />
          </Box>
        </Box>
      </Container>

      {/* Create post dialog */}
      <Dialog 
        open={openComposer} 
        onClose={() => setOpenComposer(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: 3,
            maxHeight: '90vh',
          } 
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          <PostComposer onCreated={handleNewPost} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
