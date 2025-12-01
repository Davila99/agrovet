import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItemButton,
  Box,
  Avatar,
  Stack,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { People, Agriculture, LocalHospital, Business, Public } from '@mui/icons-material';
import { useCommunities } from '../../../hooks/Foro/useForoApi';
import { filterCommunitiesByRole, COMMUNITY_SLUGS } from '../../../utils/Foro/autoJoinCommunities';

// Colors and icons for each community
const communityConfig = {
  [COMMUNITY_SLUGS.GENERAL]: {
    color: '#6366F1',
    icon: <Public />,
    gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
  },
  [COMMUNITY_SLUGS.CONSUMERS]: {
    color: '#F59E0B',
    icon: <Agriculture />,
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  },
  [COMMUNITY_SLUGS.SPECIALISTS]: {
    color: '#10B981',
    icon: <LocalHospital />,
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  },
  [COMMUNITY_SLUGS.BUSINESSMEN]: {
    color: '#3B82F6',
    icon: <Business />,
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  },
};

const getCommunityConfig = (slug) => {
  return communityConfig[slug] || {
    color: '#8B5CF6',
    icon: <Public />,
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
  };
};

/**
 * SidebarCommunities - Shows communities relevant to user's role
 * Only displays communities the user has access to
 */
export default function SidebarCommunities({ userRole }) {
  const { data, isLoading, error: apiError } = useCommunities();
  
  // Filter communities based on user role
  const communities = useMemo(() => {
    if (!data) return [];
    return filterCommunitiesByRole(data, userRole);
  }, [data, userRole]);

  if (isLoading) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          borderRadius: 3,
          bgcolor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}>
          Mis Comunidades
        </Typography>
        <Stack spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      </Paper>
    );
  }

  if (apiError) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          borderRadius: 3,
          bgcolor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <Alert severity="warning" sx={{ fontSize: '0.85rem' }}>
          No se pudieron cargar las comunidades
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2.5, 
        borderRadius: 3,
        bgcolor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 700, 
          fontSize: '1rem', 
          color: '#1a1a1a',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <People sx={{ fontSize: 20, color: '#00695c' }} />
        Mis Comunidades
      </Typography>

      {communities.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No tienes comunidades asignadas
          </Typography>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {communities.map((community) => {
            const config = getCommunityConfig(community.slug);
            
            return (
              <ListItemButton
                key={community.id}
                component={RouterLink}
                to={`/foro/community/${community.id}`}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  p: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: `${config.color}10`,
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <Avatar
                  src={community.avatar}
                  sx={{
                    width: 44,
                    height: 44,
                    mr: 1.5,
                    background: config.gradient,
                    boxShadow: `0 4px 12px ${config.color}40`,
                  }}
                >
                  {config.icon}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: '#1a1a1a',
                    }}
                  >
                    {community.name}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {community.members_count || 0} miembros
                    </Typography>
                    <Chip 
                      size="small" 
                      label="Miembro" 
                      sx={{ 
                        height: 18, 
                        fontSize: '0.65rem',
                        bgcolor: `${config.color}20`,
                        color: config.color,
                        fontWeight: 600,
                      }} 
                    />
                  </Stack>
                </Box>
              </ListItemButton>
            );
          })}
        </List>
      )}
    </Paper>
  );
}
