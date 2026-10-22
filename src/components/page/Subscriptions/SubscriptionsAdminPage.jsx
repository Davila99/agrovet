/**
 * SubscriptionsAdminPage — Panel de administración para el control de usuarios,
 * suscripciones premium, días restantes para vencer y cuotas/recursos disponibles.
 * Exclusivo para administradores (is_staff / is_superuser).
 */
import React, { useState, useEffect, useCallback } from 'react';
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
  Button,
} from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import SubscriptionUserCard from './SubscriptionUserCard';
import {
  getAdminSubscriptions,
  getAdminSubscriptionStats,
} from '../../../services/endpoints/subscriptions';

function StatsBar({ stats, loading }) {
  const items = [
    {
      label: 'Total Usuarios',
      value: stats?.total_users ?? '—',
      color: '#60a5fa',
      icon: <PeopleAltIcon fontSize="small" />,
    },
    {
      label: 'Premium Activos',
      value: stats?.active_premium ?? '—',
      color: '#38bdf8',
      icon: <WorkspacePremiumIcon fontSize="small" />,
    },
    {
      label: 'Vencen en ≤ 7 días',
      value: stats?.expiring_soon ?? '—',
      color: '#fbbf24',
      icon: <AccessTimeIcon fontSize="small" />,
    },
    {
      label: 'Expirados',
      value: stats?.expired ?? '—',
      color: '#f87171',
      icon: <ErrorOutlineIcon fontSize="small" />,
    },
    {
      label: 'Plan Gratuito',
      value: stats?.free_users ?? '—',
      color: '#94a3b8',
      icon: <PeopleAltIcon fontSize="small" />,
    },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
      {items.map((item) => (
        <Box
          key={item.label}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            bgcolor: '#1e293b',
            borderRadius: 2,
            px: 2,
            py: 1.2,
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ color: item.color }}>{item.icon}</Box>
          {loading ? (
            <Skeleton width={32} height={24} sx={{ bgcolor: '#334155' }} />
          ) : (
            <Typography fontWeight={800} color={item.color} fontSize="1.15rem">
              {item.value}
            </Typography>
          )}
          <Typography variant="caption" color="#94a3b8" fontWeight={600}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function SubscriptionsAdminPage() {
  const [tab, setTab] = useState(0); // 0: Todos, 1: Premium Activos, 2: Por vencer (<=7d), 3: Expirados, 4: Gratis
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const TAB_STATUS_MAP = {
    0: 'ALL',
    1: 'ACTIVE',
    2: 'ACTIVE', // Filtramos en cliente los que tengan days_left <= 7
    3: 'EXPIRED',
    4: 'FREE',
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = TAB_STATUS_MAP[tab] || 'ALL';
      const [usersRes, statsRes] = await Promise.all([
        getAdminSubscriptions({ status: statusParam }),
        getAdminSubscriptionStats(),
      ]);

      let items = Array.isArray(usersRes) ? usersRes : usersRes?.results || [];

      // Si la pestaña es "Por vencer", filtramos por días restantes
      if (tab === 2) {
        items = items.filter((u) => u.is_premium && u.subscription?.days_left <= 7);
      }

      setUsers(items);
      setStats(statsRes);
    } catch (e) {
      setError(e.message || 'Error al cargar las suscripciones de usuarios.');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Búsqueda en cliente para inmediatez
  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nameMatch = (u.full_name || '').toLowerCase().includes(q);
    const phoneMatch = (u.phone_number || '').toLowerCase().includes(q);
    const roleMatch = (u.role || '').toLowerCase().includes(q);
    return nameMatch || phoneMatch || roleMatch;
  });

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        height: '100%',
        overflowY: 'auto',
        bgcolor: '#0f172a',
        color: '#f1f5f9',
      }}
    >
      {/* Título y Descripción */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <WorkspacePremiumIcon sx={{ color: '#38bdf8', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={800} color="#f8fafc">
              Gestión de Suscripciones y Cuotas
            </Typography>
          </Box>
          <Typography variant="body2" color="#94a3b8">
            Supervisa el estado de las cuentas premium, días para caducar su membresía y consumo de recursos.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          disabled={loading}
          sx={{
            borderColor: 'rgba(255,255,255,0.15)',
            color: '#f8fafc',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { borderColor: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.08)' },
          }}
        >
          Actualizar
        </Button>
      </Box>

      {/* Barra de Estadísticas Globales */}
      <StatsBar stats={stats} loading={loading && !stats} />

      {/* Filtros por Pestaña y Buscador */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2.5,
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="inherit"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            '& .MuiTabs-indicator': { bgcolor: '#38bdf8', height: 3, borderRadius: '3px 3px 0 0' },
            '& .MuiTab-root': {
              color: '#94a3b8',
              fontWeight: 600,
              fontSize: '0.85rem',
              minHeight: 40,
              py: 0.5,
              textTransform: 'none',
              '&.Mui-selected': { color: '#38bdf8' },
            },
          }}
        >
          <Tab label="Todos los usuarios" />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                Premium Activos
                {stats?.active_premium != null && (
                  <Chip
                    size="small"
                    label={stats.active_premium}
                    sx={{ height: 18, fontSize: '0.65rem', bgcolor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: 700 }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                Por Vencer (≤ 7 días)
                {stats?.expiring_soon > 0 && (
                  <Chip
                    size="small"
                    label={stats.expiring_soon}
                    sx={{ height: 18, fontSize: '0.65rem', bgcolor: 'rgba(245, 158, 11, 0.25)', color: '#fbbf24', fontWeight: 700 }}
                  />
                )}
              </Box>
            }
          />
          <Tab label="Expirados" />
          <Tab label="Plan Gratuito" />
        </Tabs>

        {/* Buscador */}
        <TextField
          size="small"
          placeholder="Buscar por nombre, teléfono o rol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#64748b', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: '100%', sm: 300 },
            '& .MuiOutlinedInput-root': {
              bgcolor: '#1e293b',
              color: '#f8fafc',
              fontSize: '0.85rem',
              borderRadius: 2,
              '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
              '&:hover fieldset': { borderColor: '#38bdf8' },
              '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
            },
          }}
        />
      </Box>

      {/* Alerta de Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2.5, bgcolor: '#450a0a', color: '#fca5a5' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Grilla de Usuarios y Suscripciones */}
      {loading ? (
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} lg={4} key={i}>
              <Skeleton
                variant="rectangular"
                height={230}
                sx={{ bgcolor: '#1e293b', borderRadius: 3 }}
              />
            </Grid>
          ))}
        </Grid>
      ) : filteredUsers.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
            bgcolor: '#1e293b',
            borderRadius: 3,
            border: '1px dashed rgba(255,255,255,0.1)',
          }}
        >
          <WorkspacePremiumIcon sx={{ fontSize: 48, color: '#475569', mb: 1.5 }} />
          <Typography variant="h6" color="#94a3b8" fontWeight={700}>
            No se encontraron usuarios
          </Typography>
          <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
            {search ? 'Intenta con otros términos de búsqueda.' : 'No hay cuentas registradas en este estado.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filteredUsers.map((user) => (
            <Grid item xs={12} sm={6} lg={4} key={user.id}>
              <SubscriptionUserCard user={user} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
