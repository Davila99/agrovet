/**
 * HistorialEnviosModal — Muestra la línea de tiempo de envíos y revisiones de verificación.
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import VerifiedIcon from '@mui/icons-material/Verified';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { getValidationHistory } from '../../../services/endpoints/profiles';

export default function HistorialEnviosModal({ open, onClose, userId, name }) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      setError(null);
      getValidationHistory(userId)
        .then((data) => {
          setHistory(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          setError(err.message || 'Error al cargar el historial');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, userId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#1e293b',
          color: '#f8fafc',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.1)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon sx={{ color: '#60a5fa' }} />
        <Box>
          <Typography variant="h6" fontWeight={700} fontSize="1.05rem">
            Historial de envíos de verificación
          </Typography>
          <Typography variant="caption" color="#94a3b8">
            {name || `Especialista #${userId}`}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)', py: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : error ? (
          <Typography color="#ef4444" textAlign="center" py={2}>
            {error}
          </Typography>
        ) : history.length === 0 ? (
          <Typography color="#94a3b8" textAlign="center" py={3}>
            No hay registros de envíos anteriores.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {history.map((item, index) => {
              const isApproved = item.status === 'approved';
              const isRejected = item.status === 'rejected';

              let chipProps = {
                label: 'Pendiente',
                color: '#fbbf24',
                bgcolor: 'rgba(251,191,36,0.15)',
                icon: <HourglassEmptyIcon sx={{ fontSize: '0.9rem' }} />,
              };
              if (isApproved) {
                chipProps = {
                  label: 'Validado',
                  color: '#22c55e',
                  bgcolor: 'rgba(34,197,94,0.15)',
                  icon: <VerifiedIcon sx={{ fontSize: '0.9rem' }} />,
                };
              } else if (isRejected) {
                chipProps = {
                  label: 'Rechazado',
                  color: '#ef4444',
                  bgcolor: 'rgba(239,68,68,0.15)',
                  icon: <CancelIcon sx={{ fontSize: '0.9rem' }} />,
                };
              }

              const createdDate = item.created_at
                ? new Date(item.created_at).toLocaleString()
                : '—';
              const reviewedDate = item.reviewed_at
                ? new Date(item.reviewed_at).toLocaleString()
                : null;

              return (
                <Box
                  key={item.id || index}
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.2)',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="#94a3b8" fontWeight={600}>
                      Envío: {createdDate}
                    </Typography>
                    <Chip
                      icon={chipProps.icon}
                      label={chipProps.label}
                      size="small"
                      sx={{
                        bgcolor: chipProps.bgcolor,
                        color: chipProps.color,
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        height: 22,
                        border: `1px solid ${chipProps.color}44`,
                      }}
                    />
                  </Box>

                  {item.user_comment && (
                    <Box sx={{ mb: 1, p: 1, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 }}>
                      <Typography variant="caption" color="#64748b" display="block">
                        Observación del usuario:
                      </Typography>
                      <Typography variant="body2" color="#e2e8f0" fontSize="0.8rem">
                        "{item.user_comment}"
                      </Typography>
                    </Box>
                  )}

                  {item.admin_comment && (
                    <Box sx={{ p: 1, bgcolor: 'rgba(239,68,68,0.08)', borderLeft: '3px solid #ef4444', borderRadius: 1 }}>
                      <Typography variant="caption" color="#ef4444" fontWeight={600} display="block">
                        Motivo / Respuesta de administración:
                      </Typography>
                      <Typography variant="body2" color="#fca5a5" fontSize="0.8rem">
                        "{item.admin_comment}"
                      </Typography>
                    </Box>
                  )}

                  {reviewedDate && (
                    <Typography variant="caption" color="#64748b" display="block" sx={{ mt: 1, fontSize: '0.65rem' }}>
                      Revisado el: {reviewedDate}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 1.5 }}>
        <Button onClick={onClose} variant="outlined" sx={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)' }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
