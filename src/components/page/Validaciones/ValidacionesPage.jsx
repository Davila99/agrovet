/**
 * ValidacionesPage — Página de administración para validar perfiles de especialistas.
 * Solo visible para usuarios con is_staff=True.
 * Muestra estadísticas, tabs de Pendientes/Rechazados/Todos, y cards de especialistas.
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
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import GroupIcon from '@mui/icons-material/Group';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import ValidacionCard from './ValidacionCard';
import {
  getPendingValidations,
  getRejectedValidations,
  getAllValidations,
  validateSpecialist,
  getValidationStats,
} from '../../../features/profiles/services/profilesApi';
import { useAdminNotifications } from '../../../hooks/useAdminNotifications';

function StatsBar({ stats, loading }) {
  const items = [
    { label: 'Total con docs', value: stats?.total_with_documents ?? '—', color: '#60a5fa', icon: <GroupIcon fontSize="small" /> },
    { label: 'Validados', value: stats?.validated ?? '—', color: '#22c55e', icon: <VerifiedUserIcon fontSize="small" /> },
    { label: 'Pendientes', value: stats?.pending ?? '—', color: '#fbbf24', icon: <HourglassEmptyIcon fontSize="small" /> },
    { label: 'Rechazados', value: stats?.rejected ?? '—', color: '#ef4444', icon: <CancelIcon fontSize="small" /> },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
      {items.map((item) => (
        <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#1e293b', borderRadius: 2, px: 2, py: 1, border: '1px solid rgba(255,255,255,0.06)' }}>
          <Box sx={{ color: item.color }}>{item.icon}</Box>
          {loading ? (
            <Skeleton width={30} height={20} sx={{ bgcolor: '#334155' }} />
          ) : (
            <Typography fontWeight={700} color={item.color} fontSize="1.1rem">
              {item.value}
            </Typography>
          )}
          <Typography variant="caption" color="#64748b" fontWeight={500}>{item.label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function CardSkeleton() {
  return (
    <Box sx={{ bgcolor: '#1e293b', borderRadius: 3, p: 2.5, border: '1.5px solid rgba(255,255,255,0.05)' }}>
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
        <Skeleton variant="circular" width={48} height={48} sx={{ bgcolor: '#334155', flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="60%" height={20} sx={{ bgcolor: '#334155' }} />
          <Skeleton width="40%" height={16} sx={{ bgcolor: '#334155', mt: 0.5 }} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {[1, 2].map((i) => (
          <Skeleton key={i} variant="rectangular" width={72} height={72} sx={{ bgcolor: '#334155', borderRadius: 1.5 }} />
        ))}
      </Box>
    </Box>
  );
}

export default function ValidacionesPage() {
  const [tab, setTab] = useState(0); // 0=Pendientes, 1=Rechazados, 2=Todos
  const [specialists, setSpecialists] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let reqPromise;
      if (tab === 0) reqPromise = getPendingValidations();
      else if (tab === 1) reqPromise = getAllValidations(); // Validados (filter later)
      else if (tab === 2) reqPromise = getRejectedValidations();
      else reqPromise = getAllValidations();

      const [dataRes, statsRes] = await Promise.all([reqPromise, getValidationStats()]);
      let items = (tab === 0 || tab === 2) ? (dataRes.results || []) : (Array.isArray(dataRes) ? dataRes : []);
      
      if (tab === 1) {
        items = items.filter(s => s.verification_status === 'approved');
      }

      setSpecialists(items);

      if (tab === 0) setPendingCount(dataRes.count ?? items.length);
      if (tab === 2) setRejectedCount(dataRes.count ?? items.length);
      setStats(statsRes);
    } catch (e) {
      setError(e.message || 'Error al cargar validaciones.');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useAdminNotifications((payload) => {
    if (payload.type === 'new_validation') {
      setToast('📜 ¡Nueva solicitud de validación recibida!');
      fetchData();
    }
  });

  const handleValidate = async (userId, isValidated, comment) => {
    await validateSpecialist(userId, isValidated, comment);
    await fetchData();
  };

  const filtered = specialists.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (s.user?.full_name || `usuario ${s.user_id}`).toLowerCase();
    const prof = (s.profession || '').toLowerCase();
    return name.includes(q) || prof.includes(q);
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', overflowY: 'auto', bgcolor: '#0f172a', color: '#f1f5f9' }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <VerifiedUserIcon sx={{ color: '#60a5fa', fontSize: 28 }} />
          <Typography variant="h5" fontWeight={800} color="#f1f5f9">
            Validaciones de Especialistas
          </Typography>
        </Box>
        <Typography variant="body2" color="#64748b">
          Revisa los documentos de los especialistas y aprueba o rechaza su validación.
        </Typography>
      </Box>

      <StatsBar stats={stats} loading={loading && !stats} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': { color: '#64748b', fontWeight: 600, textTransform: 'none', fontSize: '0.9rem' },
            '& .Mui-selected': { color: '#60a5fa' },
            '& .MuiTabs-indicator': { bgcolor: '#60a5fa' },
          }}
        >
          <Tab label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Pendientes
              {pendingCount > 0 && <Chip label={pendingCount} size="small" sx={{ bgcolor: '#fbbf24', color: '#000', fontWeight: 700, height: 18, fontSize: '0.65rem' }} />}
            </Box>
          } />
          <Tab label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Validados
              {(stats?.validated || 0) > 0 && <Chip label={stats?.validated} size="small" sx={{ bgcolor: 'rgba(34,197,94,0.2)', color: '#22c55e', fontWeight: 700, height: 18, fontSize: '0.65rem', border: '1px solid rgba(34,197,94,0.4)' }} />}
            </Box>
          } />
          <Tab label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Rechazados
              {(stats?.rejected || rejectedCount) > 0 && <Chip label={stats?.rejected || rejectedCount} size="small" sx={{ bgcolor: 'rgba(239,68,68,0.2)', color: '#ef4444', fontWeight: 700, height: 18, fontSize: '0.65rem', border: '1px solid rgba(239,68,68,0.4)' }} />}
            </Box>
          } />
          <Tab label="Todos" />
        </Tabs>

        <TextField size="small" placeholder="Buscar especialista..." value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#64748b', fontSize: 18 }} /></InputAdornment>,
            sx: { bgcolor: '#1e293b', borderRadius: 2, color: '#f1f5f9', fontSize: '0.85rem' },
          }}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.08)' },
            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(96,165,250,0.4)' },
            '& .MuiInputBase-input': { color: '#f1f5f9' },
            width: { xs: '100%', sm: 260 },
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, bgcolor: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
          {error}
        </Alert>
      )}

      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} message={toast} />

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} lg={4} key={i}>
              <CardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, opacity: 0.5 }}>
          <VerifiedUserIcon sx={{ fontSize: 56, color: '#334155', mb: 2 }} />
          <Typography color="#475569" fontWeight={600}>
            {search ? 'No se encontraron resultados' : tab === 0 ? '¡No hay validaciones pendientes! 🎉' : tab === 2 ? 'No hay especialistas rechazados.' : tab === 1 ? 'No hay especialistas validados.' : 'No hay especialistas con documentos.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((specialist) => (
            <Grid item xs={12} sm={6} lg={4} key={specialist.id || specialist.user_id}>
              <ValidacionCard specialist={specialist} onValidate={handleValidate} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
