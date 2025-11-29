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
import Chat from "./Chat";
import AddPage from './AddPage';
import ForoPage from './ForoPage';
import AIAgentPage from "./AIAgent/AIAgentPage";
import { getProfile } from "../../services/endpoints/auth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [selected, setSelected] = useState("chat");
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");
  const navigate = useNavigate();

  // Leer tab de la URL al montar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (tab === "ava" || tab === "ia") {
      setSelected("ia");
    }
  }, []);

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

  const Sidebar = (
    <Paper
      elevation={4}
      sx={{
        width: isMobile ? 240 : sidebarWidth,
        maxWidth: isMobile ? 240 : sidebarWidth,
        height: "100%",
        borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 0,
        background: "#111827",
        color: "#fff",
        overflow: "hidden",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        minWidth: 0,
        boxShadow: "4px 0 24px rgba(0,0,0,0.2)",
        zIndex: 1200,
      }}
    >
      {/* Top Section: Logo & Menu */}
      <Box>
        {/* Logo & Toggle Header - Vertical Layout */}
        <Box sx={{
          p: collapsed ? 1 : 1.5,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: collapsed ? 0.5 : 1,
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          pb: collapsed ? 1 : 1.5,
          mb: 0.5
        }}>
          {/* Toggle Button - Above Logo */}
          {!isMobile && (
            <IconButton
              size="small"
              onClick={() => setCollapsed(!collapsed)}
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                padding: 0.5,
                mb: collapsed ? 0 : 0.5,
                "&:hover": { 
                  color: "#fff", 
                  bgcolor: "rgba(255, 255, 255, 0.1)" 
                },
                transition: "all 0.2s",
                transform: collapsed ? "rotate(180deg)" : "none",
                "& .MuiSvgIcon-root": {
                  fontSize: collapsed ? 18 : 20
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo - Larger */}
          {!collapsed && (
            <Box
              component="img"
              src={logo}
              alt="AgroVets"
              sx={{
                height: 48,
                width: "auto",
                maxWidth: "100%",
                cursor: "pointer",
                filter: "brightness(0) invert(1)",
                opacity: 0.9,
                transition: "opacity 0.2s, transform 0.2s",
                "&:hover": { 
                  opacity: 1,
                  transform: "scale(1.05)"
                }
              }}
              onClick={() => navigate("/")}
            />
          )}
        </Box>

        {/* Menu Items */}
        <Box sx={{ px: collapsed ? 0.75 : 1, mt: 0.5 }}>
          {!collapsed && (
            <Typography
              variant="caption"
              sx={{
                px: 0.75,
                mb: 0.25,
                display: "block",
                color: "rgba(255, 255, 255, 0.4)",
                fontWeight: 600,
                fontSize: "0.6rem",
                letterSpacing: 0.5,
                textTransform: "uppercase"
              }}
            >
              Menu
            </Typography>
          )}
          <List sx={{ px: 0 }}>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.id}
                selected={selected === item.id}
                onClick={() => {
                  setSelected(item.id);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 1.5,
                  mb: 1,
                  py: 1,
                  px: collapsed ? 0.5 : 1.5,
                  minHeight: 48,
                  justifyContent: collapsed ? "center" : "flex-start",
                  transition: "all 0.2s ease",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    transform: collapsed ? "scale(1.05)" : "translateX(2px)",
                    "& .MuiListItemIcon-root": { color: "#fff" },
                  },
                  "&.Mui-selected": {
                    bgcolor: "#00c6a7",
                    color: "#000",
                    boxShadow: "0 2px 6px rgba(0, 198, 167, 0.3)",
                    "& .MuiListItemIcon-root": { color: "#000" },
                    "&:hover": { bgcolor: "#00b598" },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 0 : 28,
                    color: selected === item.id ? "#000" : "rgba(255, 255, 255, 0.6)",
                    transition: "color 0.2s ease",
                    justifyContent: "center",
                    "& .MuiSvgIcon-root": {
                      fontSize: 20
                    }
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: selected === item.id ? 600 : 500,
                      fontSize: "0.8rem",
                    }}
                  />
                )}
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Box>

      {/* Bottom Section: Profile & Logout */}
      <Box sx={{
        p: collapsed ? 0.75 : 1.5,
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        bgcolor: "rgba(0, 0, 0, 0.2)"
      }}>
        <Box sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          bgcolor: collapsed ? "transparent" : "rgba(255, 255, 255, 0.03)",
          borderRadius: 1.5,
          p: collapsed ? 0 : 1,
          transition: "all 0.2s",
          cursor: "pointer",
          "&:hover": { bgcolor: "rgba(255, 255, 255, 0.08)" }
        }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              overflow: "hidden",
              flex: 1,
              justifyContent: collapsed ? "center" : "flex-start"
            }}
            onClick={handleProfile}
          >
            <Avatar
              src={user?.profile_picture || ""}
              variant="rounded"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                border: "2px solid rgba(255, 255, 255, 0.15)",
                transition: "all 0.2s",
                fontSize: "1rem",
                fontWeight: 600,
                "&:hover": { 
                  borderColor: "#00c6a7",
                  transform: "scale(1.05)"
                }
              }}
            >
              {!user?.profile_picture && (user?.full_name?.[0] || "U")}
            </Avatar>
            {!collapsed && (
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "#fff",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontSize: "0.85rem",
                    lineHeight: 1.3,
                    mb: 0.25
                  }}
                >
                  {user?.full_name?.split(" ")[0] || "Usuario"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255, 255, 255, 0.6)",
                    display: "block",
                    fontSize: "0.75rem",
                    lineHeight: 1.3,
                    fontWeight: 500
                  }}
                >
                  {user?.role === "specialist" ? "Especialista" : user?.role === "business" ? "Negocio" : "Productor"}
                </Typography>
              </Box>
            )}
          </Box>

          {!collapsed && (
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{
                color: "rgba(255, 255, 255, 0.5)",
                padding: 0.25,
                "&:hover": { color: "#ef4444", bgcolor: "rgba(239, 68, 68, 0.1)" },
                "& .MuiSvgIcon-root": {
                  fontSize: 14
                }
              }}
            >
              <LogoutIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    </Paper>
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
              <ForoPage />
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
              <Typography
                variant="body1"
                sx={{ fontSize: "0.875rem" }}
                color="text.secondary">
                Sección Products en construcción 📦
              </Typography>
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
          <Typography variant="caption" sx={{ fontSize: "0.65rem" }}>
            © {new Date().getFullYear()} AgroVets. Todos los derechos
            reservados.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
