/**
 * ReportCard — Card para visualizar reportes agrupados por usuario en el panel admin.
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
  CircularProgress,
} from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GavelIcon from '@mui/icons-material/Gavel';
import ReportVerdictModal from './ReportVerdictModal';

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: '#fbbf24', bgcolor: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.4)' },
  resolved: { label: 'Resuelto', color: '#22c55e', bgcolor: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)' },
  dismissed: { label: 'Desestimado', color: '#94a3b8', bgcolor: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)' },
};

export default function ReportCard({ reportsGroup: propGroup, report: singleReport, onUpdateBatchStatus, onUpdateStatus }) {
  const [loading, setLoading] = useState(false);
  const [verdictModalOpen, setVerdictModalOpen] = useState(false);

  const reportsGroup = propGroup || (singleReport ? [singleReport] : []);
  const mainReport = reportsGroup[0] || {};
  const reported = mainReport.reported_user || {};
  const reportedName = reported.full_name || `Usuario #${mainReport.reported_user_id}`;
  
  const formatPhone = (phone) => {
    if (!phone) return null;
    return phone.startsWith('+') ? phone : `+591 ${phone}`;
  };
  const reportedPhone = formatPhone(reported.phone_number);

  const handleAction = async (newStatus, banUser = false) => {
    if (banUser) {
      if (!window.confirm('¿Estás seguro de que quieres BANEAR definitivamente al usuario reportado? Esta acción suspenderá su cuenta.')) return;
    }
    setLoading(true);
    try {
      const reportIds = reportsGroup.map(r => r.id);
      if (onUpdateBatchStatus) {
        await onUpdateBatchStatus(reportIds, newStatus, banUser);
      } else if (onUpdateStatus) {
        await onUpdateStatus(mainReport.id, newStatus);
      }
    } finally {
      setLoading(false);
    }
  };

  const statusCfg = STATUS_CONFIG[mainReport.status] || STATUS_CONFIG.pending;
  const createdDate = mainReport.created_at ? new Date(mainReport.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: '#1e293b',
        borderRadius: 3,
        border: `1.5px solid ${statusCfg.border}`,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          borderColor: statusCfg.color,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Top bar: Estado */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReportProblemIcon sx={{ color: '#ef4444', fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={700} color="#f1f5f9" fontSize="0.9rem">
              {reportsGroup.length > 1 ? `${reportsGroup.length} Reportes Agrupados` : mainReport.reason_label || mainReport.reason_display || mainReport.reason}
            </Typography>
          </Box>
          <Chip
            label={statusCfg.label}
            size="small"
            sx={{
              bgcolor: statusCfg.bgcolor,
              color: statusCfg.color,
              fontWeight: 700,
              fontSize: '0.7rem',
              border: `1px solid ${statusCfg.border}`,
            }}
          />
        </Box>

        {/* Reportado */}
        <Box sx={{ mb: 2, bgcolor: 'rgba(0,0,0,0.2)', p: 1.5, borderRadius: 2 }}>
          <Typography variant="caption" color="#64748b" fontWeight={700} textTransform="uppercase" fontSize="0.65rem">
            Usuario Reportado:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Avatar src={reported.profile_picture} sx={{ width: 32, height: 32, border: '1.5px solid #ef4444' }}>
              {!reported.profile_picture && <PersonIcon fontSize="small" />}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} color="#fca5a5" noWrap fontSize="0.85rem">
                {reportedName}
              </Typography>
              {reportedPhone && (
                <Typography variant="caption" color="#94a3b8" display="block" fontSize="0.7rem">
                  {reportedPhone}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Lista de Reportes actuales */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="#94a3b8" display="block" fontWeight={600} mb={1}>
            Denuncias ({reportsGroup.length}):
          </Typography>
          {reportsGroup.map((r, idx) => {
            const rep = r.reporter_user || {};
            const repName = rep.full_name || `Usuario #${r.reporter_user_id}`;
            return (
              <Box key={r.id} sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 1.25, borderRadius: 1.5, borderLeft: '3px solid #ef4444', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Avatar src={rep.profile_picture} sx={{ width: 20, height: 20 }}>
                    {!rep.profile_picture && <PersonIcon sx={{ fontSize: 14 }} />}
                  </Avatar>
                  <Typography variant="caption" color="#e2e8f0" display="block" fontWeight={700} fontSize="0.75rem">
                    {repName}: <span style={{ fontWeight: 400, color: '#cbd5e1' }}>{r.reason_label || r.reason_display || r.reason}</span>
                  </Typography>
                </Box>
                {r.details && (
                  <Typography variant="body2" color="#94a3b8" fontSize="0.75rem" fontStyle="italic" mt={0.5} ml={3.5}>
                    "{r.details}"
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Historial de reportes */}
        {mainReport.reported_user_history && mainReport.reported_user_history.length > 0 && (
          <Box sx={{ mb: 2, bgcolor: 'rgba(0,0,0,0.2)', p: 1.5, borderRadius: 2 }}>
            <Typography variant="caption" color="#fbbf24" fontWeight={700} display="block" mb={1} textTransform="uppercase" fontSize="0.65rem">
              <ReportProblemIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5, color: '#fbbf24' }} />
              Historial Pasado (Resoluciones)
            </Typography>
            {(() => {
              const histGroupsMap = new Map();
              mainReport.reported_user_history.forEach(h => {
                const key = h.resolved_at ? new Date(h.resolved_at).getTime().toString() : h.created_at;
                if (!histGroupsMap.has(key)) histGroupsMap.set(key, { ...h, count: 0 });
                histGroupsMap.get(key).count += 1;
              });
              const histGroups = Array.from(histGroupsMap.values());
              return histGroups.map((hist, idx) => (
                <Box key={hist.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: idx === histGroups.length - 1 ? 0 : 0.75, borderBottom: idx === histGroups.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', pb: idx === histGroups.length - 1 ? 0 : 0.75 }}>
                  <Box>
                    <Typography variant="caption" color="#e2e8f0" fontWeight={600} display="block" fontSize="0.75rem">
                      {hist.reason_label || hist.reason} {hist.count > 1 ? `(x${hist.count} reportes)` : ''}
                    </Typography>
                    <Typography variant="caption" color="#64748b" fontSize="0.65rem">
                      {hist.resolved_at ? new Date(hist.resolved_at).toLocaleDateString() : (hist.created_at ? new Date(hist.created_at).toLocaleDateString() : '—')}
                    </Typography>
                  </Box>
                  <Chip
                    label={STATUS_CONFIG[hist.status]?.label || hist.status}
                    size="small"
                    sx={{
                      bgcolor: STATUS_CONFIG[hist.status]?.bgcolor || 'transparent',
                      color: STATUS_CONFIG[hist.status]?.color || '#fff',
                      height: 16,
                      fontSize: '0.6rem',
                      fontWeight: 700,
                    }}
                  />
                </Box>
              ));
            })()}
          </Box>
        )}

        {/* Fecha */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#64748b', fontSize: '0.75rem', mb: 2 }}>
          <CalendarTodayIcon sx={{ fontSize: 14 }} />
          <span>Último reporte: {createdDate}</span>
        </Box>

        <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.06)' }} />

        {/* Acciones */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            sx={{
              flex: 1,
              bgcolor: '#fbbf24',
              color: '#0f172a',
              '&:hover': { bgcolor: '#f59e0b' },
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: 2,
              textTransform: 'none',
              minWidth: '30%',
            }}
            variant="contained"
            startIcon={<GavelIcon />}
            onClick={() => setVerdictModalOpen(true)}
          >
            Veredicto / Auditar
          </Button>

          <Button
            sx={{
              flex: 1,
              bgcolor: '#16a34a',
              '&:hover': { bgcolor: '#15803d' },
              '&:disabled': { bgcolor: 'rgba(22,163,74,0.3)', color: 'rgba(255,255,255,0.4)' },
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: 2,
              textTransform: 'none',
              minWidth: '30%',
            }}
            variant="contained"
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
            disabled={loading || mainReport.status === 'resolved'}
            onClick={() => handleAction('resolved')}
          >
            {mainReport.status === 'resolved' ? 'Resuelto' : 'Resolver'}
          </Button>

          <Button
            sx={{
              flex: 1,
              bgcolor: '#ef4444',
              '&:hover': { bgcolor: '#dc2626' },
              '&:disabled': { bgcolor: 'rgba(239,68,68,0.3)', color: 'rgba(255,255,255,0.4)' },
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: 2,
              textTransform: 'none',
              minWidth: '30%',
            }}
            variant="contained"
            startIcon={<BlockIcon />}
            disabled={loading || mainReport.status === 'resolved'}
            onClick={() => handleAction('resolved', true)}
          >
            Banear
          </Button>

          <Button
            sx={{
              flex: 1,
              borderColor: 'rgba(148,163,184,0.4)',
              color: '#94a3b8',
              '&:hover': { bgcolor: 'rgba(148,163,184,0.1)', borderColor: '#94a3b8' },
              '&:disabled': { borderColor: 'rgba(148,163,184,0.15)', color: 'rgba(148,163,184,0.3)' },
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: 2,
              textTransform: 'none',
              minWidth: '30%',
            }}
            variant="outlined"
            disabled={loading || mainReport.status === 'dismissed'}
            onClick={() => handleAction('dismissed')}
          >
            Desestimar
          </Button>
        </Box>

        <ReportVerdictModal
          open={verdictModalOpen}
          onClose={() => setVerdictModalOpen(false)}
          report={mainReport}
          onSuccess={() => {
            if (onUpdateStatus && mainReport.id) {
              onUpdateStatus(mainReport.id, 'resolved');
            }
          }}
        />
      </CardContent>
    </Card>
  );
}
