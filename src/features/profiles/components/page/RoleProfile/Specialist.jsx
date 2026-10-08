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
        
        {/* Render specialties if they exist */}
        {profile.specialties && profile.specialties.length > 0 && (
          <Box
            sx={{
              py: 1,
              px: 1.5,
              borderRadius: 1.5,
              borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
              transition: "background-color 0.2s",
              "&:hover": { bgcolor: "#f8f9fa" },
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                fontSize: "0.7rem",
                mb: 1,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Especialidades
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {profile.specialties.map((spec, index) => (
                <Box key={index}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.8rem", mb: 0.5 }}>
                    {spec.name}
                  </Typography>
                  {spec.areas && spec.areas.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {spec.areas.map((area, idx) => (
                        <Box key={idx} sx={{ bgcolor: 'rgba(21,101,192,0.08)', color: '#1565C0', px: 1, py: 0.3, borderRadius: 2, border: '1px solid rgba(21,101,192,0.2)' }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.7rem" }}>
                            {area}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
        
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
        
        {/* Tarjeta compacta de Reputación y Rating Público */}
        <Box sx={{ mt: 1, p: 2, borderRadius: 2.5, bgcolor: "rgba(16, 62, 104, 0.04)", border: "1px solid rgba(16, 62, 104, 0.12)" }}>
          <Typography variant="subtitle2" sx={{ color: "#103E68", fontWeight: 700, fontSize: "0.75rem", mb: 1, textTransform: "uppercase" }}>
            Reputación y Calificación Pública
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#D97706", fontSize: "1.1rem" }}>
                  ⭐ {Number(puntuations || 0).toFixed(1)} / 5
                </Typography>
                <Rating
                  name="read-only-rating"
                  value={Number(puntuations) || 0}
                  precision={0.5}
                  readOnly
                  size="small"
                  sx={{ "& .MuiRating-iconFilled": { color: "#F59E0B" } }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Calificación promedio válida
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#10B981", fontSize: "1.1rem" }}>
                  🏆 {point ?? 0}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#065F46" }}>
                  puntos de reputación
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Actividad y contribuciones AgroVets
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
};

export default SpecialistProfile;
