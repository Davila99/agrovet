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
  Divider,
  IconButton,
  Drawer,
  AppBar,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import Chat from "./Chat";
import AddPage from "./add/pages/AddPage";
import { getProfile } from "../../services/endpoints/auth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [selected, setSelected] = useState("chat");
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");
  const navigate = useNavigate();

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    (async () => {
      try {
        const p = await getProfile(token.replace(/^Bearer\s*/i, ""));
        setUser(p);
      } catch (e) {}
    })();
  }, []);

  const Sidebar = (
    <Paper
      elevation={0}
      sx={{
        width: 250,
        height: "100%",
        borderRight: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 2,
        pt: 4,
        bgcolor: "#fafafa",
      }}
    >
      <Box>
        <List>
          {[
            { id: "chat", label: "Chats" },
            { id: "ads", label: "Ads" },
            { id: "products", label: "Products" },
          ].map((item) => (
            <ListItemButton
              key={item.id}
              selected={selected === item.id}
              onClick={() => {
                setSelected(item.id);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: "#e8f5e9",
                  color: "primary.main",
                },
              }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: selected === item.id ? 600 : 400,
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Divider sx={{ mb: 1 }} />
        <IconButton
          href="/"
          sx={{
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ArrowBackIcon fontSize="small" />
          <Typography variant="button" fontSize={13}>
            Volver
          </Typography>
        </IconButton>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f4f6f8" }}>
      <CssBaseline />

      {/* Topbar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "#fff",
          color: "text.primary",
          borderBottom: "1px solid #e0e0e0",
          zIndex: 1300, // se eleva sobre Drawer
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight={700}>
              AgroVets
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box>
              <Typography fontWeight={600}>
                {user?.full_name || "Username"}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", textAlign: "right" }}
              >
                {user?.role || "Role"}
              </Typography>
            </Box>
            <Avatar
              src={user?.profile_picture || ""}
              sx={{
                width: 36,
                height: 36,
                cursor: "pointer",
                "&:hover": { opacity: 0.8 },
              }}
              onClick={() => navigate("/perfil")}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
            BackdropProps: {
              sx: { zIndex: 1301 }, // fondo del Drawer también sobre el AppBar
            },
          }}
          PaperProps={{
            sx: {
              zIndex: 1302,
              width: 250,
              borderRadius: "0 12px 12px 0",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              bgcolor: "#fff",
              // push the drawer content down so items are visible on devices with notch/status bar
              marginTop: "40px",
            },
          }}
        >
          {Sidebar}
        </Drawer>
      ) : (
        <Box sx={{ width: 250, mt: 8 }}>{Sidebar}</Box>
      )}

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flex: 1,

          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "50px",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            height: "calc(107vh - 100px)",
          }}
        >
          {selected === "chat" && <Chat />}
          {selected === "ads" && <AddPage />}
          {selected === "products" && (
            <Typography variant="h6" color="text.secondary">
              Sección Products en construcción 📦
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
