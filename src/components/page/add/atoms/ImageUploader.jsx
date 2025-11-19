import React, { useRef, useState } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

/**
 * Simple Image uploader that uses the existing httpClient upload endpoints outside
 * of this module (frontend will upload to Supabase via media API). This component
 * emits an array of File objects or a single File depending on maxCount.
 */
export default function ImageUploader({ label, maxCount = 1, onUpload, showPreview = true }) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const f = Array.from(e.target.files || []);
    const next = maxCount === 1 ? f.slice(0,1) : f.slice(0, maxCount);
    setFiles(next);
    if (onUpload) onUpload(maxCount === 1 ? next[0] : next);
  };

  return (
    <Box sx={{ my: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
      <Grid container spacing={1} alignItems="center">
        <Grid>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={maxCount > 1}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <IconButton color="primary" onClick={() => inputRef.current && inputRef.current.click()}>
            <PhotoCamera />
          </IconButton>
        </Grid>
        <Grid xs>
          {showPreview && (
            <Box sx={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {files.map((f, i) => (
                <Box key={i} sx={{ width: 88, height: 88, borderRadius: 1, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <img src={URL.createObjectURL(f)} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
