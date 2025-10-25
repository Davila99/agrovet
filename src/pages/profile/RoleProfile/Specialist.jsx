import React from "react";
import {
  Box,
  Avatar,
  Typography,
  Divider,
  Grid,
  Rating,
  Paper,
  Stack,
  Chip,
  IconButton,
  Button,
  Tooltip,
} from "@mui/material";
import { motion } from "framer-motion";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LanguageIcon from "@mui/icons-material/Language";
import ChatIcon from "@mui/icons-material/Chat";
import StarIcon from "@mui/icons-material/Star";
import BadgeIcon from "@mui/icons-material/Badge";

const FieldRow = ({ label, value, icon }) => (
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}>
    {icon && <Box color="primary.main">{icon}</Box>}
    <Box>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: value ? "text.primary" : "text.disabled",
          fontWeight: 500,
        }}
      >
        {value ?? "— Sin información —"}
      </Typography>
    </Box>
  </Stack>
);

const SpecialistProfile = ({ user }) => {
  if (!user) return null;
  if ((user.role || "").toString().toLowerCase() !== "specialist") return null;

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
    avatar_url,
    website,
  } = profile;

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      {/* Encabezado */}
      <Paper
        component={motion.div}
        elevation={3}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          overflow: "visible",
          mb: 3,
          position: "relative",
          borderRadius: 3,
          background:
            "linear-gradient(145deg, rgba(25,118,210,0.12), rgba(13,71,161,0.08))",
          backdropFilter: "blur(6px)",
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Información profesional
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Nombre público, Sobre mí y Profesión apilados */}
            <FieldRow label="Nombre público" value={user_display} />
            <FieldRow label="Sobre mí" value={about_us} />
            <FieldRow label="Profesión" value={profession} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {/* El resto en una grid de tarjetas pequeñas */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldRow
                  label="Años de experiencia"
                  value={experience_years ?? "0"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldRow
                  label="Puede dar consultas"
                  value={can_give_consultations ? "Sí" : "No"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldRow
                  label="Ofrece servicios en línea"
                  value={can_offer_online_services ? "Sí" : "No"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ py: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "text.secondary" }}
                  >
                    Puntuación
                  </Typography>
                  <Rating
                    value={Number(puntuations) || 0}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                  <Typography variant="body2">
                    {Number(puntuations) ? puntuations : "—"}
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldRow label="Puntos" value={point ?? "0"} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Acciones
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                startIcon={<ChatIcon />}
                sx={{
                  textTransform: "none",
                  borderColor: "primary.main",
                }}
              >
                Solicitar consulta
              </Button>
              <Button
                fullWidth
                variant="contained"
                size="small"
                sx={{
                  textTransform: "none",
                  background:
                    "linear-gradient(90deg, #42a5f5 0%, #1976d2 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #2196f3 0%, #0d47a1 100%)",
                  },
                }}
              >
                Contactar
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SpecialistProfile;
