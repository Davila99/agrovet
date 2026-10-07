/**
 * ValidacionCard — Card individual de un especialista pendiente de validación.
 * Muestra documentos de verificación, historial de envíos y botones de Validar/Rechazar.
 */
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import BadgeIcon from '@mui/icons-material/Badge';
import HistoryIcon from '@mui/icons-material/History';
import DocumentViewer from './DocumentViewer';
import HistorialEnviosModal from './HistorialEnviosModal';

const DOC_ICON_MAP = {
  title: <SchoolIcon fontSize="small" sx={{ color: '#94a3b8' }} />,
  student: <BadgeIcon fontSize="small" sx={{ color: '#94a3b8' }} />,
  graduated: <WorkIcon fontSize="small" sx={{ color: '#94a3b8' }} />,
};

const DOC_LABEL_MAP = { title: 'Título', student: 'Carnet', graduated: 'Carta' };

function DocThumbnail({ doc, docType, onClick }) {
  if (!doc) return null;
  const isImage = doc.url && /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.url);
  return (
    <Tooltip title={`Ver ${DOC_LABEL_MAP[docType]}`} arrow placement="top">
      <Box
        onClick={() => onClick(doc, docType)}
        sx={{
          cursor: 'pointer', borderRadius: 2, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)', width: 56, height: 56,
          flexShrink: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.25)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': { borderColor: '#60a5fa', bgcolor: 'rgba(96,165,250,0.1)', transform: 'translateY(-2px)' },
        }}
      >
        {isImage ? (
          <Box component="img" src={doc.url} alt={DOC_LABEL_MAP[docType]} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <>
            {DOC_ICON_MAP[docType]}
            <Typography variant="caption" color="#cbd5e1" sx={{ fontSize: '0.55rem', mt: 0.5, lineHeight: 1, textAlign: 'center', px: 0.5 }}>
              {DOC_LABEL_MAP[docType]}
            </Typography>
          </>
        )}
      </Box>
    </Tooltip>
  );
}

export default function ValidacionCard({ specialist, onValidate }) {
  const [loading, setLoading] = useState(false);
  const [viewerDoc, setViewerDoc] = useState(null);
  const [viewerType, setViewerType] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const user = specialist?.user || {};
  const name = user.full_name || `Usuario #${specialist.user_id}`;
  const avatar = user.profile_picture || '';
  
  const status = specialist.verification_status || 'unverified';
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  
  let chipProps = { label: 'Pendiente', color: '#fbbf24', bgcolor: 'rgba(251,191,36,0.15)' };
  if (isApproved) {
      chipProps = { label: 'Validado', color: '#22c55e', bgcolor: 'rgba(34,197,94,0.15)', icon: <VerifiedIcon sx={{ fontSize: '0.9rem' }}/> };
  } else if (isRejected) {
      chipProps = { label: 'Rechazado', color: '#ef4444', bgcolor: 'rgba(239,68,68,0.15)', icon: <CancelIcon sx={{ fontSize: '0.9rem' }}/> };
  }

  const docs = [
    { key: 'title', doc: specialist.verification_title },
    { key: 'student', doc: specialist.verification_student_card },
    { key: 'graduated', doc: specialist.verification_graduation_letter },
  ].filter((d) => d.doc);

  const handleAction = async (newStatus, comment = '') => {
    setLoading(true);
    try {
      await onValidate(specialist.user_id, newStatus, comment);
    } finally {
      setLoading(false);
      setRejectionDialogOpen(false);
    }
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          bgcolor: '#1e293b', borderRadius: 3, display: 'flex', flexDirection: 'column',
          border: isApproved ? '1px solid rgba(34,197,94,0.3)' : isRejected ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.05)',
          transition: 'all 0.2s', '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.4)', transform: 'translateY(-2px)' },
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
            <Avatar src={avatar} sx={{ width: 44, height: 44, border: '2px solid rgba(255,255,255,0.05)' }}>
              {!avatar && <PersonIcon />}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700} color="#f8fafc" noWrap sx={{ fontSize: '0.9rem', mb: 0.25 }}>
                {name}
              </Typography>
              <Typography variant="caption" color="#94a3b8" display="block" noWrap>
                {specialist.profession || 'Especialista'}
              </Typography>
              <Typography variant="caption" color="#64748b" display="block">
                Nivel: {specialist.education_level === 'graduated' ? 'Egresado' : specialist.education_level === 'title' ? 'Titulado' : 'Estudiante'}
              </Typography>
            </Box>
            <Chip icon={chipProps.icon} label={chipProps.label} size="small"
              sx={{ bgcolor: chipProps.bgcolor, color: chipProps.color, fontWeight: 700, fontSize: '0.65rem', height: 24 }} />
          </Box>

          {specialist.verification_comment && (
            <Box sx={{ bgcolor: 'rgba(0,0,0,0.15)', p: 1.25, borderRadius: 2, mb: 1.5, borderLeft: '2px solid #60a5fa' }}>
                <Typography variant="caption" color="#94a3b8" fontWeight="600" display="block" mb={0.25} sx={{ fontSize: '0.65rem' }}>
                    MENSAJE ADJUNTO
                </Typography>
                <Typography variant="body2" color="#e2e8f0" sx={{ fontStyle: 'italic', fontSize: '0.75rem' }}>
                    "{specialist.verification_comment}"
                </Typography>
            </Box>
          )}

          {specialist.verification_admin_comment && isRejected && (
            <Box sx={{ bgcolor: 'rgba(239,68,68,0.1)', p: 1.25, borderRadius: 2, mb: 1.5, borderLeft: '2px solid #ef4444' }}>
                <Typography variant="caption" color="#ef4444" fontWeight="600" display="block" mb={0.25} sx={{ fontSize: '0.65rem' }}>
                    MOTIVO DE RECHAZO
                </Typography>
                <Typography variant="body2" color="#fca5a5" sx={{ fontSize: '0.75rem' }}>
                    "{specialist.verification_admin_comment}"
                </Typography>
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="#64748b" fontWeight={600} sx={{ fontSize: '0.65rem' }}>
              DOCUMENTOS ({docs.length})
            </Typography>
            <Button size="small" startIcon={<HistoryIcon sx={{ fontSize: '0.85rem' }} />} onClick={() => setHistoryOpen(true)}
              sx={{ color: '#60a5fa', fontSize: '0.7rem', textTransform: 'none', p: 0, minWidth: 'auto' }}>
              Historial de envíos
            </Button>
          </Box>

          {docs.length > 0 ? (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
              {docs.map(({ key, doc }) => (
                <DocThumbnail key={key} doc={doc} docType={key} onClick={(d, t) => { setViewerDoc(d); setViewerType(t); }} />
              ))}
            </Box>
          ) : (
            <Box sx={{ py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2, mb: 1.5 }}>
              <Typography variant="caption" color="#475569">Sin documentos</Typography>
            </Box>
          )}

          <Divider sx={{ mb: 1.5, borderColor: 'rgba(255,255,255,0.05)' }} />

          <Box sx={{ display: 'flex', gap: 1 }}>
            {(isApproved || isRejected) ? (
              <Button fullWidth variant="outlined" startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <HistoryIcon sx={{ fontSize: '1rem' }}/>}
                disabled={loading} onClick={() => handleAction('pending', 'Estado revertido a pendiente')}
                sx={{ borderColor: 'rgba(251,191,36,0.5)', color: '#fbbf24', '&:hover': { bgcolor: 'rgba(251,191,36,0.1)' }, fontWeight: 700, fontSize: '0.75rem', borderRadius: 2, textTransform: 'none', py: 0.75 }}>
                Revertir a Pendiente
              </Button>
            ) : (
              <>
                <Button fullWidth variant="contained" startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <VerifiedIcon sx={{ fontSize: '1rem' }}/>}
                  disabled={loading} onClick={() => handleAction('approved')}
                  sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, fontWeight: 700, fontSize: '0.75rem', borderRadius: 2, textTransform: 'none', py: 0.75 }}>
                  Validar
                </Button>
                <Button fullWidth variant="outlined" startIcon={<CancelIcon sx={{ fontSize: '1rem' }}/>}
                  disabled={loading} onClick={() => setRejectionDialogOpen(true)}
                  sx={{ borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' }, fontWeight: 700, fontSize: '0.75rem', borderRadius: 2, textTransform: 'none', py: 0.75 }}>
                  Rechazar
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      <Dialog open={rejectionDialogOpen} onClose={() => setRejectionDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: '#1e293b', color: '#f8fafc', borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1, color: '#ef4444', fontWeight: 700, fontSize: '1rem' }}>Motivo de Rechazo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#94a3b8" mb={1.5} fontSize="0.8rem">
            Indica al especialista por qué su documento fue rechazado:
          </Typography>
          <TextField autoFocus fullWidth multiline rows={3} placeholder="Ej: La imagen no es legible..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1, '& .MuiInputBase-root': { color: '#f8fafc', fontSize: '0.85rem' } }} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectionDialogOpen(false)} sx={{ color: '#94a3b8' }}>Cancelar</Button>
          <Button onClick={() => handleAction('rejected', rejectionReason)} variant="contained" disabled={loading || !rejectionReason.trim()} sx={{ bgcolor: '#ef4444', fontWeight: 700, '&.Mui-disabled': { bgcolor: 'rgba(239,68,68,0.5)', color: 'rgba(255,255,255,0.5)' } }}>
            {loading ? <CircularProgress size={16} color="inherit" /> : 'Confirmar Rechazo'}
          </Button>
        </DialogActions>
      </Dialog>

      <DocumentViewer open={!!viewerDoc} onClose={() => { setViewerDoc(null); setViewerType(null); }} document={viewerDoc} docType={viewerType} />
      <HistorialEnviosModal open={historyOpen} onClose={() => setHistoryOpen(false)} userId={specialist.user_id} name={name} />
    </>
  );
}
