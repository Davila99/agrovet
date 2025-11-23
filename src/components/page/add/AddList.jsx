import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import AddCard from '../../molecules/add/AddCard';
import AddGrid from '../../organisms/add/AddGrid';
import { styles } from '../../../styles/add/addStyles';
import { addService } from '/src/services/endpoints/index.js';

export default function AddList({ filters = {} }) {
  const [adds, setAdds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    addService.getAdds(filters)
      .then(res => {
        if (!mounted) return;
        let items = res?.results || res || [];
        // If filters include lat/lon, apply a client-side proximity filter as a best-effort
        const lat = filters?.lat;
        const lon = filters?.lon;
        const locality = filters?.location || '';
        if (lat && lon && items && Array.isArray(items) && items.length) {
          const toNum = (v) => (v === null || v === undefined ? NaN : Number(v));
          const lat0 = toNum(lat);
          const lon0 = toNum(lon);
          if (!Number.isNaN(lat0) && !Number.isNaN(lon0)) {
            const R = 6371; // km
            const haversine = (aLat, aLon) => {
              const toRad = (d) => d * Math.PI / 180;
              const dLat = toRad(aLat - lat0);
              const dLon = toRad(aLon - lon0);
              const rLat1 = toRad(lat0);
              const rLat2 = toRad(aLat);
              const aa = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
              return R * c;
            };
            // Keep items within 50km OR items whose location_name contains the locality text
            items = items.filter(it => {
              const latA = toNum(it.latitude);
              const lonA = toNum(it.longitude);
              let within = false;
              if (!Number.isNaN(latA) && !Number.isNaN(lonA)) {
                const d = haversine(latA, lonA);
                within = d <= 50; // 50 km radius
              }
              if (within) return true;
              // fallback textual containment (case-insensitive)
              if (locality && it.location_name && String(it.location_name).toLowerCase().includes(String(locality).toLowerCase())) return true;
              return false;
            });
          }
        }
        setAdds(items);
      })
      .catch(err => { console.error(err); if (mounted) setError(err); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [filters]);

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
