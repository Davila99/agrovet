/**
 * ReportesPage — Panel de administración para visualizar y gestionar reportes de usuario.
 * Escucha actualizaciones WebSocket en tiempo real e integra notificaciones con sonido.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  Chip,
  Alert,
  Skeleton,
  TextField,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import ReportCard from './ReportCard';
import { getAdminReports, updateBatchReportStatus, getReportStats } from '../../../services/endpoints/reports';
import { useAdminNotifications } from '../../../hooks/useAdminNotifications';
import { playNotifySound } from '../../../services/sound';

function StatsBar({ stats, loading }) {
  const items = [
    { label: 'Total reportes', value: stats?.total ?? '—', color: '#60a5fa', icon: <ReportProblemIcon fontSize="small" /> },
    { label: 'Pendientes', value: stats?.pending ?? '—', color: '#fbbf24', icon: <HourglassEmptyIcon fontSize="small" /> },
    { label: 'Resueltos', value: stats?.resolved ?? '—', color: '#22c55e', icon: <CheckCircleIcon fontSize="small" /> },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
      {items.map((item) => (
        <Box
          key={item.label}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            bgcolor: '#1e293b', borderRadius: 2, px: 2, py: 1,
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Box sx={{ color: item.color }}>{item.icon}</Box>
          {loading ? (
            <Skeleton width={30} height={20} sx={{ bgcolor: '#334155' }} />
          ) : (
            <Typography fontWeight={700} color={item.color} fontSize="1.1rem">
              {item.value}
            </Typography>
          )}
          <Typography variant="caption" color="#64748b" fontWeight={500}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function ReportesPage() {
  const [tab, setTab] = useState(0); // 0=Pendientes, 1=Todos
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filter = tab === 0 ? 'pending' : '';
      const [reportsRes, statsRes] = await Promise.all([
        getAdminReports(filter),
        getReportStats(),
      ]);
      setReports(reportsRes || []);
      setStats(statsRes);
    } catch (e) {
      setError(e.message || 'Error al cargar reportes.');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useAdminNotifications((payload) => {
    if (payload.type === 'new_report') {
      console.log('[WS] ¡Nuevo reporte recibido!', payload);
      setToast('🚨 ¡Nuevo reporte de usuario recibido!');
      fetchData();
    }
  });

  const handleUpdateBatchStatus = async (reportIds, newStatus, banUser = false) => {
    await updateBatchReportStatus(reportIds, newStatus, banUser);
    await fetchData();
  };

  const filtered = reports.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const reporter = (r.reporter_user?.full_name || '').toLowerCase();
    const reported = (r.reported_user?.full_name || '').toLowerCase();
    const reason = (r.reason_label || r.reason || '').toLowerCase();
    return reporter.includes(q) || reported.includes(q) || reason.includes(q);
  });

  const groupedReportsMap = new Map();
  filtered.forEach(r => {
    if (!groupedReportsMap.has(r.reported_user_id)) {
      groupedReportsMap.set(r.reported_user_id, []);
    }
    groupedReportsMap.get(r.reported_user_id).push(r);
  });
  
  let groupedFiltered = Array.from(groupedReportsMap.values());
  if (tab === 2) {
    // Filtrar solo grupos donde el usuario está baneado o resuelto con baneo
    groupedFiltered = groupedFiltered.filter(g => 
      g[0]?.reported_user?.is_active === false || g.some(r => r.status === 'resolved')
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', overflowY: 'auto', bgcolor: '#0f172a', color: '#f1f5f9' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <ReportProblemIcon sx={{ color: '#ef4444', fontSize: 28 }} />
          <Typography variant="h5" fontWeight={800} color="#f1f5f9">
            Reportes de Usuarios
          </Typography>
        </Box>
        <Typography variant="body2" color="#64748b">
          Revisa y gestiona los reportes sobre conducta o perfiles inapropiados en tiempo real.
        </Typography>
      </Box>

      {/* Stats */}
      <StatsBar stats={stats} loading={loading && !stats} />

      {/* Tabs + Búsqueda */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': { color: '#64748b', fontWeight: 600, textTransform: 'none', fontSize: '0.9rem' },
            '& .Mui-selected': { color: '#ef4444' },
            '& .MuiTabs-indicator': { bgcolor: '#ef4444' },
          }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Pendientes
                {stats?.pending > 0 && (
                  <Chip label={stats.pending} size="small" sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 700, height: 18, fontSize: '0.65rem' }} />
                )}
              </Box>
            }
          />
          <Tab label="Todos" />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🚫 Baneados / Resueltos
              </Box>
            }
          />
        </Tabs>

        <TextField
          size="small"
          placeholder="Buscar reportado o reportante..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#64748b', fontSize: 18 }} /></InputAdornment>,
            sx: { bgcolor: '#1e293b', borderRadius: 2, color: '#f1f5f9', fontSize: '0.85rem' },
          }}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.08)' },
            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(239,68,68,0.4)' },
            '& .MuiInputBase-input': { color: '#f1f5f9' },
            width: { xs: '100%', sm: 280 },
          }}
        />
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, bgcolor: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
          {error}
        </Alert>
      )}

      {/* Toast Notificación */}
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} message={toast} />

      {/* Grid de Cards */}
      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} lg={4} key={i}>
              <Skeleton variant="rectangular" height={220} sx={{ bgcolor: '#1e293b', borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : groupedFiltered.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, opacity: 0.5 }}>
          <ReportProblemIcon sx={{ fontSize: 56, color: '#334155', mb: 2 }} />
          <Typography color="#475569" fontWeight={600}>
            {search ? 'No se encontraron reportes' : tab === 0 ? '¡No hay reportes pendientes! 🎉' : 'No hay reportes registrados.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {groupedFiltered.map((group) => (
            <Grid item xs={12} sm={6} lg={4} key={group[0].reported_user_id}>
              <ReportCard reportsGroup={group} onUpdateBatchStatus={handleUpdateBatchStatus} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
