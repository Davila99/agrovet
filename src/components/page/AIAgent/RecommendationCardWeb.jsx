/**
 * RecommendationCardWeb — Tarjeta de recomendaciones clínicas y triage del motor de IA.
 * Renderiza nivel de severidad, especie detectada, pasos de acción y productos/especialistas recomendados.
 */
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PetsIcon from '@mui/icons-material/Pets';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import BusinessCardsWeb from './BusinessCardsWeb';

const SEVERITY_CONFIG = {
  CRITICAL: { label: 'CRÍTICA / URGENTE', color: '#ef4444', bgcolor: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)' },
  HIGH: { label: 'SEVERIDAD ALTA', color: '#f97316', bgcolor: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)' },
  MEDIUM: { label: 'MODERADA', color: '#fbbf24', bgcolor: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.4)' },
  LOW: { label: 'LEVE / MONITOREO', color: '#22c55e', bgcolor: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)' },
};

export default function RecommendationCardWeb({ cards }) {
  if (!cards || typeof cards !== 'object') return null;

  const severityKey = (cards.severity || cards.triage || 'MEDIUM').toUpperCase();
  const severityCfg = SEVERITY_CONFIG[severityKey] || SEVERITY_CONFIG.MEDIUM;

  const species = cards.species || cards.detected_species || null;
  const recommendations = cards.recommendations || cards.triage_steps || [];
  const actionSteps = cards.action_steps || cards.actions || [];
  const businesses = cards.recommended_businesses || cards.businesses || [];

  // Do not render empty recommendation card if there are no items
  if (recommendations.length === 0 && actionSteps.length === 0 && businesses.length === 0) {
    return null;
  }

  return (
    <Card
      elevation={0}
      sx={{
        mt: 2,
        bgcolor: '#1e293b',
        borderRadius: 3,
        border: `1.5px solid ${severityCfg.border}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Header: Severidad + Especie */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberIcon sx={{ color: severityCfg.color, fontSize: 22 }} />
            <Typography variant="subtitle2" fontWeight={800} color={severityCfg.color} fontSize="0.9rem">
              Evaluación Médica Veterinaria
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {species && (
              <Chip
                icon={<PetsIcon style={{ color: '#94a3b8', fontSize: 16 }} />}
                label={`Especie: ${species}`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: '#e2e8f0', fontWeight: 600, fontSize: '0.75rem' }}
              />
            )}
            <Chip
              label={severityCfg.label}
              size="small"
              sx={{ bgcolor: severityCfg.bgcolor, color: severityCfg.color, fontWeight: 800, fontSize: '0.7rem', border: `1px solid ${severityCfg.border}` }}
            />
          </Box>
        </Box>

        {/* Recomendaciones / Triage */}
        {recommendations.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="#94a3b8" fontWeight={700} textTransform="uppercase" letterSpacing={0.5} mb={1} display="block">
              Recomendaciones Clínicas:
            </Typography>
            <List dense disablePadding>
              {recommendations.map((rec, i) => (
                <ListItem key={i} disableGutters sx={{ py: 0.4 }}>
                  <ListItemIcon sx={{ minWidth: 26 }}>
                    <CheckCircleOutlineIcon sx={{ color: '#38bdf8', fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" color="#f1f5f9" fontSize="0.85rem">{rec}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Pasos de Acción */}
        {actionSteps.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Divider sx={{ mb: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
            <Typography variant="caption" color="#94a3b8" fontWeight={700} textTransform="uppercase" letterSpacing={0.5} mb={1} display="block">
              Pasos Sugeridos:
            </Typography>
            <List dense disablePadding>
              {actionSteps.map((step, i) => (
                <ListItem key={i} disableGutters sx={{ py: 0.4 }}>
                  <ListItemIcon sx={{ minWidth: 26 }}>
                    <MedicalServicesIcon sx={{ color: '#22c55e', fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" color="#e2e8f0" fontSize="0.83rem">{step}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Agroveterinarias Recomendadas (Businessman) */}
        {businesses.length > 0 && <BusinessCardsWeb businesses={businesses} />}

        {/* Advertencia Profesional */}
        <Box sx={{ mt: 2, p: 1.25, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospitalIcon sx={{ color: '#fbbf24', fontSize: 18 }} />
          <Typography variant="caption" color="#94a3b8" fontSize="0.75rem">
            Esta evaluación es generada por el motor de IA AgroVet basado en evidencia veterinaria RAG. Consulte siempre a un profesional acreditado.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
