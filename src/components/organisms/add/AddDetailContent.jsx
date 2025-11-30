import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Avatar, Button, Stack, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { authAPI } from '/src/services/endpoints/index.js';
import ImageCarousel from '../../atoms/add/ImageCarousel';
import useCurrency from '../../../hooks/useCurrency';

export default function AddDetailContent({ add }) {
  const { formatPrice } = useCurrency();
  
  if (!add) return <Typography>Loading...</Typography>;

  const [publisher, setPublisher] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (add.publisher) {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          const u = await authAPI.userById(add.publisher, token);
          if (mounted) setPublisher(u);
        }
      } catch (e) {
        console.warn('failed loading publisher', e);
      }
    })();
    return () => { mounted = false; };
  }, [add.publisher]);

  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const isOwn = currentUserId && String(currentUserId) === String(add.publisher);
  const images = [];
  if (add?.main_image) images.push(add.main_image.file_url || add.main_image.url || add.main_image);
  if (Array.isArray(add?.secondary_images)) {
    add.secondary_images.forEach(si => images.push(si.file_url || si.url || si));
  }

  // helper: build OSM embed url with small bbox around the marker
  const osmEmbedUrl = (lat, lon) => {
    const latN = Number(lat);
    const lonN = Number(lon);
    const delta = 0.02;
    const left = lonN - delta;
    const right = lonN + delta;
    const top = latN + delta;
    const bottom = latN - delta;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left},${bottom},${right},${top}&layer=mapnik&marker=${latN},${lonN}`;
  };

  const formatCondition = (c) => {
    if (!c) return '';
    const map = { new: 'Nuevo', used: 'Usado', semi_new: 'Seminuevo' };
    return map[c] || c;
  };

  const price = typeof add.price === 'number' ? add.price : parseFloat(add.price || 0);

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Box sx={{ gridColumn: { xs: '1/-1', md: '1/2' } }}>
          <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 12px 30px rgba(2,6,23,0.08)', bgcolor: '#f8fbff', border: '1px solid rgba(2,6,23,0.03)' }}>
            <Box sx={{ width: '100%', height: { xs: 320, sm: 380, md: 420 } }}>
              <ImageCarousel images={images} height={420} />
            </Box>
          </Card>
        </Box>

        <Box sx={{ gridColumn: { xs: '1/-1', md: '2/3' } }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 26px 60px rgba(2,6,23,0.12)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#ffffff',
              border: '1px solid rgba(16,24,40,0.06)',
              position: 'relative',
              zIndex: 4,
              transform: { xs: 'none', md: 'translateY(-28px)' },
              transition: 'transform 220ms ease, box-shadow 220ms ease',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar src={publisher?.profile_picture || (add.publisher && `/placeholder.png`)} sx={{ width: 64, height: 64, bgcolor: '#103e68' }}>
                  {!publisher?.profile_picture && (publisher?.full_name ? publisher.full_name[0] : '?')}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">Publicado por</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f1724', fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.2px' }}>{publisher?.full_name || add.publisher_name || 'Usuario'}</Typography>
                </Box>
                {!isOwn && (
                  <Button component={Link} to={`/perfil?userId=${add.publisher}`} variant="contained" size="small">Preguntar</Button>
                )}
              </Stack>

              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#071033', fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.2px', lineHeight: 1.08 }}>{add.title}</Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#0b3b1f' }}>
                  {formatPrice(price)}
                </Typography>
                <Chip label={formatCondition(add.condition)} color="primary" sx={{ textTransform: 'capitalize' }} />
                {add.location_name && (
                  <Chip label={add.location_name} variant="outlined" />
                )}
              </Box>

              <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>Descripción</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-line' }}>{add.description}</Typography>

              {/* Map preview when coordinates present */}
              {add.latitude && add.longitude && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>Ubicación en el mapa</Typography>
                  <Box sx={{ width: '100%', height: 260, borderRadius: 1, overflow: 'hidden', border: '1px solid rgba(16,24,40,0.06)' }}>
                    <iframe
                      title="map"
                      src={osmEmbedUrl(add.latitude, add.longitude)}
                      style={{ border: 0, width: '100%', height: '100%' }}
                      loading="lazy"
                    />
                  </Box>
                </Box>
              )}

            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
