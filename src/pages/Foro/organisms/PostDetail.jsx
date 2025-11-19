import React, { useState, useEffect } from 'react';
import { usePost } from '../hooks/useForoApi';
import CommentItem from '../molecules/CommentItem';
import PostCard from '../molecules/PostCard';
import CommentComposer from '../molecules/CommentComposer';
import Box from '@mui/material/Box';

export default function PostDetail({ postId }) {
  const { data, isLoading, error } = usePost(postId);
  // Ensure hooks order is stable: always declare local state/effects
  const [comments, setComments] = useState(() => (data && data.comments) ? data.comments : []);

  useEffect(() => {
    setComments((data && data.comments) ? data.comments : []);
  }, [data]);

  const post = data;
  if (!post) return <div style={{ padding: 16 }}>Publicación no encontrada.</div>;

  function handleCreatedComment(newComment) {
    // insert new comment at top so it's visible immediately
    setComments(prev => [newComment, ...prev]);
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 0 }, mt: { xs: 2, md: 4 } }}>
      {/* Show the post as a card at the top with extra spacing */}
      <Box sx={{ mt: 2 }}>
        <PostCard post={post} />
      </Box>

      {/* Comments section: composer first (below post card), then comments list */}
      <section style={{ marginTop: 20 }}>
        <h2>Comentarios</h2>

        <div style={{ marginTop: 12 }}>
          <CommentComposer postId={post.id} onCreated={handleCreatedComment} />
        </div>

        <div style={{ marginTop: 16 }}>
          {comments.length ? comments.map(c => <CommentItem key={c.id} comment={c} />) : <div style={{ color: '#666' }}>Sé el primero en comentar</div>}
        </div>
      </section>
    </Box>
  );
}
