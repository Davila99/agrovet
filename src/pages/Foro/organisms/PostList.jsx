import React, { useState, useEffect } from 'react';
import { usePosts } from '../hooks/useForoApi';
import PostCard from '../molecules/PostCard';
import { samplePosts } from '../mocks/samplePosts';

/**
 * PostList organism: fetches posts and renders a list. Falls back to samplePosts mock.
 */
export default function PostList({ params, extraPosts = [] }) {
  const { data, isLoading, error } = usePosts(params);
  const initial = data?.results || data || samplePosts;
  const [posts, setPosts] = useState(initial || []);

  // Merge server results (`initial`) and `extraPosts` (newly created) in a single effect.
  // This prevents the async arrival of server results from overwriting newly-prepended posts.
  useEffect(() => {
    const server = initial || [];
    const extras = Array.isArray(extraPosts) ? extraPosts.filter(Boolean) : [];

    // Build map of server ids for quick dedupe
    const serverIds = new Set(server.map(p => p && p.id));

    // Keep only extras that are not already present on server results
    const uniqueExtras = extras.filter(p => p && !serverIds.has(p.id));

    // Final list: unique extras first, then server results
    setPosts([...uniqueExtras, ...server]);
  }, [JSON.stringify(initial), JSON.stringify(extraPosts)]);

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error cargando posts. Usando mocks.</div>;

  function handleDeleted(id) {
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div>
      {posts.map(p => <PostCard key={p.id} post={p} onDeleted={handleDeleted} />)}
    </div>
  );
}
