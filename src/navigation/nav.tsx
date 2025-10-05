import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import logo from "../assets/image/logo.webp";
import { Link, useNavigate } from "react-router-dom";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [comunidadOpen, setComunidadOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const toggleComunidad = () => {
    setComunidadOpen(!comunidadOpen);
  };

  const toggleDrawer = (state: boolean) => () => {
    setOpen(state);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

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

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#fff" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* LOGO */}
          <Link to="/">
            <img src={logo} alt="Logo AgroVets" width="80" />
          </Link>

          {/* LINKS (desktop) */}
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
                  onMouseEnter={handleOpenMenu}
                  onMouseLeave={handleCloseMenu}>
                  <Button sx={{ color: "#103e68" }}>{item.text}</Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    MenuListProps={{ onMouseLeave: handleCloseMenu }}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}>
                    {comunidadSubmenu.map((sub) => (
                      <MenuItem
                        key={sub.text}
                        component={Link}
                        to={sub.path}
                        onClick={handleCloseMenu}>
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

          {/* CTA o Usuario (desktop) */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            {!user ? (
              <>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  sx={{
                    borderColor: "#103E68",
                    color: "#103E68",
                    borderRadius: 3,
                  }}>
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  sx={{
                    bgcolor: "#103E68",
                    color: "#fff",
                    "&:hover": { bgcolor: "#35722b", color: "#fff" },
                    fontWeight: "bold",
                    borderRadius: 3,
                  }}>
                  Registrarme
                </Button>
              </>
            ) : (
              <>
                <IconButton onClick={handleOpenMenu}>
                  <Avatar sx={{ bgcolor: "#103E68" }}>
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}>
                  <MenuItem disabled>{user.name}</MenuItem>
                  <Divider />
                  <MenuItem component={Link} to="/perfil">
                    Mi perfil
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
                </Menu>
              </>
            )}
          </Box>

          {/* Hamburguesa (solo en móvil) */}
          <IconButton
            sx={{ display: { xs: "flex", md: "none" }, color: "#103E68" }}
            onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer (menu móvil) */}
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {menuItems.map((item) =>
              item.submenu ? (
                <React.Fragment key={item.text}>
                  <ListItemButton onClick={toggleComunidad}>
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
                          sx={{ pl: 4 }}>
                          <ListItemText primary={sub.text} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              ) : (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton component={Link} to={item.path}>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              )
            )}

            {/* Usuario o Login/Register en móvil */}
            {!user ? (
              <>
                <ListItem>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    sx={{
                      borderColor: "#103E68",
                      color: "#103E68",
                      width: "100%",
                      borderRadius: 2,
                      mb: 1,
                    }}>
                    Login
                  </Button>
                </ListItem>
                <ListItem>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    sx={{
                      bgcolor: "#103E68",
                      color: "#fff",
                      "&:hover": { bgcolor: "#35722b", color: "#fff" },
                      fontWeight: "bold",
                      width: "100%",
                      borderRadius: 2,
                    }}>
                    Registrarme
                  </Button>
                </ListItem>
              </>
            ) : (
              <>
                <Divider />
                <ListItem>
                  <ListItemText primary={`Hola, ${user.name}`} />
                </ListItem>
                <ListItemButton component={Link} to="/perfil">
                  <ListItemText primary="Mi perfil" />
                </ListItemButton>
                <ListItemButton onClick={handleLogout}>
                  <ListItemText primary="Cerrar sesión" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
