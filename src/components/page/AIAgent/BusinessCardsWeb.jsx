/**
 * BusinessCardsWeb — Tarjetas de Agroveterinarias/Negocios recomendados cercanos.
 * Muestra distancia en metros/km y ofrece botón directo para contactar vía chat.
 */
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ChatIcon from '@mui/icons-material/Chat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

export default function BusinessCardsWeb({ businesses }) {
  const navigate = useNavigate();

  if (!businesses || !Array.isArray(businesses) || businesses.length === 0) {
    return null;
  }

  const handleContact = (userId) => {
    if (userId) {
      navigate(`/dashboard?tab=chat&userId=${userId}`);
    } else {
      navigate('/dashboard?tab=chat');
    }
  };

  return (
    <Box sx={{ mt: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <StorefrontIcon sx={{ color: '#10B981', fontSize: 22 }} />
        <Typography variant="subtitle2" fontWeight={700} color="#f8fafc" fontSize="0.95rem">
          Agroveterinarias Cercanas Recomendadas
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {businesses.slice(0, 3).map((biz, idx) => (
          <Grid item xs={12} sm={4} key={biz.user_id || idx}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                bgcolor: '#0f172a',
                borderRadius: 3,
                border: biz.has_product ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#10B981',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#f1f5f9" fontSize="0.88rem" lineHeight={1.2}>
                    {biz.business_name || 'Agroveterinaria'}
                  </Typography>
                  {biz.has_product && (
                    <Chip
                      icon={<CheckCircleIcon style={{ color: '#10B981', fontSize: 14 }} />}
                      label="En stock"
                      size="small"
                      sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#10B981', fontWeight: 700, fontSize: '0.65rem', height: 20 }}
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnIcon sx={{ color: '#38bdf8', fontSize: 16 }} />
                  <Typography variant="caption" color="#94a3b8" fontWeight={600} fontSize="0.75rem">
                    {biz.distance_text || `A ${biz.distance_meters || 300} metros de ti`}
                  </Typography>
                </Box>

                {biz.matched_products && biz.matched_products.length > 0 && (
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="#64748b" display="block" fontSize="0.65rem">
                      Producto registrado:
                    </Typography>
                    <Chip
                      label={biz.matched_products[0]}
                      size="small"
                      sx={{ bgcolor: 'rgba(56,189,248,0.1)', color: '#38bdf8', fontSize: '0.7rem', height: 20, mt: 0.25 }}
                    />
                  </Box>
                )}
              </CardContent>

              <Box sx={{ p: 1.5, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  startIcon={<ChatIcon sx={{ fontSize: 16 }} />}
                  onClick={() => handleContact(biz.user_id)}
                  sx={{
                    bgcolor: '#10B981',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: 2,
                    textTransform: 'none',
                    py: 0.75,
                    '&:hover': { bgcolor: '#059669' },
                  }}
                >
                  Contactar / Iniciar Chat
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
