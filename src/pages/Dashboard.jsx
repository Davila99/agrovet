import React, { useState } from "react";
import {
  Box,
  Drawer,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  AppBar,
  CssBaseline,
  Divider,
  useMediaQuery,
  Paper,
} from "@mui/material";
import logo from "../assets/logo.svg";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import Chat from "./Chat";
// import Configuracion from "./Configuracion";

const drawerWidth = 240;

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selected, setSelected] = useState("chat");
  const isMd = useMediaQuery("(min-width:900px)");

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { id: "chat", label: "Chat", icon: <ChatBubbleOutlineIcon /> },
    { id: "config", label: "Configuración", icon: <SettingsIcon /> },
  ];

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          <>
            <Link to="/" style={{ display: "flex", alignItems: "center" }}>
              <img
                src={logo}
                alt="Logo AgroVets"
                width="90"
                style={{ height: 48 }}
              />
            </Link>
          </>
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.id}
            selected={selected === item.id}
            onClick={() => {
              setSelected(item.id);
              if (!isMd) setMobileOpen(false);
            }}
            sx={{
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "#fff",
                "& .MuiListItemIcon-root": { color: "#fff" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          © 2025 AgroVet
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* AppBar superior */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "primary.main",
          boxShadow: 2,
        }}
      ></AppBar>

      {/* Menú lateral */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: 0 }}>
        {/* Drawer móvil */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Drawer fijo */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid rgba(0,0,0,0.08)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          bgcolor: "#f4f6f8",
        }}
      >
        <Toolbar /> {/* Espacio debajo del AppBar */}
        <Paper
          sx={{
            borderRadius: 3,
            height: { xs: 520, md: "calc(100vh - 150px)" },
            boxShadow: 3,
            overflow: "hidden",
          }}
        >
          {selected === "chat" && <Chat />}
          {selected === "config" && (
            <Typography variant="h6" color="text.secondary">
              Aquí irán las configuraciones ⚙️
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
