import React, { useRef } from 'react';
import { Box, Typography, Chip, Button } from '@mui/material';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AddFormImagePicker({ form, setForm, setSnack }) {
  const fileInputRef = useRef(null);

  const totalPhotos = (form.main_image ? 1 : 0) + (form.secondary_images || []).length;

  const handleFiles = (fileList) => {
    if (!fileList) return;
    const arr = Array.from(fileList || []);
    if (!arr.length) return;

    setForm(prev => {
      const currentTotal = (prev.main_image ? 1 : 0) + (prev.secondary_images || []).length;
      if (currentTotal >= 5) {
        if (setSnack) setSnack({ open: true, message: 'Máximo 5 imágenes permitidas', severity: 'warning' });
        return prev;
      }

      const availableSlots = 5 - currentTotal;
      const allowed = arr.slice(0, availableSlots);
      if (arr.length > availableSlots && setSnack) {
        setSnack({ open: true, message: `Solo se agregaron ${availableSlots} fotos (máximo 5)`, severity: 'info' });
      }

      if (!prev.main_image) {
        const [first, ...rest] = allowed;
        return { ...prev, main_image: first, secondary_images: rest };
      } else {
        const prevSec = Array.isArray(prev.secondary_images) ? [...prev.secondary_images] : [];
        return { ...prev, secondary_images: [...prevSec, ...allowed].slice(0, 4) };
      }
    });
  };

  const onFileChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setForm(prev => ({ ...prev, main_image: null, secondary_images: [] }));
  };

  const firstImageUrl = React.useMemo(() => {
    if (!form.main_image) return null;
    if (typeof form.main_image === 'string') return form.main_image;
    try {
      return URL.createObjectURL(form.main_image);
    } catch {
      return null;
    }
  }, [form.main_image]);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Fotos (Máximo 5)
      </Typography>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={onFileChange}
      />

      <Box
        sx={{
          mt: 1,
          borderRadius: 2,
          border: '1px dashed rgba(16,24,40,0.12)',
          overflow: 'hidden',
          bgcolor: '#fbfdff',
          cursor: 'pointer',
          position: 'relative',
        }}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
      >
        {!firstImageUrl ? (
          <Box sx={{ width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center', color: '#6b7280' }}>
              <AddAPhotoIcon sx={{ fontSize: 42 }} />
              <Typography sx={{ mt: 1, color: '#6b7280', fontWeight: 600 }}>
                Seleccionar fotos (Máx. 5)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Solo se previsualizará la 1ª foto elegida
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ position: 'relative', width: '100%', height: 220 }}>
            {/* Solo se previsualiza la primera elegida */}
            <img
              src={firstImageUrl}
              alt="1ª Foto elegida"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />

            {/* Badge de cantidad */}
            <Chip
              label={`${totalPhotos} / 5 fotos (${totalPhotos === 1 ? '1ª elegida' : `1ª elegida + ${totalPhotos - 1} secundarias`})`}
              size="small"
              sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(0,0,0,0.7)', color: '#fff', fontWeight: 600 }}
            />

            {totalPhotos < 5 && (
              <Button
                size="small"
                variant="contained"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: '#103e68', fontSize: '0.75rem' }}
              >
                + Añadir fotos ({5 - totalPhotos} rest.)
              </Button>
            )}

            <Chip
              icon={<DeleteIcon style={{ color: '#fff', fontSize: 16 }} />}
              label="Limpiar"
              size="small"
              onClick={handleClear}
              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(220,38,38,0.85)', color: '#fff', cursor: 'pointer' }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
