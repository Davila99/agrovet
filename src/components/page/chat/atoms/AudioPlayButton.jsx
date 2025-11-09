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
        <svg width="14" height="14" viewBox="0 0 24 24"><rect x="6" y="4" width="3" height="16" fill="#ffffff" rx="1"/><rect x="15" y="4" width="3" height="16" fill="#ffffff" rx="1"/></svg>
      ) : (
        <span style={{ fontSize: 16, lineHeight: 1, color: '#3a3a3a', display: 'inline-block', transform: 'translateY(-1px)' }} aria-hidden>
          ▶️
        </span>
      )}
    </button>
  );
}
