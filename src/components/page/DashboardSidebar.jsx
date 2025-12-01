import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

// This component is extracted from Dashboard.jsx to allow reuse in App layout
export default function DashboardSidebar({
  selected,
  setSelected,
  collapsed,
  setCollapsed,
  isMobile,
  mobileOpen,
  setMobileOpen,
  user,
  handleLogout,
  handleProfile,
  navigateToAdds
}) {
  const menuItems = [
    { id: 'chat', label: 'Chats', icon: <ChatBubbleOutlineIcon /> },
    { id: 'foro', label: 'Foro', icon: <ForumOutlinedIcon /> },
    { id: 'ads', label: 'Ads', icon: <CampaignOutlinedIcon /> },
    { id: 'ia', label: 'IA', icon: <SmartToyOutlinedIcon /> },
  ];

  const sidebarWidth = collapsed ? 56 : 220;

  return (
    <Paper
      elevation={4}
      sx={{
        width: isMobile ? 240 : sidebarWidth,
        maxWidth: isMobile ? 240 : sidebarWidth,
        height: '100%',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 0,
        background: '#111827',
        color: '#fff',
        overflow: 'hidden',
        borderRadius: 0,
        boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
        zIndex: 1200,
      }}
    >
      <Box>
        <Box sx={{
          p: collapsed ? 1 : 1.5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: collapsed ? 0.5 : 1,
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          pb: collapsed ? 1 : 1.5,
          mb: 0.5
        }}>
          {!isMobile && (
            <IconButton
              size="small"
              onClick={() => setCollapsed(!collapsed)}
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                padding: 0.5,
                mb: collapsed ? 0 : 0.5,
                '&:hover': { color: '#fff', bgcolor: 'rgba(255, 255, 255, 0.1)' },
                transition: 'all 0.2s',
                transform: collapsed ? 'rotate(180deg)' : 'none',
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {!collapsed && (
            <Box component="img" src="/src/assets/logo.svg" alt="AgroVets" sx={{ height: 48, width: 'auto', cursor: 'pointer', filter: 'brightness(0) invert(1)' }} onClick={() => window.location.href = '/'} />
          )}
        </Box>

        <Box sx={{ px: collapsed ? 0.75 : 1, mt: 0.5 }}>
          {!collapsed && (
            <Typography variant="caption" sx={{ px: 0.75, mb: 0.25, display: 'block', color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase' }}>
              Menu
            </Typography>
          )}

          <List sx={{ px: 0 }}>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.id}
                selected={selected === item.id}
                onClick={() => {
                  setSelected(item.id);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 1.5,
                  mb: 1,
                  py: 1,
                  px: collapsed ? 0.5 : 1.5,
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 0 : 28, color: selected === item.id ? '#000' : 'rgba(255,255,255,0.6)', justifyContent: 'center' }}>
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: selected === item.id ? 600 : 500, fontSize: '0.8rem' }} />
                )}
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Box>

      <Box sx={{ p: collapsed ? 0.75 : 1.5, borderTop: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(0,0,0,0.2)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', bgcolor: collapsed ? 'transparent' : 'rgba(255,255,255,0.03)', borderRadius: 1.5, p: collapsed ? 0 : 1, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }} onClick={handleProfile}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, overflow: 'hidden', flex: 1, justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <Avatar src={user?.profile_picture || ''} variant="rounded" sx={{ width: 40, height: 40, borderRadius: 1.5, border: '2px solid rgba(255,255,255,0.15)' }}>{!user?.profile_picture && (user?.full_name?.[0] || 'U')}</Avatar>
            {!collapsed && (
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem', lineHeight: 1.3, mb: 0.25 }}>{user?.full_name?.split(' ')[0] || 'Usuario'}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', fontSize: '0.75rem', fontWeight: 500 }}>{user?.role === 'specialist' ? 'Especialista' : user?.role === 'business' ? 'Negocio' : 'Productor'}</Typography>
              </Box>
            )}
          </Box>

          {!collapsed && (
            <IconButton size="small" onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.5)', padding: 0.25, '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.1)' } }}>
              <LogoutIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
