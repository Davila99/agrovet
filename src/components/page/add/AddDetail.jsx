import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import AddDetailContent from '../../organisms/add/AddDetailContent';
import { addService } from '/src/services/endpoints/index.js';

export default function AddDetail() {
  const { id } = useParams();
  const [add, setAdd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    addService.getAddDetail(id)
      .then(res => setAdd(res))
      .catch(err => { console.error(err); setError(err); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">Error al cargar el anuncio</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <AddDetailContent add={add} />
    </Box>
  );
}
