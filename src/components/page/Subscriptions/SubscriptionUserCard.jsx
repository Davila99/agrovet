import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CampaignIcon from '@mui/icons-material/Campaign';
import CollectionsIcon from '@mui/icons-material/Collections';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ROLE_LABELS = {
  specialist: 'Especialista',
  Specialist: 'Especialista',
  businessman: 'Empresario',
  consumer: 'Consumidor',
};

export default function SubscriptionUserCard({ user }) {
  const { full_name, phone_number, role, profile_picture, is_premium, subscription, quotas } = user;
  const isExpiringSoon = is_premium && subscription?.days_left <= 7;
  const isExpired = subscription?.status === 'EXPIRED';

  // Porcentajes de uso
  const adPercent = Math.min(100, Math.round(((quotas?.ads_used || 0) / (quotas?.ad_limit || 1)) * 100));
  const profilePercent = Math.min(
    100,
    Math.round(((quotas?.profile_items_used || 0) / (quotas?.profile_items_limit || 1)) * 100)
  );

  return (
    <Card
      elevation={2}
      sx={{
        bgcolor: '#1e293b',
        border: '1px solid',
        borderColor: is_premium
          ? isExpiringSoon
            ? 'rgba(245, 158, 11, 0.4)'
            : 'rgba(56, 189, 248, 0.3)'
          : 'rgba(255, 255, 255, 0.05)',
        borderRadius: 3,
        color: '#f8fafc',
        transition: 'all 0.25s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 12px 24px -10px rgba(0,0,0,0.5)',
          borderColor: is_premium ? '#38bdf8' : 'rgba(255,255,255,0.15)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, pb: '16px !important' }}>
        {/* Cabecera Usuario y Estado */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={profile_picture}
              alt={full_name}
              sx={{
                width: 48,
                height: 48,
                bgcolor: '#334155',
                border: '2px solid',
                borderColor: is_premium ? '#38bdf8' : 'transparent',
              }}
            >
              {(full_name || 'U').charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="#f8fafc" sx={{ lineHeight: 1.2 }}>
                {full_name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                <PhoneIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                <Typography variant="caption" color="#94a3b8">
                  {phone_number || 'Sin número'}
                </Typography>
                <Typography variant="caption" color="#64748b">•</Typography>
                <Typography variant="caption" color="#cbd5e1" fontWeight={500}>
                  {ROLE_LABELS[role] || role || 'Sin rol'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Badge Estado */}
          <Chip
            size="small"
            icon={
              is_premium ? (
                <WorkspacePremiumIcon sx={{ fontSize: '15px !important', color: '#38bdf8 !important' }} />
              ) : isExpired ? (
                <ErrorOutlineIcon sx={{ fontSize: '15px !important', color: '#f87171 !important' }} />
              ) : (
                <CheckCircleIcon sx={{ fontSize: '15px !important', color: '#94a3b8 !important' }} />
              )
            }
            label={is_premium ? 'Premium' : isExpired ? 'Expirado' : 'Gratis'}
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              bgcolor: is_premium
                ? 'rgba(56, 189, 248, 0.12)'
                : isExpired
                ? 'rgba(239, 68, 68, 0.12)'
                : 'rgba(148, 163, 184, 0.12)',
              color: is_premium ? '#38bdf8' : isExpired ? '#f87171' : '#94a3b8',
              border: '1px solid',
              borderColor: is_premium
                ? 'rgba(56, 189, 248, 0.25)'
                : isExpired
                ? 'rgba(239, 68, 68, 0.25)'
                : 'rgba(148, 163, 184, 0.2)',
            }}
          />
        </Box>

        {/* Panel de Suscripción / Vencimiento */}
        <Box
          sx={{
            bgcolor: 'rgba(15, 23, 42, 0.6)',
            borderRadius: 2,
            p: 1.5,
            mb: 2,
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <AccessTimeIcon
                sx={{
                  fontSize: 16,
                  color: is_premium
                    ? isExpiringSoon
                      ? '#f59e0b'
                      : '#38bdf8'
                    : '#64748b',
                }}
              />
              <Typography variant="body2" color="#cbd5e1" fontWeight={600}>
                {subscription?.plan_name || 'Plan Gratuito'}
              </Typography>
            </Box>

            {is_premium ? (
              <Chip
                size="small"
                label={
                  subscription?.days_left === 0
                    ? 'Vence hoy'
                    : `${subscription?.days_left} día${subscription?.days_left > 1 ? 's' : ''} restantes`
                }
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: isExpiringSoon ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.15)',
                  color: isExpiringSoon ? '#fbbf24' : '#4ade80',
                }}
              />
            ) : (
              <Typography variant="caption" color="#64748b">
                Sin plan activo
              </Typography>
            )}
          </Box>

          {is_premium && subscription?.expires_at && (
            <Typography variant="caption" color="#94a3b8" sx={{ display: 'block', mt: 0.5 }}>
              Expira:{' '}
              {new Date(subscription.expires_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Typography>
          )}
        </Box>

        {/* Cuotas y Consumo */}
        <Typography variant="caption" color="#94a3b8" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
          Cuotas y Recursos Disponibles
        </Typography>

        {/* 1. Anuncios / Ads */}
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <CampaignIcon sx={{ fontSize: 16, color: '#38bdf8' }} />
              <Typography variant="caption" color="#e2e8f0" fontWeight={500}>
                Anuncios en Marketplace
              </Typography>
            </Box>
            <Typography variant="caption" color={quotas?.ads_remaining === 0 ? '#f87171' : '#94a3b8'} fontWeight={600}>
              {quotas?.ads_used} / {quotas?.ad_limit} ({quotas?.ads_remaining} disp.)
            </Typography>
          </Box>
          <Tooltip title={`${quotas?.ads_remaining} anuncios restantes este mes`} arrow placement="top">
            <LinearProgress
              variant="determinate"
              value={adPercent}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.06)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: quotas?.ads_remaining === 0 ? '#ef4444' : adPercent > 80 ? '#f59e0b' : '#38bdf8',
                  borderRadius: 3,
                },
              }}
            />
          </Tooltip>
        </Box>

        {/* 2. Items de Perfil (Servicios/Fotos de trabajo) */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <CollectionsIcon sx={{ fontSize: 16, color: '#a855f7' }} />
              <Typography variant="caption" color="#e2e8f0" fontWeight={500}>
                Items / Fotos en Perfil
              </Typography>
            </Box>
            <Typography
              variant="caption"
              color={quotas?.profile_items_remaining === 0 ? '#f87171' : '#94a3b8'}
              fontWeight={600}
            >
              {quotas?.profile_items_used} / {quotas?.profile_items_limit} ({quotas?.profile_items_remaining} disp.)
            </Typography>
          </Box>
          <Tooltip title={`${quotas?.profile_items_remaining} items disponibles en perfil`} arrow placement="top">
            <LinearProgress
              variant="determinate"
              value={profilePercent}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.06)',
                '& .MuiLinearProgress-bar': {
                  bgcolor:
                    quotas?.profile_items_remaining === 0
                      ? '#ef4444'
                      : profilePercent > 80
                      ? '#f59e0b'
                      : '#a855f7',
                  borderRadius: 3,
                },
              }}
            />
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}
