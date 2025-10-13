// src/components/Navbar/Navbar.jsx
import React, { useState, useEffect, useCallback } from "react";
import { AppBar, Toolbar, Box, IconButton, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";
import DesktopMenu from "./DesktopMenu";
import UserMenu from "./UserMenu";
import MobileDrawer from "./MobileDrawer";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [comunidadMenuAnchor, setComunidadMenuAnchor] = useState(null);
  const [comunidadOpen, setComunidadOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  const toggleDrawer = (open) => () => setDrawerOpen(open);
  const openComunidadMenu = (e) => setComunidadMenuAnchor(e.currentTarget);
  const closeComunidadMenu = () => setComunidadMenuAnchor(null);
  const handleComunidadCollapse = () => setComunidadOpen((p) => !p);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
  }, []);

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#fff", boxShadow: 2 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Link to="/">
            <img src={logo} alt="Logo AgroVets" width="80" />
          </Link>

          <DesktopMenu
            comunidadMenuAnchor={comunidadMenuAnchor}
            openComunidadMenu={openComunidadMenu}
            closeComunidadMenu={closeComunidadMenu}
          />

          <Box
            sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
          >
            {isLoggedIn ? (
              <UserMenu onLogout={handleLogout} />
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to="/login"
                  sx={{ mr: 2 }}
                >
                  Iniciar sesión
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/register"
                >
                  Registrarse
                </Button>
              </>
            )}
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton onClick={toggleDrawer(true)} color="inherit">
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <MobileDrawer
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        comunidadOpen={comunidadOpen}
        handleComunidadCollapse={handleComunidadCollapse}
        isLoggedIn={isLoggedIn}
        handleLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;
