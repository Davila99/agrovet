import React, { useState, useEffect } from 'react';
import { usePosts } from '../../../hooks/Foro/useForoApi';
import PostCard from '../../molecules/Foro/PostCard';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';

/**
 * PostList organism: fetches posts and renders a list with sorting options.
 * Supports sorting by date (newest first) and by reactions (most popular first).
 */
export default function PostList({ params, extraPosts = [] }) {
  const { data, isLoading, error } = usePosts(params);
  const initial = data?.results || data || [];
  const [posts, setPosts] = useState(initial || []);
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'reactions'

  // Merge server results (`initial`) and `extraPosts` (newly created) in a single effect.
  // This prevents the async arrival of server results from overwriting newly-prepended posts.
  useEffect(() => {
    const server = Array.isArray(initial) ? initial : [];
    const extras = Array.isArray(extraPosts) ? extraPosts.filter(Boolean) : [];

    // Build map of server ids for quick dedupe
    const serverIds = new Set(server.map(p => p && p.id).filter(Boolean));

    // Keep only extras that are not already present on server results
    const uniqueExtras = extras.filter(p => p && p.id && !serverIds.has(p.id));

    // Final list: unique extras first, then server results
    const merged = [...uniqueExtras, ...server];
    
    // Sort posts based on selected criteria
    const sorted = [...merged].sort((a, b) => {
      if (sortBy === 'reactions') {
        // Sort by reactions count (descending)
        const aReactions = a.reactions_count || 0;
        const bReactions = b.reactions_count || 0;
        if (bReactions !== aReactions) {
          return bReactions - aReactions;
        }
        // If reactions are equal, sort by date as tiebreaker
      }
      // Sort by date (newest first)
      const aDate = new Date(a.created_at || 0).getTime();
      const bDate = new Date(b.created_at || 0).getTime();
      return bDate - aDate;
    });
    
    setPosts(sorted);
  }, [initial, extraPosts, sortBy]);

  if (isLoading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Cargando publicaciones...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="error">
          Error cargando publicaciones. {error.message || 'Verifica que el servicio de foro esté disponible.'}
        </Typography>
      </Box>
    );
  }

  function handleDeleted(id) {
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  const handleSortChange = (event, newSort) => {
    if (newSort !== null) {
      setSortBy(newSort);
    }
  };

  return (
    <Box>
      {/* Sort controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <SortIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
          Ordenar por:
        </Typography>
        <ToggleButtonGroup
          value={sortBy}
          exclusive
          onChange={handleSortChange}
          size="small"
          sx={{ height: 32 }}
        >
          <ToggleButton value="date" aria-label="ordenar por fecha">
            Fecha
          </ToggleButton>
          <ToggleButton value="reactions" aria-label="ordenar por reacciones">
            Reacciones
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Posts list */}
      {posts.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No hay publicaciones aún. Sé el primero en publicar.
          </Typography>
        </Box>
      ) : (
        posts.map(p => <PostCard key={p.id} post={p} onDeleted={handleDeleted} />)
      )}
    </Box>
  );
}
