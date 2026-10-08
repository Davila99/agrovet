/**
 * ReportUserModal — Modal para que un usuario reporte a otro usuario.
 * Opciones comunes de razón + campo de detalle adicional.
 */
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Box,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CloseIcon from '@mui/icons-material/Close';
import { createReport } from '../../../../services/endpoints/reports';

const REPORT_REASONS = [
  { value: 'spam', label: '📢 Spam o publicidad no deseada', desc: 'Envío de mensajes masivos o anuncios irrelevantes' },
  { value: 'harassment', label: '🤬 Acoso o comportamiento ofensivo', desc: 'Insultos, amenazas o lenguaje inapropiado' },
  { value: 'fake_profile', label: '👤 Perfil falso o suplantación', desc: 'Nombre, profesión o credenciales falsas' },
  { value: 'fraud', label: '⚠️ Estafa o actividad fraudulenta', desc: 'Intento de cobro engañoso o fraude comercial' },
  { value: 'unauthorized_practice', label: '🏥 Ejercicio ilegal o mala praxis', desc: 'Ofrecer servicios veterinarios sin titulación' },
  { value: 'other', label: '📝 Otro motivo', desc: 'Especifica la razón en los comentarios' },
];

export default function ReportUserModal({ open, onClose, reportedUser, onSuccess }) {
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!reportedUser) return null;

  const handleClose = () => {
    if (loading) return;
    setError(null);
    setSuccess(false);
    setDetails('');
    setReason('spam');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createReport(reportedUser.id || reportedUser.user_id, reason, details);
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'No se pudo enviar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  const userName = reportedUser.full_name || reportedUser.name || `Usuario #${reportedUser.id || reportedUser.user_id}`;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: '#0f172a',
          color: '#f1f5f9',
          border: '1px solid rgba(255,255,255,0.08)',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#1e293b', py: 1.5, px: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReportProblemIcon sx={{ color: '#ef4444' }} />
          <Typography variant="h6" fontWeight={700} color="#f1f5f9" fontSize="1.05rem">
            Reportar Usuario
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose} disabled={loading} sx={{ color: '#94a3b8' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 2.5 }}>
          {success ? (
            <Alert severity="success" sx={{ bgcolor: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
              ¡Reporte enviado exitosamente! Los administradores lo revisarán pronto.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="#94a3b8" mb={2}>
                Estás reportando a <strong style={{ color: '#f1f5f9' }}>{userName}</strong>. Selecciona el motivo principal:
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                  {error}
                </Alert>
              )}

              <RadioGroup value={reason} onChange={(e) => setReason(e.target.value)}>
                {REPORT_REASONS.map((item) => (
                  <Box
                    key={item.value}
                    onClick={() => setReason(item.value)}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      p: 1.25,
                      mb: 1,
                      borderRadius: 2,
                      bgcolor: reason === item.value ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)',
                      border: reason === item.value ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' },
                    }}
                  >
                    <FormControlLabel
                      value={item.value}
                      control={<Radio size="small" sx={{ color: '#64748b', '&.Mui-checked': { color: '#ef4444' } }} />}
                      label={
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} color="#f1f5f9" fontSize="0.85rem">
                            {item.label}
                          </Typography>
                          <Typography variant="caption" color="#64748b" fontSize="0.75rem">
                            {item.desc}
                          </Typography>
                        </Box>
                      }
                      sx={{ margin: 0, width: '100%' }}
                    />
                  </Box>
                ))}
              </RadioGroup>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="#94a3b8" fontWeight={600} mb={0.5} display="block">
                  Detalles adicionales (opcional):
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Describe brevemente lo sucedido..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    sx: { bgcolor: '#1e293b', color: '#f1f5f9', fontSize: '0.85rem', borderRadius: 2 },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ef4444' },
                  }}
                />
              </Box>
            </>
          )}
        </DialogContent>

        {!success && (
          <DialogActions sx={{ p: 2, bgcolor: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Button onClick={handleClose} disabled={loading} sx={{ color: '#94a3b8', textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ReportProblemIcon />}
              sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
            >
              Enviar Reporte
            </Button>
          </DialogActions>
        )}
      </Box>
    </Dialog>
  );
}
