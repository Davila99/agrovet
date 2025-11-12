import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Chip, Avatar, Button, Stack, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { authAPI } from '../../../../services/endpoints';
import ImageCarousel from '../atoms/ImageCarousel';

// simple in-memory cache to avoid repeating reverse-geocode requests for same coords
const geoCurrencyCache = new Map();

const COUNTRY_CURRENCY_MAP = {
  'US': { code: 'USD', symbol: '$' },
  'NI': { code: 'NIO', symbol: 'C$' },
  'BO': { code: 'BOB', symbol: 'Bs' },
  'AR': { code: 'ARS', symbol: '$' },
  'CL': { code: 'CLP', symbol: '$' },
  'PE': { code: 'PEN', symbol: 'S/' },
  'UY': { code: 'UYU', symbol: '$U' },
  'ES': { code: 'EUR', symbol: '€' },
  'MX': { code: 'MXN', symbol: '$' },
  // add others as needed
};

export default function AddDetailContent({ add }) {
  if (!add) return <Typography>Loading...</Typography>;

  const [publisher, setPublisher] = useState(null);
  const [currency, setCurrency] = useState(null);

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

  // determine currency by reverse-geocoding ad coordinates (if present)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!add) return;
        const lat = add.latitude;
        const lon = add.longitude;
        if (!lat || !lon) return;
        const key = `${Number(lat).toFixed(4)},${Number(lon).toFixed(4)}`;
        if (geoCurrencyCache.has(key)) {
          if (mounted) setCurrency(geoCurrencyCache.get(key));
          return;
        }
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;
        const r = await fetch(url);
        if (!r.ok) return;
        const j = await r.json();
        const addr = j.address || {};
        const cc = (addr.country_code || '').toString().toUpperCase();
        const mapped = COUNTRY_CURRENCY_MAP[cc] || null;
        if (mapped) {
          geoCurrencyCache.set(key, mapped);
          if (mounted) setCurrency(mapped);
        }
      } catch (e) {
        console.warn('currency reverse geocode failed', e);
      }
    })();
    return () => { mounted = false; };
  }, [add.latitude, add.longitude]);

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
    const delta = 0.02; // ~2km bbox depends on lat
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

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 12px 30px rgba(2,6,23,0.08)', bgcolor: '#f8fbff', border: '1px solid rgba(2,6,23,0.03)' }}>
            <Box sx={{ width: '100%', height: { xs: 320, sm: 380, md: 420 } }}>
              <ImageCarousel images={images} height={420} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
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
              // lift the details card so it 'pops out' on larger screens
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
                  {(() => {
                    const price = typeof add.price === 'number' ? add.price : parseFloat(add.price || 0);
                    const curr = currency || null;
                    try {
                      if (curr && curr.code) {
                        return new Intl.NumberFormat(undefined, { style: 'currency', currency: curr.code, maximumFractionDigits: 2 }).format(price);
                      }
                    } catch (e) {}
                    // fallback to symbol or raw value
                    const symbol = curr && curr.symbol ? curr.symbol : 'Bs';
                    return `${symbol} ${price}`;
                  })()}
                </Typography>
                <Chip label={formatCondition(add.condition)} color="primary" sx={{ textTransform: 'capitalize' }} />
                <Chip label={add.location_name || 'Sin ubicación'} variant="outlined" />
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
        </Grid>
      </Grid>
    </Box>
  );
}
