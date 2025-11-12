import React from 'react';
import { Box, Typography, Grid, Chip } from '@mui/material';
import ImageCarousel from '../atoms/ImageCarousel';

export default function AddDetailContent({ add }) {
  if (!add) return <Typography>Loading...</Typography>;

  const images = [];
  if (add?.main_image) images.push(add.main_image.file_url || add.main_image.url || add.main_image);
  if (Array.isArray(add?.secondary_images)) {
    add.secondary_images.forEach(si => images.push(si.file_url || si.url || si));
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ImageCarousel images={images} height={420} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{add.title}</Typography>
          <Typography color="success.main" sx={{ fontWeight: 700, mt: 1 }}>{add.price} Bs</Typography>
          <Chip label={add.condition} sx={{ mt: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>{add.description}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>Ubicación: {add.location_name}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
