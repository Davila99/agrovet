import React from 'react';

export default function AudioPlayButton({ playing, onToggle, ariaLabel }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 34,
        height: 34,
        borderRadius: 18,
        border: 'none',
        background: playing ? '#3a3a3a' : 'rgba(0,0,0,0.06)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 150ms ease',
        boxShadow: playing ? '0 1px 3px rgba(0,0,0,0.18)' : 'none'
      }}
      aria-label={ariaLabel || (playing ? 'Pause' : 'Play')}
    >
      {playing ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffffff">
          <rect x="6" y="4" width="3" height="16" rx="1"/>
          <rect x="15" y="4" width="3" height="16" rx="1"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#3a3a3a">
          <path d="M8 5v14l11-7z"/>
        </svg>
      )}
    </button>
  );
}

