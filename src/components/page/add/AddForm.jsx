import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, MenuItem, Typography, Button, Snackbar, Alert, Card, CardContent, Stack, IconButton, InputAdornment, Chip } from '@mui/material';
import ImageCarousel from '../../atoms/add/ImageCarousel';
import LocationPicker from '../../atoms/add/LocationPicker';
import AddFormImagePicker from './AddFormImagePicker';
import { useAddFormCategories } from './useAddFormCategories';
import { useAddFormGeoLocation } from './useAddFormGeoLocation';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { styles } from '../../../styles/add/addStyles';
import { addService } from '/src/services/endpoints/index.js';
import httpClient from '/src/services/httpClient';
import authClient from '/src/services/authClient';
import { buildUrl } from '/src/services/env.js';
import { useEffect } from 'react';
// DeleteIcon removed: no inline secondary thumbnails

export default function AddForm({ onCreated }) {
  const navigate = useNavigate();

  const initialForm = {
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'new',
    main_image: null,
    secondary_images: [],
    location_name: '',
    latitude: null,
    longitude: null,
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const { categories, categoriesLoaded } = useAddFormCategories(setSnack);
  const { currency } = useAddFormGeoLocation(setForm);

  // secondary images are managed via MainImageArea; no inline thumbnail deletion

  // File input and handler for adding images. Clicking the carousel will open the picker.
  const fileInputRef = useRef(null);
  const handleFiles = (fileList) => {
    if (!fileList) return;
    const arr = Array.from(fileList || []).slice(0, 5);
    if (!arr.length) return;
    setForm(prev => {
      const prevSecondary = Array.isArray(prev.secondary_images) ? [...prev.secondary_images] : [];
      if (!prev.main_image) {
        const [first, ...rest] = arr;
        const newSecondaries = [...prevSecondary, ...rest].slice(0, 4);
        return { ...prev, main_image: first, secondary_images: newSecondaries };
      }
      const combined = [...prevSecondary, ...arr].slice(0, 4);
      return { ...prev, secondary_images: combined };
    });
  };

  const onFileChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || form.title.length < 3) return setSnack({ open: true, message: 'El título es demasiado corto', severity: 'error' });
    if (!form.category) return setSnack({ open: true, message: 'Selecciona una categoría', severity: 'error' });
    if (!form.main_image) return setSnack({ open: true, message: 'La imagen principal es obligatoria', severity: 'error' });

    try {
      setLoading(true);
      // Upload-first flow: upload images to /api/media/ and get media IDs
      let main_id = null;
      const secondary_ids = [];

      // helper to upload a single file to media endpoint
      const uploadFile = async (file) => {
        try {
          const mfd = new FormData();
          mfd.append('image', file, file.name);
          // Use buildUrl to get correct media service URL
          const mediaUrl = buildUrl('MEDIA', '/media/');
          console.log('[AddForm] Uploading to:', mediaUrl); // DEBUG

          // Use fetch directly to avoid httpClient baseURL issues
          const response = await fetch(mediaUrl, {
            method: 'POST',
            body: mfd,
            // Don't set Content-Type header, let browser set it with boundary
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const resp = await response.json();
          return resp && resp.id ? resp.id : null;
        } catch (e) {
          console.error('uploadFile error', e);
          return null;
        }
      };

      if (form.main_image instanceof File) {
        main_id = await uploadFile(form.main_image);
        if (!main_id) throw new Error('No se pudo subir la imagen principal');
      } else if (form.main_image && form.main_image.id) {
        main_id = form.main_image.id;
      }

      // upload secondary images sequentially (small number, max 4)
      for (const f of (form.secondary_images || [])) {
        if (f instanceof File) {
          const id = await uploadFile(f);
          if (id) secondary_ids.push(id);
        } else if (f && f.id) {
          secondary_ids.push(f.id);
        }
      }

      // Build payload for Add creation using IDs (serializer expects these write-only fields)
      let categoryId = form.category;
      // If categories were not loaded from API (we used fallback), try to create the category on the server
      if (!categoriesLoaded) {
        try {
          const sel = categories.find(c => String(c.id) === String(form.category));
          const name = sel ? sel.name : null;
          if (name) {
            const categoriesUrl = buildUrl('ADDS', '/categories/');
            const created = await httpClient(categoriesUrl, { method: 'POST', body: { name } });
            if (created && created.id) categoryId = created.id;
          }
        } catch (e) {
          console.error('failed creating fallback category', e);
        }
      }

      const payload = {
        title: form.title,
        description: form.description,
        price: form.price || 0,
        category: categoryId,
        condition: form.condition,
        main_image_id: main_id,
        secondary_image_ids: secondary_ids,
        location_name: form.location_name || null,
        latitude: form.latitude || null,
        longitude: form.longitude || null,
      };

      try { console.debug('[AddForm] creating add payload', { payload }); } catch (e) {}
      try { const tok = authClient.getAccessToken && authClient.getAccessToken(); console.debug('[AddForm] access token (masked)', tok && (tok.length > 8 ? `${tok.slice(0,4)}...${tok.slice(-4)}` : tok)); } catch (e) {}

      const res = await addService.createAdd(payload);
      setSnack({ open: true, message: 'Anuncio publicado correctamente', severity: 'success' });
      if (onCreated) onCreated(res);
      // reset form and navigate to the created add's detail so user sees it immediately
      setForm(initialForm);
      try {
        if (res && res.id) {
          navigate(`/adds/${res.id}`);
        } else {
          navigate('/adds');
        }
      } catch (e) {
        navigate('/adds');
      }
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: err?.message || 'Error al publicar anuncio', severity: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 560, mx: 'auto', p: 1 }}>
      <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 6px 18px rgba(18,38,63,0.08)', transition: 'transform .18s ease', '&:hover': { transform: 'translateY(-4px)' } }} className="fade-in">
        <Box sx={{ background: 'linear-gradient(90deg, rgba(24,119,242,0.12), rgba(16,142,137,0.06))', p: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f1724' }}>Publicar nuevo anuncio</Typography>
        </Box>
        <CardContent>
          <AddFormImagePicker form={form} setForm={setForm} setSnack={setSnack} />

          <TextField fullWidth label="Título" name="title" value={form.title} onChange={handleChange} sx={{ mb: 2 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Precio"
              name="price"
              value={form.price}
              onChange={(e) => {
                // allow only numbers and optional decimal point
                const v = e.target.value;
                if (v === '' || /^\d*(\.\d{0,2})?$/.test(v)) {
                  handleChange(e);
                }
              }}
              inputProps={{ inputMode: 'decimal', pattern: '^\\d*(\\.\\d{0,2})?$' }}
              InputProps={{ startAdornment: <InputAdornment position="start">{currency.symbol}</InputAdornment> }}
            />
            <TextField fullWidth select label="Categoría" name="category" value={form.category || ''} onChange={handleChange}>
              {categories.length ? (
                categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name || c.label || c}</MenuItem>)
              ) : (
                <MenuItem value="">Cargando...</MenuItem>
              )}
            </TextField>
          </Stack>

          <TextField fullWidth select label="Condición" name="condition" value={form.condition || ''} onChange={handleChange} sx={{ mb: 2 }}>
            <MenuItem value="new">Nuevo</MenuItem>
            <MenuItem value="semi_new">Seminuevo</MenuItem>
            <MenuItem value="used">Usado</MenuItem>
          </TextField>

          <TextField fullWidth multiline rows={4} label="Descripción" name="description" value={form.description} onChange={handleChange} sx={{ mb: 2 }} />

          {/* Location: show detected location (editable) and persist lat/lon in payload */}
          {/* Location picker: default populated by geolocation reverse-geocode; user may change via search */}
          <Box sx={{ mb: 2 }}>
            <LocationPicker
              value={form.location_name || ''}
              onChange={(v) => setForm(prev => ({ ...prev, location_name: v }))}
              onSelect={(place) => setForm(prev => ({ ...prev, location_name: place.display_name, latitude: place.lat, longitude: place.lon }))}
              placeholder={form.location_name ? '' : 'Se intentará detectar tu ciudad por defecto'}
            />
            {form.latitude && form.longitude && (
              <Typography variant="caption" color="text.secondary">Detectado • {form.latitude.toFixed ? form.latitude.toFixed(3) : form.latitude}, {form.longitude && form.longitude.toFixed ? form.longitude.toFixed(3) : form.longitude}</Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ ...styles.primaryButton }}
              disabled={loading}
            >
              {loading ? 'Publicando...' : 'Publicar anuncio'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
