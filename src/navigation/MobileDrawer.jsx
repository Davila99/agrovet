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
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Link } from "react-router-dom";
import { menuItems, comunidadSubmenu } from "./data";

const MobileDrawer = ({
  open,
  onClose,
  comunidadOpen,
  handleComunidadCollapse,
  isLoggedIn,
  handleLogout,
}) => (
  <Drawer anchor="right" open={open} onClose={onClose}>
    <Box sx={{ width: 250, color: "text.primary" }} role="presentation">
      <List>
        {menuItems.map((item) =>
          item.submenu ? (
            <React.Fragment key={item.text}>
              <ListItemButton onClick={handleComunidadCollapse}>
                <ListItemText primary={item.text} />
                {comunidadOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={comunidadOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {comunidadSubmenu.map((sub) => (
                    <ListItemButton
                      key={sub.text}
                      component={Link}
                      to={sub.path}
                      sx={{ pl: 4 }}
                      onClick={onClose}
                    >
                      <ListItemText primary={sub.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ) : (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} to={item.path} onClick={onClose}>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          )
        )}

        <Divider />
        {isLoggedIn ? (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/perfil" onClick={onClose}>
                <ListItemText primary="Perfil" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/configuracion"
                onClick={onClose}
              >
                <ListItemText primary="Configuración" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Cerrar sesión" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/login" onClick={onClose}>
                <ListItemText primary="Iniciar sesión" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/register" onClick={onClose}>
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
