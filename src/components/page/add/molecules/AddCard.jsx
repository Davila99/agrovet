import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { styles } from '../styles/addStyles';

export default function AddCard({ add }) {
  const imageUrl = add?.main_image?.file_url || add?.main_image?.url || '/placeholder.png';
  return (
    <Card
      component={Link}
      to={`/adds/${add.id}`}
      sx={{
        textDecoration: 'none',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: 1,
        transition: '0.2s ease',
        '&:hover': { boxShadow: 3, transform: 'scale(1.02)' },
        display: 'block',
      }}
    >
      <Box sx={{ width: '100%', height: 180, overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={imageUrl}
          alt={add.title}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {add.title}
        </Typography>
        <Typography color="success.main" fontWeight={600}>
          {add.price} Bs
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {add.location_name}
        </Typography>
      </CardContent>
    </Card>
  );
}
