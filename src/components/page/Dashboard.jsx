import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CssBaseline,
  Paper,
  Avatar,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import logo from "../../assets/logo.svg";
import DashboardSidebar from './DashboardSidebar';
import Chat from "./Chat";
import AddPage from './AddPage';
import ForoPage from './ForoPage';
import AIAgentPage from "./AIAgent/AIAgentPage";
import { getProfile } from "../../services/endpoints/auth";
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
    if (tab === "ava" || tab === "ia") {
      setSelected("ia");
    }
  }, []);

  // If an initialTab prop is provided (e.g. from App route), apply it
  useEffect(() => {
    if (initialTab) {
      setSelected(initialTab);
    }
  }, [initialTab]);

  // If the route contains a community id (e.g. /foro/community/:id), ensure Dashboard shows the Foro tab
  useEffect(() => {
    try {
      const communityId = initialCommunityId || params?.id;
      if (communityId && selected !== 'foro') {
        setSelected('foro');
      }
    } catch (e) {
      // ignore
    }
  }, [params?.id, initialCommunityId]);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    (async () => {
      try {
        const p = await getProfile(token.replace(/^Bearer\s*/i, ""));
        setUser(p);
      } catch (e) { }
    })();
  }, []);

  const menuItems = [
    { id: "chat", label: "Chats", icon: <ChatBubbleOutlineIcon /> },
    { id: "foro", label: "Foro", icon: <ForumOutlinedIcon /> },
    { id: "ads", label: "Ads", icon: <CampaignOutlinedIcon /> },
    { id: "ia", label: "IA", icon: <SmartToyOutlinedIcon /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/perfil');
  };

  const sidebarWidth = collapsed ? 56 : 220;

  // Use the extracted DashboardSidebar component for both mobile Drawer and desktop
  // Diagnostic: log mount and params for debugging duplication issues (enable by changing `enableDebug` to true)
  const enableDebug = false;
  if (enableDebug) console.debug('[Dashboard] mount selected=', selected, 'params=', params);
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
      }}>
      <CssBaseline />

      {/* Mobile Menu Button */}
      {isMobile && (
        <IconButton
          size="small"
          onClick={() => setMobileOpen(true)}
          sx={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 1400,
            bgcolor: "rgba(10, 25, 41, 0.9)",
            color: "#ffffff",
            padding: 0.75,
            "&:hover": {
              bgcolor: "rgba(10, 25, 41, 1)",
            },
            "& .MuiSvgIcon-root": {
              fontSize: 20,
            },
          }}>
          <MenuIcon />
        </IconButton>
      )}

      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
            BackdropProps: {
              sx: { zIndex: 1301 },
            },
          }}
          PaperProps={{
            sx: {
              zIndex: 1302,
              width: 220,
              borderRadius: "0 12px 12px 0",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              bgcolor: "#111827",
              borderRight: "1px solid rgba(255, 255, 255, 0.05)",
            },
          }}>
          {Sidebar}
        </Drawer>
      ) : (
        <Box
          sx={{
            width: sidebarWidth,
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            flexShrink: 0,
          }}>
          {Sidebar}
        </Box>
      )}

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
          width: isMobile ? "100%" : `calc(100% - ${sidebarWidth}px)`,
          maxWidth: isMobile ? "100%" : `calc(100% - ${sidebarWidth}px)`,
          height: "100vh",
          boxSizing: "border-box",
          transition:
            "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
            minWidth: 0,
            width: "100%",
            maxWidth: "100%",
            height: "100%",
            boxSizing: "border-box",
          }}>
          {selected === "chat" && (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                minWidth: 0,
                maxWidth: "100%",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}>
              <Chat />
            </Box>
          )}
          {selected === "foro" && (
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                overflow: "auto",
              }}>
              <ForoPage initialCommunityId={initialCommunityId || params?.id} />
            </Paper>
          )}
          {selected === "ads" && (
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                overflow: "auto",
              }}>
              <AddPage />
            </Paper>
          )}
          {selected === "products" && (
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>

            </Paper>
          )}
          {selected === "ia" && (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                minWidth: 0,
                maxWidth: "100%",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}>
              <AIAgentPage />
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            background: "linear-gradient(90deg, #0a1929 0%, #1a2f47 100%)",
            color: "rgba(255, 255, 255, 0.7)",
            py: 0.75,
            px: 1.5,
            textAlign: "center",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
