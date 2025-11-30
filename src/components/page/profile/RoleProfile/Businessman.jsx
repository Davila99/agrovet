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
} from "@mui/material";
import { Edit, Close, Save } from "@mui/icons-material";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

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
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
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

  // Inicializar mapa cuando hay coordenadas
  useEffect(() => {
    if (!lat || !lon || !mapContainerRef.current) {
      return;
    }

    // Limpiar mapa anterior si existe
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "osm-layer",
            type: "raster",
            source: "osm-tiles",
          },
        ],
      },
      center: [lon, lat],
      zoom: 14,
    });

    // Agregar controles de navegación
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      // Agregar marcador en la ubicación de la empresa
      new maplibregl.Marker({ color: "#ff6600" })
        .setLngLat([lon, lat])
        .setPopup(
          new maplibregl.Popup({ offset: 12 }).setHTML(
            `<strong>${locationName}</strong><br/>${business_name || ""}`
          )
        )
        .addTo(map);
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lon, locationName, business_name]);

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
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#103E68",
                fontSize: "1.25rem",
              }}
            >
              Ubicación del Negocio
            </Typography>
          </Box>
          <Box
            ref={mapContainerRef}
            sx={{
              width: "100%",
              height: 400,
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          />
          {locationName && (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mt: 1.5,
                fontSize: "0.875rem",
              }}
            >
              {locationName}
            </Typography>
          )}
        </Paper>
      )}
    </>
  );
};

export default BusinessmanProfile;
