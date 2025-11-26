import React, { useState } from 'react';
import { useCommunities } from '../../../hooks/Foro/useForoApi';
import { Paper, Typography, List, ListItem, ListItemText, Divider, Box, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Alert, Avatar } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import foroService from '../../../services/endpoints/foro';

export default function SidebarCommunities() {
  const { data, isLoading, error: apiError } = useCommunities();
  const items = data || [];
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [error, setError] = useState(null);
  
  if (isLoading) {
    return (
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Cargando comunidades...
        </Typography>
      </Paper>
    );
  }
  
  if (apiError) {
    return (
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="body2" color="error">
          Error cargando comunidades. {apiError.message || 'Verifica que el servicio de foro esté disponible y que las migraciones de base de datos estén ejecutadas.'}
        </Typography>
      </Paper>
    );
  }

  async function handleCreate() {
    setError(null);
    try {
      const payload = { name, slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), short_description: shortDescription, cover_image: coverImage };
      await foroService.createCommunity(payload);
      // simple refresh to re-fetch; keep it simple
      window.location.reload();
    } catch (e) {
      setError(e.message || 'Error creando comunidad');
    }
  }

  return (
    <Paper sx={{ p: 2, borderRadius: 2, position: 'sticky', top: 96 }} elevation={1}>
      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>POPULAR COMMUNITIES</Typography>
      {items.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>No hay comunidades aún.</Typography>
          <Button
            onClick={() => setOpen(true)}
            sx={{
              mt: 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#e6f8ea',
              color: '#0a7a2a',
              '&:hover': { bgcolor: '#d1f0d6' },
              borderRadius: '999px',
              px: 2,
              py: 1,
            }}
          >
            <Box component="span" sx={{ width: 18, height: 18, bgcolor: '#0a7a2a', color: '#fff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>+</Box>
            Crear comunidad
          </Button>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {items.slice(0, 6).map((c, idx) => (
            <React.Fragment key={c.id}>
              <ListItem sx={{ py: 1 }}>
                <Avatar src={c.avatar || ''} alt={c.name} sx={{ width: 40, height: 40, mr: 1 }} component={RouterLink} to={`/foro/community/${c.id}`} />
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 700 }} component={RouterLink} to={`/foro/community/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{c.name}</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: 'text.secondary' }}>{c.short_description}</Typography>}
                />
                <Box sx={{ ml: 1, color: 'text.secondary', fontSize: 12 }}>{(c.members_count || 0).toLocaleString()}</Box>
              </ListItem>
              {idx < Math.min(items.length - 1, 5) && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Crear comunidad</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{String(error)}</Alert>}
          <TextField autoFocus margin="dense" label="Nombre" fullWidth value={name} onChange={e => setName(e.target.value)} />
          <TextField margin="dense" label="Slug (opcional)" fullWidth value={slug} onChange={e => setSlug(e.target.value)} />
          <TextField margin="dense" label="Descripción corta" fullWidth value={shortDescription} onChange={e => setShortDescription(e.target.value)} />
          <TextField margin="dense" label="URL imagen de portada (opcional)" fullWidth value={coverImage} onChange={e => setCoverImage(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: '999px' }}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate} sx={{ borderRadius: '999px' }}>Crear</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
