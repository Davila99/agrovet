import React, { useEffect, useState } from 'react';
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

// cache for reverse-geocode currency determination
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
};

export default function AddCard({ add }) {
  const imageUrl = add?.main_image?.file_url || add?.main_image?.url || (Array.isArray(add?.secondary_images) && (add.secondary_images[0]?.file_url || add.secondary_images[0]?.url)) || '/placeholder.png';
  const [currency, setCurrency] = useState(getCurrencyFromLocale());
  const price = typeof add.price === 'number' ? add.price : parseFloat(add.price || 0);
  const [priceStr, setPriceStr] = useState(() => {
    try { return new Intl.NumberFormat(navigator.language || 'es-BO', { style: 'currency', currency: currency.code, maximumFractionDigits: 2 }).format(price); } catch (e) { return `${currency.symbol} ${price}`; }
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const lat = add.latitude;
        const lon = add.longitude;
        if (!lat || !lon) return;
        const key = `${Number(lat).toFixed(4)},${Number(lon).toFixed(4)}`;
        if (geoCurrencyCache.has(key)) {
          const mapped = geoCurrencyCache.get(key);
          if (mounted) {
            setCurrency(mapped);
            try { setPriceStr(new Intl.NumberFormat(undefined, { style: 'currency', currency: mapped.code, maximumFractionDigits: 2 }).format(price)); } catch (e) { setPriceStr(`${mapped.symbol} ${price}`); }
          }
          return;
        }
        // reverse geocode
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;
        const r = await fetch(url);
        if (!r.ok) return;
        const j = await r.json();
        const addr = j.address || {};
        const cc = (addr.country_code || '').toString().toUpperCase();
        const mapped = COUNTRY_CURRENCY_MAP[cc] || null;
        if (mapped) {
          geoCurrencyCache.set(key, mapped);
          if (mounted) {
            setCurrency(mapped);
            try { setPriceStr(new Intl.NumberFormat(undefined, { style: 'currency', currency: mapped.code, maximumFractionDigits: 2 }).format(price)); } catch (e) { setPriceStr(`${mapped.symbol} ${price}`); }
          }
        }
      } catch (e) {
        console.warn('failed resolving currency for add', e);
      }
    })();
    return () => { mounted = false; };
  }, [add.latitude, add.longitude, price]);

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
        border: '1px solid rgba(16,24,40,0.08)',
        // subtle background tint to separate from white page on hover
        '&.MuiPaper-root': { backgroundClip: 'padding-box' },
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
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5, color: '#0f1724', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {add.title}
        </Typography>
        <Typography sx={{ color: '#0b3b1f', fontWeight: 800, fontSize: '1.05rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {priceStr}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5} sx={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {dateStr ? `Publicado ${dateStr}` : ''}
        </Typography>
      </CardContent>
    </Card>
  );
}
