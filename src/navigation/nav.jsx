import React, { useEffect, useState, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Popper,
  Paper,
  ClickAwayListener,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import logo from "../assets/image/logo.webp";
import { Link, useNavigate } from "react-router-dom";

const menuItems = [
  { text: "Inicio", path: "/" },
  { text: "Comunidad", path: "/comunidad", submenu: true },
  { text: "Tendencias", path: "/tendencias" },
  { text: "Conócenos", path: "/acerca-de" },
];

const comunidadSubmenu = [
  { text: "Mapa", path: "/comunidad/mapa" },
  { text: "Chat", path: "/comunidad/chat" },
  { text: "Feed", path: "/comunidad/feed" },
  { text: "Explorar", path: "/comunidad/explorar" },
];

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [comunidadMenuAnchor, setComunidadMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [comunidadOpen, setComunidadOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  // Drawer handlers
  const toggleDrawer = (open) => () => setDrawerOpen(open);

  // Comunidad menu handlers (desktop)
  const openComunidadMenu = (event) => setComunidadMenuAnchor(event.currentTarget);
  const closeComunidadMenu = () => setComunidadMenuAnchor(null);

  // User menu handlers (desktop)
  const openUserMenu = (event) => setUserMenuAnchor(event.currentTarget);
  const closeUserMenu = () => setUserMenuAnchor(null);

  const userMenuOpen = Boolean(userMenuAnchor);

  // Comunidad submenu (mobile)
  const handleComunidadCollapse = () => setComunidadOpen((prev) => !prev);

  // Logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    closeUserMenu();
    setDrawerOpen(false);
  }, []);

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#fff" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Link to="/">
            <img src={logo} alt="Logo AgroVets" width="80" />
          </Link>

          {/* Desktop Menu */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 3,
              color: "#103e68",
              alignItems: "center",
            }}>
            {menuItems.map((item) =>
              item.submenu ? (
                <Box
                  key={item.text}
                  onMouseEnter={openComunidadMenu}
                  onMouseLeave={closeComunidadMenu}
                  sx={{ position: "relative" }}>
                  <Button sx={{ color: "#103e68" }}>{item.text}</Button>
                  <Menu
                    anchorEl={comunidadMenuAnchor}
                    open={Boolean(comunidadMenuAnchor)}
                    onClose={closeComunidadMenu}
                    MenuListProps={{ onMouseLeave: closeComunidadMenu }}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}>
                    {comunidadSubmenu.map((sub) => (
                      <MenuItem
                        key={sub.text}
                        component={Link}
                        to={sub.path}
                        onClick={closeComunidadMenu}>
                        {sub.text}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              ) : (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  sx={{ color: "#103e68" }}>
                  {item.text}
                </Button>
              )
            )}
          </Box>

          {/* Desktop User/CTA */}
          <Box
            sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
            {isLoggedIn ? (
              <>
                <IconButton onClick={openUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="User Avatar" src="/static/images/avatar/1.jpg" />
                </IconButton>
                <Popper
                  open={userMenuOpen}
                  anchorEl={userMenuAnchor}
                  placement="bottom-end"
                  // Ensure popper is portaled to body to escape any stacking contexts
                  container={
                    typeof document !== "undefined" ? document.body : undefined
                  }
                  sx={{ zIndex: (theme) => theme.zIndex.modal + 20 }}>
                  <ClickAwayListener onClickAway={closeUserMenu}>
                    <Paper
                      elevation={4}
                      sx={{
                        mt: 1,
                        minWidth: 220,
                        p: 2,
                        // Ensure the popper sits above page content (hero image)
                        zIndex: (theme) => theme.zIndex.modal + 10,
                      }}>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <Avatar
                          alt="User Avatar"
                          src="/static/images/avatar/1.jpg"
                        />
                        <Box>
                          <Typography variant="subtitle1">Usuario</Typography>
                          <Typography variant="body2" color="text.secondary">
                            usuario@ejemplo.com
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ mb: 1 }} />

                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          closeUserMenu();
                          navigate("/perfil");
                        }}
                        sx={{ mb: 1 }}>
                        Ver perfil
                      </Button>

                      <Button
                        fullWidth
                        variant="text"
                        size="small"
                        onClick={() => {
                          closeUserMenu();
                          navigate("/configuracion");
                        }}>
                        Configuración
                      </Button>

                      <Divider sx={{ my: 1 }} />

                      <Button fullWidth color="error" onClick={handleLogout}>
                        Cerrar sesión
                      </Button>
                    </Paper>
                  </ClickAwayListener>
                </Popper>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to="/login"
                  sx={{ mr: 2 }}>
                  Iniciar sesión
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/register">
                  Registrarse
                </Button>
              </>
            )}
          </Box>

          {/* Mobile Hamburger */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton onClick={toggleDrawer(true)} color="inherit">
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer (Mobile) */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
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
                          onClick={toggleDrawer(false)}>
                          <ListItemText primary={sub.text} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              ) : (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    onClick={toggleDrawer(false)}>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              )
            )}

            <Divider />
            {isLoggedIn ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to="/perfil"
                    onClick={toggleDrawer(false)}>
                    <ListItemText primary="Perfil" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to="/configuracion"
                    onClick={toggleDrawer(false)}>
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
                  <ListItemButton
                    component={Link}
                    to="/login"
                    onClick={toggleDrawer(false)}>
                    <ListItemText primary="Iniciar sesión" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to="/registro"
                    onClick={toggleDrawer(false)}>
                    <ListItemText primary="Registrarse" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
