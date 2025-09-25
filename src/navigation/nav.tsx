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

  const toggleDrawer = (state:any) => () => {
    setOpen(state);
  };

  const menuItems = ["Inicio", "Sobre Nosotros", "Comunidad", "Contacto"];

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#fff", borderRadius: 3 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* LOGO */}
          <img src={logo} alt="Logo AgroVets" width="80" />

          {/* LINKS (desktop) */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" }, // oculta en móvil
              gap: 3,
              color: "#103e68",
            }}>
            {menuItems.map((item) => (
              <Button key={item} color="inherit">
                {item}
              </Button>
            ))}
          </Box>

          {/* CTA (desktop) */}
          <Button
            component={Link}
            to="/dashboard"
            variant="contained"
            sx={{
              display: { xs: "none", md: "inline-flex" },
              bgcolor: "#103E68",
              color: "#fff",
              "&:hover": { bgcolor: "#35722b", color: "#fff" },
              fontWeight: "bold",
              borderRadius: 3,
            }}>
            Dashboard
          </Button>

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
            {menuItems.map((text) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem>
              <Button
                component={Link}
                to="/dashboard"
                variant="contained"
                sx={{
                  bgcolor: "#103E68",
                  color: "#fff",
                  "&:hover": { bgcolor: "#35722b", color: "#fff" },
                  fontWeight: "bold",
                  width: "100%",
                  borderRadius: 2,
                }}>
                Ir a Dashboard
              </Button>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
