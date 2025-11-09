import React from 'react';
import { IconButton } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

export default function SendButton({ onClick, disabled }) {
  return (
    <IconButton onClick={onClick} sx={{ bgcolor: '#2AABEE', color: '#fff', '&:hover': { bgcolor: '#1a94d9' } }} disabled={!!disabled}>
      <SendRoundedIcon />
    </IconButton>
  );
}
