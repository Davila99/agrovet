import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Box, IconButton, Button, Stack } from "@mui/material";
import { TextField, InputAdornment, Paper } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../assets/logo.svg";
import DesktopMenu from "./DesktopMenu";
import UserMenu from "./UserMenu";
import MobileDrawer from "./MobileDrawer";
import { getProfile } from "../services/endpoints";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [comunidadMenuAnchor, setComunidadMenuAnchor] = useState(null);
  const [comunidadOpen, setComunidadOpen] = useState(false);
  const normalizeStoredToken = (raw) => {
    if (!raw) return null;
    const s = String(raw).trim();
    if (s === 'null' || s === 'undefined' || s === '') return null;
    // remove common prefixes
    return s.replace(/^Token\s*/i, '').replace(/^Bearer\s*/i, '').trim();
  };
  const [token, setToken] = useState(() => normalizeStoredToken(localStorage.getItem("token")));

  const isValidToken = (t) => {
    if (!t) return false;
    try {
      const s = String(t).trim();
      if (!s) return false;
      if (s === 'null' || s === 'undefined') return false;
      // heuristic: token should be at least 8 chars and contain alphanumerics
      if (s.length < 8) return false;
      if (!/[A-Za-z0-9]/.test(s)) return false;
      return true;
    } catch (e) { return false; }
  };
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();

  // user/profile state determines logged-in UI
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token") setToken(normalizeStoredToken(e.newValue));
    };
    const onFocus = () => setToken(normalizeStoredToken(localStorage.getItem("token")));
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const location = useLocation();
  useEffect(() => {
    setToken(normalizeStoredToken(localStorage.getItem("token")));
  }, [location]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!token) {
        if (mounted) setUser(null);
        return;
      }
      if (!isValidToken(token)) {
        // invalid token string: clear and bail
        try { localStorage.removeItem('token'); localStorage.removeItem('userId'); } catch(e) {}
        if (mounted) { setToken(null); setUser(null); }
        return;
      }
      setProfileLoading(true);
      try {
        const res = await getProfile(token);
        if (mounted) setUser(res);
      } catch (e) {
        console.error("Error cargando perfil en Navbar:", e);
        try { localStorage.removeItem('token'); localStorage.removeItem('userId'); } catch(err){}
        if (mounted) { setToken(null); setUser(null); }
      } finally {
        if (mounted) setProfileLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [token]);

  const isLoggedIn = Boolean(user);

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
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "transparent",

          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Box
          sx={{
            margin: 1,
            bgcolor: "#ffffff",
            borderRadius: 4,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            px: { xs: 1, sm: 3 },
          }}
        >
          <Toolbar
            sx={{
              justifyContent: "space-between",

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
                isLoggedIn={isLoggedIn}
              />

              {/* Search (desktop) */}
              <Box sx={{ ml: 2, width: 420 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Buscar negocios, veterinarias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                      setSearchQuery("");
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            navigate(
                              `/search?q=${encodeURIComponent(searchQuery)}`
                            );
                            setSearchQuery("");
                          }}
                        >
                          <SearchIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
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
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                ml: 1,
                alignItems: "center",
              }}
            >
              {/* Mobile search icon */}
              <IconButton
                color="primary"
                size="large"
                onClick={() => setMobileSearchOpen((s) => !s)}
              >
                {mobileSearchOpen ? <CloseIcon /> : <SearchIcon />}
              </IconButton>

              {/* Mobile Menu Button */}
              <IconButton
                onClick={toggleDrawer(true)}
                color="primary"
                size="large"
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Box>
      </AppBar>

      {/* Mobile inline search popover */}
      {mobileSearchOpen && (
        <Paper
          sx={{ p: 1, display: { xs: "flex", md: "none" }, gap: 1 }}
          elevation={3}
        >
          <TextField
            size="small"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                setSearchQuery("");
                setMobileSearchOpen(false);
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                      setSearchQuery("");
                      setMobileSearchOpen(false);
                    }}
                  >
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
        </Paper>
      )}

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
