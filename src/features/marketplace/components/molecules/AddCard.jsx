import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import useCurrency from '../../../../hooks/useCurrency';
import ImageCarousel from '../atoms/ImageCarousel';

export default function AddCard({ add }) {
  const { formatPrice } = useCurrency();

  const allImages = [];
  if (add?.main_image) {
    const url = add.main_image.file_url || add.main_image.url || (typeof add.main_image === 'string' ? add.main_image : null);
    if (url) allImages.push(url);
  }
  if (Array.isArray(add?.secondary_images)) {
    add.secondary_images.forEach(img => {
      const url = img?.file_url || img?.url || (typeof img === 'string' ? img : null);
      if (url && !allImages.includes(url)) allImages.push(url);
    });
  }
  if (Array.isArray(add?.images)) {
    add.images.forEach(img => {
      const url = img?.file_url || img?.url || (typeof img === 'string' ? img : null);
      if (url && !allImages.includes(url)) allImages.push(url);
    });
  }

  const limitedImages = allImages.length > 0 ? allImages.slice(0, 5) : ['/placeholder.png'];
  const price = typeof add.price === 'number' ? add.price : parseFloat(add.price || 0);
  const priceStr = formatPrice(price);

  const dateStr = add.created_at ? (() => {
    try { return new Date(add.created_at).toLocaleDateString(); } catch (e) { return add.created_at; }
  })() : '';

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: '#fff',
        transition: 'all 0.25s ease',
        boxShadow: '0 8px 22px rgba(2,6,23,0.08)',
        border: '1px solid rgba(16,24,40,0.08)',
        '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 18px 40px rgba(2,6,23,0.12)' },
        display: 'block',
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', height: 220, overflow: 'hidden' }}>
        <ImageCarousel images={limitedImages} height={220} allowFullscreen={true} />
        {add.location_name && (
          <Box sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', px: 1.2, py: 0.4, borderRadius: 1, zIndex: 3, pointerEvents: 'none' }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{add.location_name}</Typography>
          </Box>
        )}
      </Box>
      <CardContent component={Link} to={`/adds/${add.id}`} sx={{ pt: 2, display: 'block', textDecoration: 'none', color: 'inherit' }}>
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
