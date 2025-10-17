import React from "react";
import { Box, Avatar, Typography, Divider, Grid, Rating } from "@mui/material";

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

const SpecialistProfile = ({ user }) => {
  // Seguridad: si no hay usuario, mostrar nada
  if (!user) return null;

  // Comparar role case-insensitive (el backend puede devolver 'Specialist')
  if ((user.role || "").toString().toLowerCase() !== "specialist") return null;

  // Los datos específicos del especialista vienen en user.specialist_profile
  const profile = user.specialist_profile || {};
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

  return (
    <Box>
      {/* Portada */}

      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: "white",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Información profesional
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            {/* Nombre público, Sobre mí y Profesión apilados */}
            <FieldRow label="Nombre público" value={user_display} />
            <FieldRow label="Sobre mí" value={about_us} />
            <FieldRow label="Profesión" value={profession} />
          </Grid>

          <Grid item xs={12} md={6}>
            {/* El resto en una grid de tarjetas pequeñas */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FieldRow
                  label="Años de experiencia"
                  value={experience_years ?? "0"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FieldRow
                  label="Puede dar consultas"
                  value={can_give_consultations ? "Sí" : "No"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FieldRow
                  label="Ofrece servicios en línea"
                  value={can_offer_online_services ? "Sí" : "No"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ py: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "text.secondary" }}
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <FieldRow label="Puntos" value={point ?? "0"} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SpecialistProfile;
