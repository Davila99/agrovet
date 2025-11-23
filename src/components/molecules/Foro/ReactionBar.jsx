import React from 'react';
import ReactionBubble from '../../atoms/Foro/ReactionBubble';

export default function ReactionBar({ reactions = {}, onReact = () => {} }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <ReactionBubble type="heart" count={reactions.heart || 0} onClick={() => onReact('heart')} />
      <ReactionBubble type="like" count={reactions.like || 0} onClick={() => onReact('like')} />
      <ReactionBubble type="dislike" count={reactions.dislike || 0} onClick={() => onReact('dislike')} />
    </div>
  );
}
