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
import logo from "../assets/logo.svg";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (state: any) => () => {
    setOpen(state);
  };

  // Menú principal
  const menuItems = [
    { text: "Inicio", path: "/" },
    { text: "Comunidad", path: "/comunidad" },
    { text: "Tendencias", path: "/tendencias" },
    { text: "Conocenos", path: "/acerca-de" },
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
            }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                sx={{ color: "#103e68" }}>
                {item.text}
              </Button>
            ))}
          </Box>

          {/* CTA (desktop) */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
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
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.path}>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
            {/* Login / Register en móvil */}
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
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
