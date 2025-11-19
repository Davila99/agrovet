import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { useUploadMedia } from '../hooks/useForoApi';
import { validateMedia } from '../utils/validators';

/**
 * ImageUploader atom. Uploads to backend endpoint POST /api/media/upload/ and returns media_id.
 * TODO: Ensure backend returns { id } or { media_id } and adapt accordingly.
 */
export default function ImageUploader({ onUploaded, returnFile = false }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const upload = useUploadMedia();

  function onChange(e) {
    const f = e.target.files[0];
    const validation = validateMedia(f);
    if (validation) return setError(validation);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function doUpload() {
    if (!file) return;
    try {
      const res = await upload.mutateAsync(file);
      // TODO: adapt to backend response shape; assume { id }
      const id = res.id || res.media_id || res.data?.id;
      if (onUploaded) {
        if (returnFile) onUploaded(file);
        else onUploaded(id);
      }
    } catch (e) {
      setError({ upload: 'Error al subir archivo' });
    }
  }

  return (
    <div>
      <input id="file-input" type="file" accept="image/*,video/mp4" onChange={onChange} style={{ display: 'block' }} />
      {preview && <img src={preview} alt="preview" style={{ maxWidth: 240, marginTop: 8, borderRadius: 8 }} />}
      <div style={{ marginTop: 8 }}>
        <Button
          variant="contained"
          color="primary"
          disabled={!file || upload.isLoading}
          onClick={doUpload}
          sx={{ borderRadius: '999px' }}
        >
          Subir
        </Button>
      </div>
      {error && <div style={{ color: 'red' }}>{error.type || error.size || error.upload}</div>}
    </div>
  );
}
