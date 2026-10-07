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
  Divider,
  Chip
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import UndoIcon from '@mui/icons-material/Undo';
import ForumIcon from '@mui/icons-material/Forum';
import { applyReportVerdict, revertReportVerdict } from '../../../services/endpoints/reports';

const VERDICT_OPTIONS = [
  { value: 'dismissed', label: 'Desestimar reporte', desc: 'El reporte no procede. La valoración del usuario queda válida.' },
  { value: 'neutralized', label: 'Neutralizar conflicto', desc: 'Ambos actuaron mal o falta evidencia. Rating efectivo se fija en 3 estrellas.' },
  { value: 'reported_at_fault', label: 'Reportado culpable (Consumidor)', desc: 'El consumidor actuó mal. Su rating ⭐1 queda removido/excluido.' },
  { value: 'reporter_at_fault', label: 'Reportante culpable (Especialista)', desc: 'El profesional actuó mal. La valoración del usuario permanece válida.' },
  { value: 'both_at_fault', label: 'Ambos culpables', desc: 'Conflicto mutuo. Rating efectivo ajustado a 3 estrellas.' },
];

const BAN_OPTIONS = [
  { value: 'none', label: 'No banear' },
  { value: 'reported', label: 'Banear usuario reportado' },
  { value: 'reporter', label: 'Banear usuario reportante' },
  { value: 'both', label: 'Banear a ambos' },
];

export default function ReportVerdictModal({ open, onClose, report, onSuccess }) {
  const [verdict, setVerdict] = useState('dismissed');
  const [banChoice, setBanChoice] = useState('none');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(false);

  if (!report) return null;

  const handleApplyVerdict = async () => {
    setLoading(true);
    setError(null);
    try {
      await applyReportVerdict(report.id, verdict, notes, banChoice);
      setLoading(false);
      onSuccess && onSuccess('Veredicto aplicado correctamente.');
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Error al aplicar el veredicto.');
    }
  };

  const handleRevertVerdict = async () => {
    setLoading(true);
    setError(null);
    try {
      await revertReportVerdict(report.id);
      setLoading(false);
      onSuccess && onSuccess('Veredicto revertido exitosamente.');
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Error al revertir el veredicto.');
    }
  };

  const messages = report.conversation_snapshot || [];

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
        <GavelIcon sx={{ color: '#fbbf24' }} />
        Resolución de Veredicto Auditado — Reporte #{report.id}
      </DialogTitle>

      <DialogContent sx={{ bgcolor: '#1e293b', color: '#e2e8f0', pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {messages.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ForumIcon />}
              onClick={() => setShowChat(!showChat)}
              sx={{ color: '#60a5fa', borderColor: '#60a5fa', mb: 1, textTransform: 'none' }}
            >
              {showChat ? 'Ocultar Chat Snapshot' : `Ver Conversación Registrada (${messages.length} msgs)`}
            </Button>
            {showChat && (
              <Box sx={{ maxHeight: 200, overflowY: 'auto', bgcolor: '#0f172a', p: 1.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
                {messages.map((m, i) => (
                  <Box key={i} sx={{ mb: 1, pb: 0.5, borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
                    <Typography variant="caption" color="#60a5fa" fontWeight={700}>
                      User #{m.sender_id} <span style={{ color: '#64748b' }}>({new Date(m.timestamp).toLocaleTimeString()})</span>:
                    </Typography>
                    <Typography variant="body2" color="#f8fafc" sx={{ whiteSpace: 'pre-line' }}>{m.content}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        <Typography variant="subtitle2" color="#fbbf24" fontWeight={700} mb={1}>
          1. Selecciona el Resultado del Veredicto:
        </Typography>
        <RadioGroup value={verdict} onChange={(e) => setVerdict(e.target.value)}>
          {VERDICT_OPTIONS.map((opt) => (
            <FormControlLabel
              key={opt.value}
              value={opt.value}
              control={<Radio sx={{ color: '#64748b', '&.Mui-checked': { color: '#fbbf24' } }} />}
              label={
                <Box>
                  <Typography variant="body2" fontWeight={700} color="#fff">{opt.label}</Typography>
                  <Typography variant="caption" color="#94a3b8">{opt.desc}</Typography>
                </Box>
              }
              sx={{ mb: 1 }}
            />
          ))}
        </RadioGroup>

        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Typography variant="subtitle2" color="#fbbf24" fontWeight={700} mb={1}>
          2. Consecuencia de Baneo:
        </Typography>
        <RadioGroup row value={banChoice} onChange={(e) => setBanChoice(e.target.value)}>
          {BAN_OPTIONS.map((opt) => (
            <FormControlLabel
              key={opt.value}
              value={opt.value}
              control={<Radio sx={{ color: '#64748b', '&.Mui-checked': { color: '#ef4444' } }} />}
              label={<Typography variant="body2" color="#fff">{opt.label}</Typography>}
            />
          ))}
        </RadioGroup>

        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Typography variant="subtitle2" color="#fbbf24" fontWeight={700} mb={1}>
          3. Notas Internas de la Resolución:
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Escribe el motivo del veredicto o hallazgos..."
          sx={{ bgcolor: '#0f172a', input: { color: '#fff' }, textarea: { color: '#fff' } }}
        />
      </DialogContent>

      <DialogActions sx={{ bgcolor: '#0f172a', p: 2, justifyContent: 'space-between' }}>
        {report.verdict && report.verdict !== 'none' ? (
          <Button
            color="warning"
            startIcon={<UndoIcon />}
            onClick={handleRevertVerdict}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Revertir Veredicto Anterior
          </Button>
        ) : <Box />}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} disabled={loading} sx={{ color: '#94a3b8', textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleApplyVerdict}
            disabled={loading}
            sx={{ bgcolor: '#fbbf24', color: '#0f172a', fontWeight: 700, '&:hover': { bgcolor: '#f59e0b' }, textTransform: 'none' }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Emitir Veredicto'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
