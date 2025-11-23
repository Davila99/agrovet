import React from 'react';
import CommentItem from '../../molecules/Foro/CommentItem';

export default function CommentThread({ comments = [] }) {
  return (
    <div>
      {comments.map(c => <CommentItem key={c.id} comment={c} />)}
    </div>
  );
}
