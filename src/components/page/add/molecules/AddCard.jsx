import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { styles } from '../styles/addStyles';

function getCurrencyFromLocale() {
  try {
    const lang = (navigator.language || 'es-BO').toLowerCase();
    const map = {
      'es-bo': { code: 'BOB', symbol: 'Bs' },
      'es-ar': { code: 'ARS', symbol: '$' },
      'es-cl': { code: 'CLP', symbol: '$' },
      'es-pe': { code: 'PEN', symbol: 'S/' },
      'en-us': { code: 'USD', symbol: '$' },
      'es-uy': { code: 'UYU', symbol: '$U' },
    };
    const exact = map[lang];
    if (exact) return exact;
    const prefix = lang.split('-')[0];
    const found = Object.keys(map).find(k => k.startsWith(prefix));
    if (found) return map[found];
  } catch (e) {}
  return { code: 'BOB', symbol: 'Bs' };
}

export default function AddCard({ add }) {
  const imageUrl = add?.main_image?.file_url || add?.main_image?.url || (Array.isArray(add?.secondary_images) && (add.secondary_images[0]?.file_url || add.secondary_images[0]?.url)) || '/placeholder.png';
  const currency = getCurrencyFromLocale();
  const price = typeof add.price === 'number' ? add.price : parseFloat(add.price || 0);
  let priceStr = '';
  try {
    priceStr = new Intl.NumberFormat(navigator.language || 'es-BO', { style: 'currency', currency: currency.code, maximumFractionDigits: 2 }).format(price);
  } catch (e) {
    priceStr = `${currency.symbol} ${price}`;
  }

  const dateStr = add.created_at ? (() => {
    try { return new Date(add.created_at).toLocaleDateString(); } catch (e) { return add.created_at; }
  })() : '';

  return (
    <Card
      component={Link}
      to={`/adds/${add.id}`}
      sx={{
        textDecoration: 'none',
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: '#fff',
        transition: 'all 0.25s ease',
        boxShadow: '0 8px 22px rgba(2,6,23,0.08)',
        border: '1px solid rgba(16,24,40,0.04)',
        '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 18px 40px rgba(2,6,23,0.12)' },
        display: 'block',
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', height: 220, overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={imageUrl}
          alt={add.title}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .28s ease' }}
        />
        <Box sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', px: 1.5, py: 0.5, borderRadius: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>{add.location_name}</Typography>
        </Box>
      </Box>
      <CardContent sx={{ pt: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: '#0f1724', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {add.title}
        </Typography>
        <Typography sx={{ color: '#0b3b1f', fontWeight: 800, fontSize: '1.05rem' }}>
          {priceStr}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {dateStr ? `Publicado ${dateStr}` : ''}
        </Typography>
      </CardContent>
    </Card>
  );
}
