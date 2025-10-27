import React from "react";
import {
  Box,
  Avatar,
  Typography,
  Divider,
  Grid,
  Link as MuiLink,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const FieldRow = ({ label, value }) => (
  <Box sx={{ py: 1 }}>
    <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{ color: value ? "text.primary" : "text.disabled" }}
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
  const { user_display, business_name, descriptions, offers_local_products } =
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
    <Box>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: "white",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Información del negocio
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Nombre público, Sobre mí (descriptions) y Nombre del negocio apilados */}
            <FieldRow label="Nombre público" value={user_display} />
            <FieldRow label="Descripción" value={descriptions} />
            <FieldRow label="Nombre del negocio" value={business_name} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldRow
                  label="Ofrece productos locales"
                  value={offers_local_products ? "Sí" : "No"}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default BusinessmanProfile;
