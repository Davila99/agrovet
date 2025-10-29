import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Toolbar,
  Typography,
  AppBar,
  CssBaseline,
  useMediaQuery,
  Paper,
} from "@mui/material";

import Chat from "./Chat";
import SpecialistsList from "./Dashboard/SpecialistsList";
// import Configuracion from "./Configuracion";

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selected, setSelected] = useState("chat");
  const isMd = useMediaQuery("(min-width:900px)");

  const location = useLocation();

  // Sincronizar la pestaña seleccionada con el query param ?tab=
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const tab = params.get("tab");
      if (tab === "chat" || tab === "config" || tab === "specialists")
        setSelected(
          tab === "config"
            ? "config"
            : tab === "specialists"
            ? "specialists"
            : "chat"
        );
    } catch (e) {
      // ignore
    }
  }, [location.search]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", }}>
      <CssBaseline />
      {/* AppBar superior */}
      <AppBar
        position="fixed"
        sx={{ bgcolor: "primary.main", boxShadow: 2 }}
      />

      {/* Toolbar spacer to offset the fixed AppBar */}
      <Toolbar />

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 1, bgcolor: "#f4f6f8" }}
      >
        <Paper
          sx={{
            // Use a responsive calc so the content is always visible below the AppBar
            height: { xs: "calc(100vh - 112px)", md: "calc(100vh - 160px)" },
            boxShadow: 3,
            overflow: "hidden",
          }}
        >
          {selected === "chat" && <Chat />}
          {selected === "specialists" && <SpecialistsList />}
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
