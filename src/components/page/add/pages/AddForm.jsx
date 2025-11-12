import React, { useState } from 'react';
import { Box, TextField, MenuItem, Typography, Button, Snackbar, Alert } from '@mui/material';
import ImageUploader from '../atoms/ImageUploader';
import { styles } from '../styles/addStyles';
import { addService } from '../../../../services/endpoints/adds';

export default function AddForm({ onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'new',
    main_image: null,
    secondary_images: [],
  });
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || form.title.length < 3) return setSnack({ open: true, message: 'El título es demasiado corto', severity: 'error' });
    if (!form.category) return setSnack({ open: true, message: 'Selecciona una categoría', severity: 'error' });
    if (!form.main_image) return setSnack({ open: true, message: 'La imagen principal es obligatoria', severity: 'error' });

    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('price', form.price || 0);
    fd.append('category', form.category);
    fd.append('condition', form.condition);
    if (form.main_image instanceof File) fd.append('main_image', form.main_image, form.main_image.name);
    (form.secondary_images || []).forEach((f, i) => fd.append('secondary_images', f, f.name));

    try {
      setLoading(true);
      const res = await addService.createAdd(fd);
      setSnack({ open: true, message: 'Anuncio publicado correctamente', severity: 'success' });
      if (onCreated) onCreated(res);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: err?.message || 'Error al publicar anuncio', severity: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 900, mx: 'auto', p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1 }}>
      <Typography variant="h6" mb={2}>Publicar nuevo anuncio</Typography>

      <TextField fullWidth label="Título" name="title" value={form.title} onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth label="Precio (Bs)" name="price" value={form.price} onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth select label="Categoría" name="category" value={form.category} onChange={handleChange} sx={{ mb: 2 }}>
        <MenuItem value="veterinaria">Veterinaria</MenuItem>
        <MenuItem value="agronomia">Agronomía</MenuItem>
        <MenuItem value="otros">Otros</MenuItem>
      </TextField>

      <TextField fullWidth select label="Condición" name="condition" value={form.condition} onChange={handleChange} sx={{ mb: 2 }}>
        <MenuItem value="new">Nuevo</MenuItem>
        <MenuItem value="semi_new">Seminuevo</MenuItem>
        <MenuItem value="used">Usado</MenuItem>
      </TextField>

      <TextField fullWidth multiline rows={3} label="Descripción" name="description" value={form.description} onChange={handleChange} sx={{ mb: 2 }} />

      <ImageUploader label="Imagen principal" maxCount={1} onUpload={(file) => setForm(prev => ({ ...prev, main_image: file }))} />
      <Box sx={{ height: 12 }} />
      <ImageUploader label="Imágenes secundarias" maxCount={4} onUpload={(files) => setForm(prev => ({ ...prev, secondary_images: files }))} />

      <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={loading}>{loading ? 'Publicando...' : 'Publicar anuncio'}</Button>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
