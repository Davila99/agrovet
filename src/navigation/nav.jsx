import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { AppBar, Toolbar, Box, IconButton, Button, Stack } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../assets/logo.svg";
import DesktopMenu from "./DesktopMenu";
import UserMenu from "./UserMenu";
import MobileDrawer from "./MobileDrawer";
import { getProfile } from "../services/endpoints";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [comunidadMenuAnchor, setComunidadMenuAnchor] = useState(null);
  const [comunidadOpen, setComunidadOpen] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  const isLoggedIn = !!token;

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token") setToken(e.newValue);
    };
    const onFocus = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);
  const location = useLocation();
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, [location]);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const res = await getProfile(token);
        setUser(res);
      } catch (e) {
        console.error("Error cargando perfil en Navbar:", e);
      }
    };
    load();
  }, [token]);

  const toggleDrawer = (open) => () => setDrawerOpen(open);
  const openComunidadMenu = (e) => setComunidadMenuAnchor(e.currentTarget);
  const closeComunidadMenu = () => setComunidadMenuAnchor(null);
  const handleComunidadCollapse = () => setComunidadOpen((p) => !p);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <>
      <AppBar
        position="static"
        elevation={2}
        sx={{
          bgcolor: "#fff",
          color: "primary.main",
          px: { xs: 1, sm: 3 },
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 0, sm: 2 },
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flex: { xs: 1, md: "none" },
            }}
          >
            <Link to="/" style={{ display: "flex", alignItems: "center" }}>
              <img
                src={logo}
                alt="Logo AgroVets"
                width="90"
                style={{ height: 48 }}
              />
            </Link>
          </Box>

          {/* Desktop Menu */}
          <Box
            sx={{
              flex: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
            }}
          >
            <DesktopMenu
              comunidadMenuAnchor={comunidadMenuAnchor}
              openComunidadMenu={openComunidadMenu}
              closeComunidadMenu={closeComunidadMenu}
            />
          </Box>

          {/* User Actions */}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
              display: { xs: "none", md: "flex" },
            }}
          >
            {isLoggedIn ? (
              <UserMenu onLogout={handleLogout} user={user} />
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to="/login"
                  sx={{
                    borderRadius: 3,
                    borderWidth: 0,
                    fontWeight: 600,
                    textTransform: "none",
                    color: "#103e68",
                  }}
                >
                  Iniciar sesión
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/register"
                  sx={{
                    borderRadius: 3,
                    fontWeight: 600,
                    textTransform: "none",
                    bgcolor: "#103e68",
                  }}
                >
                  Registrarse
                </Button>
              </>
            )}
          </Stack>

          {/* Mobile Menu Button */}
          <Box sx={{ display: { xs: "flex", md: "none" }, ml: 1 }}>
            <IconButton
              onClick={toggleDrawer(true)}
              color="primary"
              size="large"
            >
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
        user={user}
      />
    </>
  );
};

export default Navbar;
