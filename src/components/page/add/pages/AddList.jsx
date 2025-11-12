import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import AddCard from '../molecules/AddCard';
import AddGrid from '../organisms/AddGrid';
import { styles } from '../styles/addStyles';
import { addService } from '../../../../services/endpoints/adds';

export default function AddList() {
  const [adds, setAdds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    addService.getAdds()
      .then(res => { if (mounted) setAdds(res?.results || res || []); })
      .catch(err => { console.error(err); if (mounted) setError(err); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">Error al cargar anuncios</Typography>;
  if (!adds.length) return <Typography variant="body2" textAlign="center" mt={5}>No hay anuncios disponibles</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <AddGrid>
        {adds.map(add => (
          <AddCard key={add.id} add={add} />
        ))}
      </AddGrid>
    </Box>
  );
}
