import React from 'react';
import { Box, Drawer, List, ListItemButton, ListItemText, Divider, Avatar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import InfoIcon from '@mui/icons-material/Info';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { RiChatVoiceAiFill } from 'react-icons/ri';
import { menuItems, comunidadSubmenu } from './data';

const drawerBg = '#fff';
const accent = '#103E68';
const hoverBg = '#f0f0f0';

const PermanentSidebar = ({ user, onLogout }) => {
  const role = (user?.role || '').toString().toLowerCase();
  const isConsumer = role === 'consumer';
  const canSeeDashboard = role === 'specialist' || role === 'businessman' || role === 'business';

  const computedMenuItems = isConsumer
    ? [{ text: 'Comunidad', path: '/chats', submenu: true, icon: 'chat' }, ...menuItems]
    : menuItems;

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      PaperProps={{ sx: { width: 280, bgcolor: drawerBg, borderRight: '1px solid rgba(0,0,0,0.04)', boxShadow: 'none', zIndex: (theme) => theme.zIndex.drawer } }}
    >
      <Box sx={{ p: 2 }}>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, px: 1 }}>
            <Avatar src={user?.profile_picture || undefined} sx={{ bgcolor: accent }}>
              {!user?.profile_picture && `${user?.full_name?.[0] || ''}${user?.last_name?.[0] || ''}`}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#1a1a1a' }}>{user?.full_name || user?.name || 'Usuario'}</Typography>
              <Typography variant="caption" sx={{ color: '#888' }}>{user?.email}</Typography>
            </Box>
          </Box>
        )}

        <List>
          {computedMenuItems.map((item) =>
            item.submenu ? (
              <React.Fragment key={item.text}>
                <ListItemButton component={Link} to={item.path} sx={{ borderRadius: 1, mb: 0.5 }}>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
              </React.Fragment>
            ) : (
              <ListItemButton key={item.text} component={Link} to={item.path} sx={{ borderRadius: 1, mb: 0.5 }}>
                {item.icon === 'home' && <HomeIcon sx={{ mr: 1 }} />}
                {item.icon === 'map' && <MapIcon sx={{ mr: 1 }} />}
                {item.icon === 'ava' && <RiChatVoiceAiFill style={{ marginRight: 8, color: '#103e68' }} size={18} />}
                {item.icon === 'chat' && <ChatBubbleOutlineIcon sx={{ mr: 1 }} />}
                {item.icon === 'info' && <InfoIcon sx={{ mr: 1 }} />}
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            )
          )}
        </List>

        <Divider sx={{ my: 2 }} />

        {user ? (
          <Box>
            <ListItemButton component={Link} to="/perfil" sx={{ borderRadius: 1, mb: 0.5 }}>
              <ListItemText primary="Perfil" />
            </ListItemButton>

            {canSeeDashboard && (
              <ListItemButton component={Link} to="/dashboard" sx={{ borderRadius: 1, mb: 0.5 }}>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            )}

            <ListItemButton onClick={onLogout} sx={{ borderRadius: 1, color: '#ff5252' }}>
              <ListItemText primary="Cerrar sesión" />
            </ListItemButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <ListItemButton
              component={Link}
              to="/login"
              sx={{
                borderRadius: 1,
                mb: 0.5,
                bgcolor: accent,
                color: '#fff',
                fontWeight: 700,
                justifyContent: 'center',
                '&:hover': { bgcolor: '#0d3350' },
              }}
            >
              <ListItemText primary="Iniciar sesión" sx={{ textAlign: 'center' }} />
            </ListItemButton>

            <ListItemButton
              component={Link}
              to="/register"
              sx={{
                borderRadius: 1,
                mb: 0.5,
                border: `1px solid ${accent}`,
                color: accent,
                justifyContent: 'center',
                '&:hover': { bgcolor: '#f5f8fb' },
              }}
            >
              <ListItemText primary="Registrarse" sx={{ textAlign: 'center' }} />
            </ListItemButton>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default PermanentSidebar;
