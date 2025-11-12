import React from 'react';
import { Box, Typography, Grid, Chip } from '@mui/material';

export default function AddDetailContent({ add }) {
  if (!add) return <Typography>Loading...</Typography>;

  const imageUrl = add?.main_image?.file_url || add?.main_image?.url || '/placeholder.png';

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box component="img" src={imageUrl} alt={add.title} sx={{ width: '100%', borderRadius: 2 }} />
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
