import React, { useState, useEffect } from 'react';
import { usePosts } from '../../../hooks/Foro/useForoApi';
import PostCard from '../../molecules/Foro/PostCard';
import { Box, ToggleButton, ToggleButtonGroup, Typography, Paper, Chip, Stack } from '@mui/material';
import { TrendingUp, AccessTime, Whatshot } from '@mui/icons-material';

/**
 * PostList organism: fetches posts and renders a list with sorting options.
 * Supports sorting by: relevance (likes + comments), date, and trending
 */
export default function PostList({ params, extraPosts = [], orderBy = 'relevance' }) {
  const { data, isLoading, error } = usePosts(params);
  const initial = data?.results || data || [];
  const [posts, setPosts] = useState(initial || []);
  const [sortBy, setSortBy] = useState(orderBy);

  // Calculate relevance score for a post
  const getRelevanceScore = (post) => {
    const likes = post.reactions_count || post.likes_count || 0;
    const comments = post.comments_count || 0;
    const views = post.views_count || 0;
    
    // Weighted score: likes are most important, then comments, then views
    return (likes * 3) + (comments * 2) + (views * 0.1);
  };

  // Merge server results and extraPosts
  useEffect(() => {
    // Use stable keys as dependencies to avoid re-running on new array references
    const server = Array.isArray(initial) ? initial : [];
    const extras = Array.isArray(extraPosts) ? extraPosts.filter(Boolean) : [];

    const serverIds = new Set(server.map(p => p && p.id).filter(Boolean));
    const uniqueExtras = extras.filter(p => p && p.id && !serverIds.has(p.id));
    const merged = [...uniqueExtras, ...server];

    // Sort posts based on selected criteria
    const sorted = [...merged].sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return getRelevanceScore(b) - getRelevanceScore(a);

        case 'trending':
          const aScore = getRelevanceScore(a);
          const bScore = getRelevanceScore(b);
          const aAge = (Date.now() - new Date(a.created_at || 0).getTime()) / 3600000; // hours
          const bAge = (Date.now() - new Date(b.created_at || 0).getTime()) / 3600000;
          const aDecay = Math.max(0.1, 1 - (aAge / 168));
          const bDecay = Math.max(0.1, 1 - (bAge / 168));
          return (bScore * bDecay) - (aScore * aDecay);

        case 'date':
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

    setPosts(sorted);
    // dependencies: sortBy plus stable keys derived from the arrays (ids)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sortBy,
    // server ids key
    (initial && Array.isArray(initial) ? initial.map(p => p && p.id).join(',') : ''),
    // extras ids key
    (extraPosts && Array.isArray(extraPosts) ? extraPosts.map(p => p && p.id).join(',') : ''),
  ]);

  const handleSortChange = (event, newSort) => {
    if (newSort !== null) {
      setSortBy(newSort);
    }
  };

  const sortOptions = [
    { value: 'relevance', label: 'Relevantes', icon: <TrendingUp sx={{ fontSize: 16 }} /> },
    { value: 'date', label: 'Recientes', icon: <AccessTime sx={{ fontSize: 16 }} /> },
    { value: 'trending', label: 'Tendencia', icon: <Whatshot sx={{ fontSize: 16 }} /> },
  ];

  if (isLoading) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          textAlign: 'center', 
          borderRadius: 3,
          bgcolor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Cargando publicaciones...
        </Typography>
      </Paper>
    );
  }
  
  if (error) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          textAlign: 'center', 
          borderRadius: 3,
          bgcolor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Typography variant="body2" color="error">
          Error cargando publicaciones. {error.message || 'Verifica que el servicio de foro esté disponible.'}
        </Typography>
      </Paper>
    );
  }

  function handleDeleted(id) {
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  return (
    <Box>
      {/* Sort controls */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: 3,
          bgcolor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mr: 1 }}>
            Ordenar:
          </Typography>
          {sortOptions.map((option) => (
            <Chip
              key={option.value}
              icon={option.icon}
              label={option.label}
              onClick={() => setSortBy(option.value)}
              variant={sortBy === option.value ? 'filled' : 'outlined'}
              size="small"
              sx={{
                cursor: 'pointer',
                fontWeight: sortBy === option.value ? 600 : 400,
                bgcolor: sortBy === option.value ? '#00695c' : 'transparent',
                color: sortBy === option.value ? 'white' : 'text.secondary',
                borderColor: sortBy === option.value ? '#00695c' : 'rgba(0,0,0,0.2)',
                '&:hover': {
                  bgcolor: sortBy === option.value ? '#00796b' : 'rgba(0,0,0,0.04)',
                },
                '& .MuiChip-icon': {
                  color: sortBy === option.value ? 'white' : 'text.secondary',
                },
              }}
            />
          ))}
        </Stack>
      </Paper>

      {/* Posts list */}
      {posts.length === 0 ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 3,
            bgcolor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            No hay publicaciones aún
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sé el primero en publicar algo interesante
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {posts.map(p => <PostCard key={p.id} post={p} onDeleted={handleDeleted} />)}
        </Stack>
      )}
    </Box>
  );
}
