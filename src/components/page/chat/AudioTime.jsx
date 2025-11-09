import React from 'react';
import { Typography } from '@mui/material';

function fmt(s) {
  if (!s || Number.isNaN(Number(s))) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function AudioTime({ progress = 0, duration = 0, sx = {} }) {
  const elapsed = (duration || 0) * (progress || 0);
  return (
    <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 44, textAlign: 'center', fontSize: 12, ...sx }}>{fmt(elapsed)}</Typography>
  );
}
