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
        <Box
          sx={{
            height: { xs: 90, md: 140 },
            background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />
        <Box sx={{ p: 3, pt: { xs: 0, md: 1 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Avatar
              src={avatar_url}
              alt={user_display ?? user.username}
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              sx={{
                width: { xs: 80, md: 100 },
                height: { xs: 80, md: 100 },
                border: "4px solid",
                borderColor: "background.paper",
                mt: -7,
                boxShadow: 3,
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                flexWrap="wrap"
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {user_display ?? user.username}
                </Typography>
                <Chip
                  icon={<BadgeIcon fontSize="small" />}
                  label={profession ?? "Especialista"}
                  size="small"
                  color="secondary"
                  sx={{ fontWeight: 500 }}
                />
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 0.5 }}
              >
                <Rating
                  name="read-only-header-rating"
                  value={Number(puntuations) || 0}
                  precision={0.5}
                  readOnly
                  size="small"
                />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {Number(puntuations)
                    ? `${puntuations} / 5`
                    : "Sin puntuación"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", ml: 1 }}
                >
                  • {point ?? 0} pts
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {can_give_consultations && (
                  <Chip
                    icon={<ChatIcon />}
                    label="Da consultas"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                )}
                {can_offer_online_services && (
                  <Chip
                    icon={<LanguageIcon />}
                    label="Servicios en línea"
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1}>
              <Tooltip title="Enviar mensaje">
                <IconButton color="primary" size="small">
                  <ChatIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                size="small"
                startIcon={<StarIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2,
                  background:
                    "linear-gradient(90deg, #42a5f5 0%, #1976d2 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #2196f3 0%, #0d47a1 100%)",
                  },
                }}
              >
                Seguir
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* Contenido principal */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper
            component={motion.div}
            elevation={2}
            whileHover={{ scale: 1.01 }}
            sx={{
              p: 3,
              borderRadius: 3,
              transition: "0.2s ease",
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Sobre mí
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography
              variant="body2"
              sx={{
                color: about_us ? "text.primary" : "text.disabled",
                lineHeight: 1.6,
              }}
            >
              {about_us ?? "— Sin información —"}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <FieldRow
              label="Profesión"
              value={profession}
              icon={<WorkOutlineIcon fontSize="small" />}
            />
            <FieldRow
              label="Años de experiencia"
              value={experience_years ?? "0"}
              icon={<AccessTimeIcon fontSize="small" />}
            />
            <FieldRow
              label="Sitio web"
              value={website}
              icon={<LanguageIcon fontSize="small" />}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            component={motion.div}
            elevation={2}
            whileHover={{ scale: 1.01 }}
            sx={{
              p: 3,
              borderRadius: 3,
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Resumen profesional
            </Typography>
            <Divider sx={{ mb: 1 }} />

            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Puntuación
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
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

              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Puntos
                </Typography>
                <Typography variant="body2">{point ?? 0}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Consultas
                </Typography>
                <Typography variant="body2">
                  {can_give_consultations ? "Sí" : "No"}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  En línea
                </Typography>
                <Typography variant="body2">
                  {can_offer_online_services ? "Sí" : "No"}
                </Typography>
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
