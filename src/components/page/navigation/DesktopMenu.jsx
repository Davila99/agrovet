import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  MenuItem,
  Menu,
  Popper,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Grow,
} from "@mui/material";
import Button from "../../atoms/Button";
import HomeIcon from "@mui/icons-material/Home";
import MapIcon from "@mui/icons-material/Map";
import InfoIcon from "@mui/icons-material/Info";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import { RiChatVoiceAiFill } from "react-icons/ri";

import { menuItems, comunidadSubmenu } from "./data";

const DesktopMenu = ({
  comunidadMenuAnchor,
  openComunidadMenu,
  closeComunidadMenu,
  isLoggedIn,
  user,
}) => {
  const [adminAnchor, setAdminAnchor] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);

  const role = (user?.role || "").toString().toLowerCase();
  const canSeeDashboard =
    role === "specialist" || role === "businessman" || role === "business";
  const isConsumer = role === "consumer";

  // Construir items de navegación, inyectando "Comunidad" para consumers
  const computedMenuItems = isConsumer
    ? [
        { text: "Comunidad", path: "/chats", submenu: true, icon: "chat" },
        ...menuItems,
      ]
    : menuItems;

  return (
    <Box
      sx={{
        display: { xs: "none", md: "flex" },
        gap: 3,
        color: "#103e68",
        alignItems: "center",
      }}
    >
      {computedMenuItems.map(({ text, path, submenu, icon }) =>
        submenu ? (
          <Box
            key={text}
            onMouseEnter={openComunidadMenu}
            onMouseLeave={closeComunidadMenu}
            sx={{ position: "relative" }}
          >
            <RouterLink to={path} style={{ textDecoration: "none" }}>
              <Button key={text} variant="outline" size="md">
                {icon === "home" && (
                  <HomeIcon sx={{ marginRight: 2 }} fontSize="small" />
                )}
                {icon === "map" && (
                  <MapIcon sx={{ marginRight: 1 }} fontSize="small" />
                )}
                {icon === "chat" && (
                  <ChatBubbleOutlineIcon
                    sx={{ marginRight: 1 }}
                    fontSize="small"
                  />
                )}
                {icon === "ava" && (
                  <RiChatVoiceAiFill
                    style={{ marginRight: 8, color: "#103e68" }}
                    size={16}
                  />
                )}
                {icon === "info" && (
                  <InfoIcon sx={{ marginRight: 1 }} fontSize="small" />
                )}
                {text}
              </Button>
            </RouterLink>
            <Menu
              anchorEl={comunidadMenuAnchor}
              open={Boolean(comunidadMenuAnchor)}
              onClose={closeComunidadMenu}
              MenuListProps={{ onMouseLeave: closeComunidadMenu }}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              {comunidadSubmenu.map(({ text: subText, path: subPath }) => (
                <MenuItem
                  key={subText}
                  component={RouterLink}
                  to={subPath}
                  onClick={closeComunidadMenu}
                >
                  {subText}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        ) : (
          <RouterLink key={text} to={path} style={{ textDecoration: "none" }}>
            <Button variant="outline" size="md">
              {icon === "home" && (
                <HomeIcon sx={{ marginRight: 1 }} fontSize="small" />
              )}
              {icon === "map" && (
                <MapIcon sx={{ marginRight: 1 }} fontSize="small" />
              )}
              {icon === "chat" && (
                <ChatBubbleOutlineIcon
                  sx={{ marginRight: 1 }}
                  fontSize="small"
                />
              )}
              {icon === "ava" && (
                <RiChatVoiceAiFill
                  style={{ marginRight: 8, color: "#103e68" }}
                  size={16}
                />
              )}
              {icon === "info" && (
                <InfoIcon sx={{ marginRight: 1 }} fontSize="small" />
              )}
              {text}
            </Button>
          </RouterLink>
        )
      )}

      {isLoggedIn &&
        (canSeeDashboard ? (
          <Box sx={{ position: "relative" }}>
            <Box
              onMouseEnter={(e) => {
                setAdminAnchor(e.currentTarget);
                setAdminOpen(true);
              }}
              onMouseLeave={() => {
                setAdminOpen(false);
              }}
              sx={{ display: "inline-block" }}
            >
              <Button
                variant="outline"
                size="md"
                aria-haspopup="true"
                aria-expanded={adminOpen}
              >
                <DashboardIcon fontSize="small" sx={{ marginRight: 1 }} />
                Dashboard
              </Button>
            </Box>

            <Popper
              open={adminOpen}
              anchorEl={adminAnchor}
              placement="bottom-start"
              modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
              sx={{ zIndex: 1300 }}
            >
              <Grow in={adminOpen} timeout={220}>
                <Paper
                  elevation={3}
                  onMouseEnter={() => setAdminOpen(true)}
                  onMouseLeave={() => setAdminOpen(false)}
                  sx={{
                    width: 720,
                    p: 2,
                    backgroundColor: "rgba(255,255,255,0.82)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    boxShadow: "0 10px 30px rgba(16,62,104,0.12)",
                    borderRadius: 2,
                  }}
                >
                  {/* Quick link to go to dashboard main page */}
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}
                  >
                    <Button
                      component={RouterLink}
                      to="/dashboard"
                      variant="contained"
                      size="small"
                      sx={{ textTransform: "none", bgcolor: "#103e68" }}
                    >
                      Ir al dashboard
                    </Button>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Dashboard
                      </Typography>
                      <Divider sx={{ mb: 1 }} />
                      <List>
                        <ListItemButton
                          component={RouterLink}
                          to="/dashboard?tab=chats"
                        >
                          <ListItemIcon>
                            <ChatBubbleOutlineIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Chats"
                            secondary="Mensajería y conversaciones"
                          />
                        </ListItemButton>

                        <ListItemButton component={RouterLink} to="/foro">
                          <ListItemIcon>
                            <ChatBubbleOutlineIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Foro"
                            secondary="Temas y discusiones de la comunidad"
                          />
                        </ListItemButton>

                        <ListItemButton
                          component={RouterLink}
                          to="/dashboard?tab=ava"
                        >
                          <ListItemIcon>
                            <RiChatVoiceAiFill
                              style={{ marginRight: 8, color: "#103e68" }}
                              size={16}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary="AVA IA"
                            secondary="Asistente virtual y sugerencias"
                          />
                        </ListItemButton>

                        <ListItemButton
                          component={RouterLink}
                          to="/dashboard?tab=specialists"
                        >
                          <ListItemIcon>
                            <PeopleIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Especialistas"
                            secondary="Directorio y perfiles"
                          />
                        </ListItemButton>

                        <ListItemButton component={RouterLink} to="/mapa">
                          <ListItemIcon>
                            <MapIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Mapa"
                            secondary="Ubica negocios y veterinarias"
                          />
                        </ListItemButton>

                        <ListItemButton component={RouterLink} to="/search">
                          <ListItemIcon>
                            <BusinessIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Negocios"
                            secondary="Explora y conecta"
                          />
                        </ListItemButton>
                      </List>
                    </Box>

                    <Box
                      sx={{
                        width: 260,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#f0f6f4",
                          borderRadius: 1,
                          height: 140,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {/* Placeholder image area - puedes reemplazar por una imagen real */}
                        <Typography sx={{ color: "#103e68", fontWeight: 700 }}>
                          Panel rápido
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">
                          Accesos rápidos
                        </Typography>
                        <List>
                          <ListItemButton
                            component={RouterLink}
                            to="/dashboard?tab=notifications"
                          >
                            <ListItemText primary="Notificaciones" />
                          </ListItemButton>
                          <ListItemButton component={RouterLink} to="/perfil">
                            <ListItemText primary="Mi perfil" />
                          </ListItemButton>
                        </List>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grow>
            </Popper>
          </Box>
        ) : null)}
    </Box>
  );
};

export default DesktopMenu;
