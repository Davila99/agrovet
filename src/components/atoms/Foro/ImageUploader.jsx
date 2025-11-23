import React, { useState } from 'react';
import { useUploadMedia } from '../../../hooks/Foro/useForoApi';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

/**
 * ImageUploader component for Foro posts
 * Handles image upload and displays preview
 */
export default function ImageUploader({ onUploaded }) {
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const uploadMedia = useUploadMedia();

    async function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        // Upload file
        try {
            setUploading(true);
            const result = await uploadMedia.mutateAsync(file);

            // Extract media ID from result
            const mediaId = result?.id || result?.media_id || result;

            if (onUploaded) {
                onUploaded(mediaId);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            setPreview(null);
        } finally {
            setUploading(false);
        }
    }

    function handleRemove() {
        setPreview(null);
        if (onUploaded) {
            onUploaded(null);
        }
    }

    return (
        <Box sx={{ width: '100%' }}>
            {!preview ? (
                <Box>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="image-upload-button"
                        type="file"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                    <label htmlFor="image-upload-button">
                        <Button
                            variant="outlined"
                            component="span"
                            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                            disabled={uploading}
                            fullWidth
                            sx={{ borderRadius: 2, py: 1.5 }}
                        >
                            {uploading ? 'Uploading...' : 'Upload Image'}
                        </Button>
                    </label>
                </Box>
            ) : (
                <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            width: '100%',
                            maxHeight: '300px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                        }}
                    />
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={handleRemove}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            minWidth: 'auto',
                            px: 2,
                        }}
                    >
                        Remove
                    </Button>
                </Box>
            )}
            {uploadMedia.error && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                    Upload failed. Please try again.
                </Typography>
            )}
        </Box>
    );
}
