import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Rating,
} from "@mui/material";
import { Edit, Close, Save } from "@mui/icons-material";
import SimpleMapCard from "../../../../../components/molecules/Map/SimpleMapCard";

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

const BusinessmanProfile = ({ user, isOwnProfile = false, onChange, onSave }) => {
  const [editing, setEditing] = useState(false);

  if (!user) return null;

  // Comparar role case-insensitive
  if ((user.role || "").toString().toLowerCase() !== "businessman") return null;

  const profile = user.businessman_profile || {};
  const { user_display, business_type, business_name, descriptions, offers_local_products } =
    profile;

  // las coordenadas las proporciona el objeto `user` (cliente)
  const lat = user.latitude ?? profile.latitude ?? null;
  const lon = user.longitude ?? profile.longitude ?? null;
  const locationName = user.location_description || business_name || "Ubicación del negocio";
  const mapLink =
    lat && lon
      ? `/comunidad/mapa?lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lon)}`
      : `/comunidad/mapa?q=${encodeURIComponent(
        locationName
      )}`;

  // El mapa ahora se renderiza usando SimpleMapCard

  // Handler para cambios en campos del negocio
  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    // Los campos del negocio se guardan en businessman_profile
    if (onChange) {
      // Crear un evento sintético que actualice businessman_profile
      const syntheticEvent = {
        target: {
          name: `businessman_profile.${name}`,
          value: value,
        },
      };
      onChange(syntheticEvent);
    }
  };

  const handleSaveBusiness = async () => {
    if (onSave) {
      // Llamar onSave con 'business' para indicar que solo guardamos info del negocio
      await onSave('business');
    }
    setEditing(false);
  };

  return (
    <>
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#103E68",
              fontSize: "1rem",
            }}
          >
            Información del Negocio
          </Typography>
          {isOwnProfile && !editing && (
            <Tooltip title="Editar información del negocio">
              <IconButton
                size="small"
                onClick={() => setEditing(true)}
                sx={{
                  color: "#1877F2",
                  bgcolor: "rgba(24, 119, 242, 0.08)",
                  "&:hover": {
                    bgcolor: "rgba(24, 119, 242, 0.15)",
                  },
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {editing && (
            <Tooltip title="Cancelar edición">
              <IconButton
                size="small"
                onClick={() => setEditing(false)}
                sx={{
                  color: "#666",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.08)",
                  },
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {editing ? (
                <>
                  {/* Campos editables */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 0.75, fontWeight: 600, fontSize: "0.75rem" }}>
                      Nombre público
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      name="user_display"
                      value={profile.user_display || ""}
                      onChange={handleBusinessChange}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 0.75, fontWeight: 600, fontSize: "0.75rem" }}>
                      Nombre del negocio
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      name="business_name"
                      value={profile.business_name || ""}
                      onChange={handleBusinessChange}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 0.75, fontWeight: 600, fontSize: "0.75rem" }}>
                      Descripción
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      name="descriptions"
                      value={profile.descriptions || ""}
                      onChange={handleBusinessChange}
                      multiline
                      rows={3}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Box>
                  
                  {/* Campo de solo lectura */}
                  <Divider sx={{ my: 1 }} />
                  <FieldRow label="Tipo de negocio (no editable)" value={business_type} />
                </>
              ) : (
                <>
                  <FieldRow label="Nombre público" value={user_display} />
                  <FieldRow label="Tipo de negocio" value={business_type} />
                  <FieldRow label="Nombre del negocio" value={business_name} />
                  <FieldRow label="Descripción" value={descriptions} />
                  {offers_local_products !== undefined && (
                    <FieldRow
                      label="Ofrece productos locales"
                      value={offers_local_products ? "Sí" : "No"}
                    />
                  )}

                  {/* Tarjeta compacta de Reputación y Rating Público para Businessman */}
                  <Box sx={{ mt: 1.5, p: 2, borderRadius: 2.5, bgcolor: "rgba(42, 171, 238, 0.04)", border: "1px solid rgba(42, 171, 238, 0.15)" }}>
                    <Typography variant="subtitle2" sx={{ color: "#2AABEE", fontWeight: 700, fontSize: "0.75rem", mb: 1, textTransform: "uppercase" }}>
                      Reputación y Calificación Comercial
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: "#D97706", fontSize: "1.1rem" }}>
                            ⭐ {Number(profile.puntuations || 0).toFixed(1)} / 5
                          </Typography>
                          <Rating
                            name="read-only-businessman-rating"
                            value={Number(profile.puntuations) || 0}
                            precision={0.5}
                            readOnly
                            size="small"
                            sx={{ "& .MuiRating-iconFilled": { color: "#F59E0B" } }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Calificación promedio del negocio
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: "#10B981", fontSize: "1.1rem" }}>
                            🏆 {profile.point ?? 0}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#065F46" }}>
                            puntos de reputación
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Reputación del comercio
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              )}
            </Box>
          </Grid>
        </Grid>

        {editing && (
          <Box textAlign="right" mt={3}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<Save />}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.8rem",
                px: 2,
                py: 0.75,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                },
              }}
              onClick={handleSaveBusiness}
            >
              Guardar cambios
            </Button>
          </Box>
        )}
      </Paper>

      {/* Card del mapa separada */}
      {lat && lon && (
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            bgcolor: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            mt: 3,
          }}
        >
          <SimpleMapCard 
            lat={lat} 
            lon={lon} 
            locationName={locationName} 
            businessName={business_name} 
            title="Ubicación del Negocio" 
          />
        </Paper>
      )}
    </>
  );
};

export default BusinessmanProfile;
