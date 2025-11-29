import React from "react";
import {
  Box,
  Avatar,
  Typography,
  Divider,
  Grid,
  Link as MuiLink,
  Paper,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const FieldRow = ({ label, value }) => (
  <Box
    sx={{
      py: 1.5,
      px: 2,
      borderRadius: 2,
      transition: "background-color 0.2s",
      "&:hover": {
        bgcolor: "#f8f9fa",
      },
    }}
  >
    <Typography
      variant="subtitle2"
      sx={{
        color: "text.secondary",
        fontWeight: 600,
        fontSize: "0.7rem",
        mb: 0.4,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: value ? "text.primary" : "text.disabled",
        fontWeight: value ? 500 : 400,
        lineHeight: 1.4,
        whiteSpace: "pre-line",
        fontSize: "0.8rem",
      }}
    >
      {value ?? "— Sin información —"}
    </Typography>
  </Box>
);

const BusinessmanProfile = ({ user }) => {
  if (!user) return null;

  // Comparar role case-insensitive
  if ((user.role || "").toString().toLowerCase() !== "businessman") return null;

  const profile = user.businessman_profile || {};
  const { user_display, business_type, business_name, descriptions, offers_local_products } =
    profile;

  // las coordenadas las proporciona el objeto `user` (cliente)
  const lat = user.latitude ?? null;
  const lon = user.longitude ?? null;
  const mapLink =
    lat && lon
      ? `/comunidad/mapa?lat=${encodeURIComponent(
          lat
        )}&lon=${encodeURIComponent(lon)}`
      : `/comunidad/mapa?q=${encodeURIComponent(
          location_description || business_name || ""
        )}`;

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        bgcolor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: "#103E68",
          mb: 1.5,
          fontSize: "1rem",
        }}
      >
        Información del Negocio
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FieldRow label="Nombre público" value={user_display} />
            <FieldRow label="Tipo de negocio" value={business_type} />
            <FieldRow label="Descripción" value={descriptions} />
            <FieldRow label="Nombre del negocio" value={business_name} />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {offers_local_products !== undefined && (
              <FieldRow
                label="Ofrece productos locales"
                value={offers_local_products ? "Sí" : "No"}
              />
            )}
            {(lat || lon) && (
              <FieldRow
                label="Ubicación"
                value={lat && lon ? `${lat}, ${lon}` : "No especificada"}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BusinessmanProfile;
