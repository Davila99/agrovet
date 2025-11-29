import React from 'react';
import { IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

export default function AudioPlayButton({ playing, onToggle, size = 'small', sx = {} }) {
  return (
    <IconButton size={size} onClick={onToggle} aria-label={playing ? 'Pause audio' : 'Play audio'} sx={{ bgcolor: 'transparent', color: '#3a3a3a', ...sx }}>
      {playing ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
    </IconButton>
  );
}










