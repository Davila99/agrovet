// src/components/Navbar/MobileDrawer.jsx
import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Divider,
  Avatar,
  Typography,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import MapIcon from "@mui/icons-material/Map";
import InfoIcon from "@mui/icons-material/Info";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { Link } from "react-router-dom";
import { menuItems, comunidadSubmenu } from "./data";

const drawerBg = "#fff";
const accent = "#103E68";
const textColor = "#000";
const hoverBg = "#f0f0f0";

const MobileDrawer = ({
  open,
  onClose,
  comunidadOpen,
  handleComunidadCollapse,
  isLoggedIn,
  handleLogout,
  user,
}) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        width: 280,
        bgcolor: drawerBg,
        color: textColor,
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
        boxShadow: 8,
      },
    }}
  >
    <Box sx={{ p: 2 }}>
      {isLoggedIn && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            gap: 2,
            px: 1,
          }}
        >
          <Avatar
            src={user?.profile_picture || undefined}
            sx={{ bgcolor: accent }}
          >
            {!user?.profile_picture &&
              `${user?.full_name?.[0] || ""}${user?.last_name?.[0] || ""}`}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ color: textColor }}>
              {user?.full_name || user?.name || "Usuario"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#b0b0b0" }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>
      )}
      <List>
        {menuItems.map((item) =>
          item.submenu ? (
            <React.Fragment key={item.text}>
              <ListItemButton
                onClick={handleComunidadCollapse}
                sx={{
                  borderRadius: 2,

                  "&:hover": { bgcolor: hoverBg },
                }}
              >
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                />
                {comunidadOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={comunidadOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {comunidadSubmenu.map((sub) => (
                    <ListItemButton
                      key={sub.text}
                      component={Link}
                      to={sub.path}
                      sx={{
                        pl: 5,
                        borderRadius: 2,
                        mb: 0.5,
                        color: "#103E68",
                        "&:hover": { bgcolor: hoverBg, color: accent },
                      }}
                      onClick={onClose}
                    >
                      <ListItemText
                        primary={sub.text}
                        primaryTypographyProps={{
                          fontWeight: 500,
                          fontSize: 15,
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ) : (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} to={item.path} onClick={onClose}>
                {item.icon === "home" && <HomeIcon sx={{ mr: 1 }} />}
                {item.icon === "map" && <MapIcon sx={{ mr: 1 }} />}
                {item.icon === "ava" && <SmartToyIcon sx={{ mr: 1 }} />}
                {item.icon === "chat" && (
                  <ChatBubbleOutlineIcon sx={{ mr: 1 }} />
                )}
                {item.icon === "info" && <InfoIcon sx={{ mr: 1 }} />}
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        )}

        <Divider sx={{ my: 2, bgcolor: "#232936" }} />
        {isLoggedIn ? (
          <>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/perfil"
                onClick={onClose}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&:hover": { bgcolor: hoverBg },
                }}
              >
                <ListItemText primary="Perfil" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/dashboard?tab=chat"
                onClick={onClose}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&:hover": { bgcolor: hoverBg },
                }}
              >
                <ListItemText primary="Chat" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/dashboard?tab=config"
                onClick={onClose}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&:hover": { bgcolor: hoverBg },
                }}
              >
                <ListItemText primary="Configuración" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/dashboard?tab=specialists"
                onClick={onClose}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&:hover": { bgcolor: hoverBg },
                }}
              >
                <ListItemText primary="Especialistas" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  color: "#ff5252",
                  "&:hover": { bgcolor: "#2a1a1a" },
                }}
              >
                <ListItemText primary="Cerrar sesión" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/login"
                onClick={onClose}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  bgcolor: accent,
                  color: "#ffffffff",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#4f7ba3ff", color: "#fff" },
                }}
              >
                <ListItemText primary="Iniciar sesión" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/register"
                onClick={onClose}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  border: `1px solid ${accent}`,
                  color: accent,
                  fontWeight: 700,
                  "&:hover": { bgcolor: hoverBg, color: "#103E68" },
                }}
              >
                <ListItemText primary="Registrarse" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  </Drawer>
);

export default MobileDrawer;
