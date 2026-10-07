import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Rating,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

export default function ConsultationEndModal({
  open,
  onClose,
  consultation,
  userRole, // 'consumer', 'specialist', or 'businessman'
  targetUserId, // the other user's ID
  onComplete,
  rateConsultationApi,
  createReportApi,
  token
}) {
  const [stars, setStars] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [wantReport, setWantReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const isConsumer = (userRole || '').toString().toLowerCase() === 'consumer';

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (isConsumer) {
        // 1. Submit star rating
        await rateConsultationApi(
          consultation?.id,
          targetUserId,
          stars,
          token
        );

        // 2. Submit report if consumer selected report (or rated <= 2 stars with report checked)
        if ((stars <= 2 && wantReport) || wantReport) {
          const details = feedback.trim() || 'El cliente reportó mala experiencia en la consulta.';
          await createReportApi(
            targetUserId,
            'unprofessional_behavior',
            details,
            consultation?.id,
            token
          );
        }
      } else {
        // Specialist or Businessman evaluating client
        if (wantReport) {
          const details = reportReason.trim() || 'El profesional reportó comportamiento indebido del cliente.';
          await createReportApi(
            targetUserId,
            'abusive_chat',
            details,
            consultation?.id,
            token
          );
        }
      }

      onComplete();
    } catch (err) {
      console.error('Error finalizando consulta:', err);
      setErrorMsg(err.message || 'Error guardando la evaluación.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? null : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {isConsumer ? '⭐ Calificar Consulta' : '📋 Finalizar Consulta'}
      </DialogTitle>

      <DialogContent dividers>
        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

        {isConsumer ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 1 }}>
            <Typography variant="body2" textAlign="center" color="text.secondary">
              ¿Cómo fue tu experiencia con el profesional en esta consulta?
            </Typography>

            <Rating
              value={stars}
              onChange={(e, val) => setStars(val || 1)}
              size="large"
              emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
            />

            {stars <= 2 && (
              <Box sx={{ width: '100%', mt: 1 }}>
                <Typography variant="caption" color="error.main" fontWeight={600}>
                  Lamentamos que la experiencia no fuera satisfactoria.
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  placeholder="¿Por qué la consulta obtuvo esta calificación?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  sx={{ mt: 1 }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={wantReport}
                      onChange={(e) => setWantReport(e.target.checked)}
                      color="error"
                    />
                  }
                  label={
                    <Typography variant="caption" color="text.primary">
                      Enviar reporte formal para revisión de administradores
                    </Typography>
                  }
                  sx={{ mt: 1 }}
                />
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Has terminado la sesión de atención con el cliente.
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={wantReport}
                  onChange={(e) => setWantReport(e.target.checked)}
                  color="error"
                />
              }
              label={
                <Typography variant="body2" fontWeight={600} color={wantReport ? 'error.main' : 'text.primary'}>
                  ¿El cliente tuvo un mal comportamiento o falta de respeto?
                </Typography>
              }
            />

            {wantReport && (
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                label="Detalles de la conducta del cliente"
                placeholder="Describe la falta de respeto o incumplimiento para auditoría de administradores..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={submitting} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          color={wantReport ? 'error' : 'primary'}
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : (wantReport ? <ReportProblemIcon /> : null)}
        >
          {submitting ? 'Procesando...' : (wantReport ? 'Guardar y Reportar' : 'Enviar y Finalizar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
