import React, { useState, useEffect } from "react";
import {
  Box,
  CssBaseline,
  Paper,
  IconButton,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardSidebar from './DashboardSidebar';
import Chat from "../../features/chat/ChatPage";
import AddPage from '../../features/marketplace/AddPage';
import ForoPage from '../../features/foro/ForoPage';
import AIAgentPage from "../../features/ai/components/page/AIAgent/AIAgentPage";
import ValidacionesPage from "./Validaciones/ValidacionesPage";
import ReportesPage from "./Reportes/ReportesPage";
import { getProfile } from "../../features/auth/services/authApi";
import { useNavigate, useParams } from "react-router-dom";

const Dashboard = ({ initialTab = null, initialCommunityId = null }) => {
  const [selected, setSelected] = useState("chat");
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");
  const navigate = useNavigate();
  const params = useParams();

  // Leer tab de la URL al montar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (tab === "ava" || tab === "ia") setSelected("ia");
    if (tab === "validaciones") setSelected("validaciones");
    if (tab === "reportes") setSelected("reportes");
  }, []);

  // Si initialTab es provisto desde la ruta, aplicarlo
  useEffect(() => {
    if (initialTab) setSelected(initialTab);
  }, [initialTab]);

  // Si la ruta tiene community id, mostrar pestaña foro
  useEffect(() => {
    try {
      const communityId = initialCommunityId || params?.id;
      if (communityId && selected !== 'foro') setSelected('foro');
    } catch (e) { /* ignore */ }
  }, [params?.id, initialCommunityId]);

  // Cargar perfil del usuario
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    (async () => {
      try {
        const p = await getProfile(token.replace(/^Bearer\s*/i, ""));
        setUser(p);
      } catch (e) { /* ignore */ }
    })();
  }, []);

  const isAdmin = user?.role?.toLowerCase() === 'admin' || Boolean(user?.is_staff);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    navigate('/login');
  };

  const handleProfile = () => navigate('/perfil');

  const sidebarWidth = collapsed ? 56 : 220;

  const Sidebar = (
    <DashboardSidebar
      selected={selected}
      setSelected={setSelected}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      isMobile={isMobile}
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
      user={user}
      handleLogout={handleLogout}
      handleProfile={handleProfile}
      navigateToAdds={() => navigate('/adds')}
      isAdmin={isAdmin}
    />
  );

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "#f4f6f8",
        overflow: "hidden",
        width: "100%",
        maxWidth: "100vw",
      }}
    >
      <CssBaseline />

      {/* Botón menú móvil */}
      {isMobile && (
        <IconButton
          size="small"
          onClick={() => setMobileOpen(true)}
          sx={{
            position: "fixed", top: 12, left: 12, zIndex: 1400,
            bgcolor: "rgba(10, 25, 41, 0.9)", color: "#ffffff", padding: 0.75,
            "&:hover": { bgcolor: "rgba(10, 25, 41, 1)" },
            "& .MuiSvgIcon-root": { fontSize: 20 },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true, BackdropProps: { sx: { zIndex: 1301 } } }}
          PaperProps={{
            sx: {
              zIndex: 1302, width: 220,
              borderRadius: "0 12px 12px 0",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              bgcolor: "#111827",
              borderRight: "1px solid rgba(255, 255, 255, 0.05)",
            },
          }}
        >
          {Sidebar}
        </Drawer>
      ) : (
        <Box sx={{ width: sidebarWidth, transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)", flexShrink: 0 }}>
          {Sidebar}
        </Box>
      )}

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flex: 1, display: "flex", flexDirection: "column",
          overflow: "hidden", minWidth: 0,
          width: isMobile ? "100%" : `calc(100% - ${sidebarWidth}px)`,
          maxWidth: isMobile ? "100%" : `calc(100% - ${sidebarWidth}px)`,
          height: "100vh", boxSizing: "border-box",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Box sx={{ flex: 1, display: "flex", overflow: "hidden", minWidth: 0, width: "100%", maxWidth: "100%", height: "100%", boxSizing: "border-box" }}>

          {selected === "chat" && (
            <Box sx={{ width: "100%", height: "100%", minWidth: 0, maxWidth: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <Chat />
            </Box>
          )}

          {selected === "foro" && (
            <Paper elevation={0} sx={{ flex: 1, overflow: "auto" }}>
              <ForoPage initialCommunityId={initialCommunityId || params?.id} />
            </Paper>
          )}

          {selected === "ads" && (
            <Paper elevation={0} sx={{ flex: 1, overflow: "auto" }}>
              <AddPage />
            </Paper>
          )}

          {selected === "ia" && (
            <Box sx={{ width: "100%", height: "100%", minWidth: 0, maxWidth: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <AIAgentPage />
            </Box>
          )}

          {/* Tab de Validaciones — solo renderiza si el usuario es admin */}
          {selected === "validaciones" && isAdmin && (
            <Box sx={{ width: "100%", height: "100%", overflow: "auto", bgcolor: "#0f172a" }}>
              <ValidacionesPage />
            </Box>
          )}

          {/* Tab de Reportes — solo renderiza si el usuario es admin */}
          {selected === "reportes" && isAdmin && (
            <Box sx={{ width: "100%", height: "100%", overflow: "auto", bgcolor: "#0f172a" }}>
              <ReportesPage />
            </Box>
          )}

          {/* Protección: si no-admin intenta acceder a validaciones o reportes, redirige a chat */}
          {(selected === "validaciones" || selected === "reportes") && !isAdmin && (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {setSelected("chat")}
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            background: "linear-gradient(to right, #0F172A, #1E293B)",
            color: "rgba(255, 255, 255, 0.7)",
            py: 1, px: 2,
            textAlign: "center",
            borderTop: "1px solid #334155",
            fontSize: "0.85rem",
          }}
        >
          © 2026 AgroVet - Plataforma de telemedicina veterinaria
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
