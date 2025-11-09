import React from 'react';

function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function AudioTime({ seconds }) {
  return (
    <div style={{ minWidth: 42, textAlign: 'center', color: '#666', fontSize: 12 }}>{fmt(seconds)}</div>
  );
}
