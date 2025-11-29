import React from "react";
import { Box, Avatar, Typography, Divider, Grid, Rating, Paper } from "@mui/material";

const FieldRow = ({ label, value }) => (
  <Box
    sx={{
      py: 1,
      px: 1.5,
      borderRadius: 1.5,
      borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
      transition: "background-color 0.2s",
      "&:hover": {
        bgcolor: "#f8f9fa",
      },
      "&:last-child": {
        borderBottom: "none",
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

const SpecialistProfile = ({ user }) => {
  // Seguridad: si no hay usuario, mostrar nada
  if (!user) {
    console.log('[Specialist] ❌ No hay usuario');
    return null;
  }

  // Comparar role case-insensitive (el backend puede devolver 'Specialist')
  const userRole = (user.role || "").toString().toLowerCase();
  if (userRole !== "specialist") {
    console.log('[Specialist] ❌ Usuario no es especialista, role:', user.role);
    return null;
  }

  // Los datos específicos del especialista vienen en user.specialist_profile
  const profile = user.specialist_profile || {};
  console.log('[Specialist] 📋 Datos del perfil recibidos:', JSON.stringify(profile, null, 2));
  const {
    user_display,
    profession,
    experience_years,
    about_us,
    can_give_consultations,
    can_offer_online_services,
    puntuations,
    point,
  } = profile;
  
  console.log('[Specialist] 📊 Valores extraídos:', {
    user_display,
    profession,
    experience_years,
    about_us,
    can_give_consultations,
    can_offer_online_services
  });

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
        Información Profesional
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* Años de experiencia primero */}
        <FieldRow
          label="Años de experiencia"
          value={experience_years ? `${experience_years} años` : "0 años"}
        />
        
        <FieldRow label="Profesión" value={profession} />
        
        <FieldRow label="Nombre público" value={user_display} />
        
        <FieldRow label="Sobre mí" value={about_us} />
        
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ flex: "1 1 auto", minWidth: "200px" }}>
            <FieldRow
              label="Puede dar consultas"
              value={can_give_consultations ? "Sí" : "No"}
            />
          </Box>
          <Box sx={{ flex: "1 1 auto", minWidth: "200px" }}>
            <FieldRow
              label="Servicios en línea"
              value={can_offer_online_services ? "Sí" : "No"}
            />
          </Box>
        </Box>
        
        {(puntuations !== undefined || point !== undefined) && (
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-start" }}>
            {puntuations !== undefined && (
              <Box sx={{ flex: "1 1 auto", minWidth: "200px" }}>
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
                      mb: 0.75,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Puntuación
                  </Typography>
                  <Rating
                    name="read-only-rating"
                    value={Number(puntuations) || 0}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                </Box>
              </Box>
            )}
            {point !== undefined && (
              <Box sx={{ flex: "1 1 auto", minWidth: "200px" }}>
                <FieldRow label="Puntos" value={point ?? "0"} />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default SpecialistProfile;
