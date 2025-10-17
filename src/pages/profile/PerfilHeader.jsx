import React from "react";
import { Box, Avatar, Typography, Button } from "@mui/material";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import { Link as RouterLink } from "react-router-dom";

const PerfilHeader = ({ user, editing, setEditing }) => {
  const handleEditToggle = () => setEditing && setEditing((prev) => !prev);

  const buildMapLinkForBusiness = () => {
    const profile = (user && user.businessman_profile) || {};
    // las coords las tiene el cliente (user)
    const lat = user?.latitude ?? null;
    const lon = user?.longitude ?? null;
    const q =
      profile.location_description ||
      profile.business_name ||
      user?.location_description ||
      user?.address ||
      "";
    if (
      lat !== null &&
      lon !== null &&
      lat !== undefined &&
      lon !== undefined &&
      lat !== "" &&
      lon !== ""
    ) {
      return `/comunidad/mapa?lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lon)}`;
    }
    return `/comunidad/mapa?q=${encodeURIComponent(q)}`;
  };

  return (
    <>
      <Box
        sx={{
          height: { xs: 120, sm: 160 },
          backgroundImage: `linear-gradient(120deg, #E8F5E9 0%, #C8E6C9 100%), repeating-radial-gradient(circle at 20% 20%, rgba(102,187,106,0.2), rgba(56,142,60,0.2) 40px, transparent 40px, transparent 80px)`,
          backgroundBlendMode: "multiply",
          backgroundSize: "160px 160px",
          backgroundPosition: "0 0, 80px 80px",
          position: "relative",
        }}
      />

      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          mt: { xs: -7, sm: -8 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "center", sm: "flex-end" },
          gap: 2,
        }}
      >
        <Avatar
          src={user?.profile_picture}
          alt={user?.full_name}
          sx={{
            width: { xs: 90, sm: 120 },
            height: { xs: 90, sm: 120 },
            border: "4px solid white",
            fontSize: 40,
          }}
        >
          {!user?.profile_picture &&
            `${user?.full_name?.[0] || ""}${user?.last_name?.[0] || ""}`}
        </Avatar>

        <Box sx={{ flexGrow: 1, textAlign: { xs: "center", sm: "left" } }}>
          <Typography variant="h6" fontWeight="bold" color="#103E68">
            {user?.full_name} {user?.last_name}
          </Typography>
          <Typography color="text.secondary">
            {user?.role === "Specialist" && "Especialista"}
            {user?.role === "businessman" && "Negocio"}
            {user?.role === "consumer" && "Consumidor"}
          </Typography>
        </Box>

        <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
          {(user?.role || "").toString().toLowerCase() === "businessman" && (
            <Button
              component={RouterLink}
              to={buildMapLinkForBusiness()}
              variant="outlined"
              startIcon={<MapOutlinedIcon />}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Ir al mapa
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
};

export default PerfilHeader;
