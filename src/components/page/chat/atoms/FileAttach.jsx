import React from 'react';
import { IconButton } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';

export default function FileAttach({ onAttach, accept = 'image/*,audio/*,video/*' }) {
  const fileRef = React.useRef(null);
  const onFileClick = () => fileRef.current && fileRef.current.click();

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f && onAttach) {
      const previewUrl = URL.createObjectURL(f);
      onAttach({ file: f, previewUrl, spectrum: null });
    }
    e.target.value = null;
  };

  return (
    <>
      <input ref={fileRef} type="file" accept={accept} style={{ display: 'none' }} onChange={handleFileChange} />
      <IconButton onClick={onFileClick} sx={{ bgcolor: '#E8F6FF', mr: 1 }}>
        <ImageIcon sx={{ color: '#2AABEE' }} />
      </IconButton>
    </>
  );
}
