import React from 'react';
import { useParams } from 'react-router-dom';
import PostDetail from '../organisms/PostDetail';

export default function PostPage() {
  const { id } = useParams();
  return (
    <div>
      <PostDetail postId={id} />
    </div>
  );
}
