import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Reaction bubble with simple pop animation.
 */
export default function ReactionBubble({ type = 'heart', count = 0, onClick }) {
  const emoji = type === 'heart' ? '❤️' : type === 'like' ? '👍' : '👎';
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      aria-label={`React ${type}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
    >
      <motion.span layout>{emoji}</motion.span>
      <motion.span layout>{count}</motion.span>
    </motion.button>
  );
}

ReactionBubble.propTypes = { type: PropTypes.string, count: PropTypes.number, onClick: PropTypes.func };
