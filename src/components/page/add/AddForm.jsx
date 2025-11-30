import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, MenuItem, Typography, Button, Snackbar, Alert, Stack, InputAdornment, Chip } from '@mui/material';
import ImageCarousel from '../../atoms/add/ImageCarousel';
import { FormContainer } from '../../atoms/form';
import useCurrency from '../../../hooks/useCurrency';

import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { styles } from '../../../styles/add/addStyles';
import { addService } from '/src/services/endpoints/index.js';
import httpClient from '/src/services/httpClient';
import authClient from '/src/services/authClient';
import { buildUrl } from '/src/services/env.js';

export default function AddForm({ onCreated }) {
  const navigate = useNavigate();
  const { symbol: currencySymbol } = useCurrency();

  const initialForm = {
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'new',
    main_image: null,
    secondary_images: [],
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const [categories, setCategories] = React.useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = React.useState(false);

  // Fallback static categories (used if API is unreachable or returns error)
  const FALLBACK_CATEGORIES = [
    'Veterinaria', 'Medicamentos veterinarios', 'Antiparasitarios', 'Vacunas', 'Suplementos', 'Alimentos balanceados',
    'Productos para ganado', 'Reproductores', 'Hormonas', 'Insumos agrícolas', 'Semillas', 'Fertilizantes', 'Pesticidas',
    'Maquinaria agrícola', 'Tractores', 'Implementos', 'Herramientas', 'Servicios veterinarios', 'Consultoría', 'Capacitación',
    'Transporte de animales', 'Alojamiento de ganado', 'Productos de higiene', 'Instrumental quirúrgico', 'Laboratorio', 'Otros'
  ].map((n, i) => ({ id: String(i + 1), name: n }));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await addService.getCategories();
        // expecting an array of categories with id and name
        if (mounted) {
          const list = Array.isArray(res) ? res : (res.results || []);
          const CORE_NAMES = ['Medicamentos y salud animal', 'Alimentos y suplementos', 'Productos para ganado', 'Semillas y plantas', 'Fertilizantes y agroquímicos', 'Maquinaria e implementos', 'Herramientas e insumos', 'Servicios agropecuarios'];
          const coreFound = list.filter(c => CORE_NAMES.includes((c.name || '').toString()));
          if (coreFound.length) {
            setCategories(coreFound);
            setCategoriesLoaded(true);
          } else if (Array.isArray(list) && list.length) {
            setCategories(list);
            setCategoriesLoaded(true);
          } else {
            setCategories(FALLBACK_CATEGORIES);
            setCategoriesLoaded(false);
          }
        }
      } catch (e) {
        console.error('failed to load categories, falling back to static list', e);
        if (mounted) setCategories(FALLBACK_CATEGORIES);
        setCategoriesLoaded(false);
        setSnack({ open: true, message: 'No se pudieron cargar categorías; usando lista local', severity: 'warning' });
      }
    })();
    return () => { mounted = false; };
  }, []);

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
      };

      try { console.debug('[AddForm] creating add payload', { payload }); } catch (e) { }
      try { const tok = authClient.getAccessToken && authClient.getAccessToken(); console.debug('[AddForm] access token (masked)', tok && (tok.length > 8 ? `${tok.slice(0, 4)}...${tok.slice(-4)}` : tok)); } catch (e) { }

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
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        p: { xs: 2, sm: 3 },
        bgcolor: '#f5f7fa',
      }}
    >
      <FormContainer title="Publicar nuevo anuncio" variant="standard">
        {/* Image uploader */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#374151' }}>
            Fotos del producto
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
              borderRadius: 2,
              border: '2px dashed',
              borderColor: form.main_image ? 'primary.main' : 'grey.300',
              overflow: 'hidden',
              bgcolor: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: '#f0f7ff',
              },
            }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            {(!(form.main_image || (form.secondary_images && form.secondary_images.length))) ? (
              <Box sx={{ width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center', color: '#6b7280' }}>
                  <AddAPhotoIcon sx={{ fontSize: 48, color: '#9ca3af' }} />
                  <Typography sx={{ mt: 1, color: '#6b7280', fontWeight: 600 }}>
                    Agregar fotos
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                    Máximo 5 imágenes
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ position: 'relative' }}>
                <ImageCarousel 
                  images={[...(form.main_image ? [form.main_image] : []), ...(form.secondary_images || [])]} 
                  height={180} 
                />
                <Chip 
                  label={`${(form.secondary_images || []).length + (form.main_image ? 1 : 0)} fotos`} 
                  size="small" 
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    bgcolor: 'rgba(0,0,0,0.6)', 
                    color: '#fff',
                    fontWeight: 600,
                  }} 
                />
              </Box>
            )}
          </Box>
        </Box>

        <TextField 
          fullWidth 
          label="Título" 
          name="title" 
          value={form.title} 
          onChange={handleChange} 
          sx={{ mb: 2 }} 
          placeholder="Ej: Vacuna antirrábica para perros"
        />
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Precio"
            name="price"
            value={form.price}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '' || /^\d*(\.\d{0,2})?$/.test(v)) {
                handleChange(e);
              }
            }}
            inputProps={{ inputMode: 'decimal', pattern: '^\\d*(\\.\\d{0,2})?$' }}
            InputProps={{ 
              startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> 
            }}
            placeholder="0.00"
          />
          <TextField 
            fullWidth 
            select 
            label="Categoría" 
            name="category" 
            value={form.category || ''} 
            onChange={handleChange}
          >
            {categories.length ? (
              categories.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name || c.label || c}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="">Cargando...</MenuItem>
            )}
          </TextField>
        </Stack>

        <TextField 
          fullWidth 
          select 
          label="Condición" 
          name="condition" 
          value={form.condition || ''} 
          onChange={handleChange} 
          sx={{ mb: 2 }}
        >
          <MenuItem value="new">Nuevo</MenuItem>
          <MenuItem value="semi_new">Seminuevo</MenuItem>
          <MenuItem value="used">Usado</MenuItem>
        </TextField>

        <TextField 
          fullWidth 
          multiline 
          rows={3} 
          label="Descripción" 
          name="description" 
          value={form.description} 
          onChange={handleChange} 
          sx={{ mb: 2.5 }} 
          placeholder="Describe tu producto..."
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ 
            ...styles.primaryButton,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
            bgcolor: '#103E68',
            '&:hover': { bgcolor: '#0d3254' },
          }}
          disabled={loading}
        >
          {loading ? 'Publicando...' : 'Publicar anuncio'}
        </Button>
      </FormContainer>

      <Snackbar 
        open={snack.open} 
        autoHideDuration={4000} 
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snack.severity} 
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
