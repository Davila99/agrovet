import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from "@mui/material";
import Footer from "./Footer";
import { motion } from "framer-motion";

// usar motion(Component) directamente
const MotionBox = motion(Box);
const MotionListItem = motion(ListItem);
const MotionChip = motion(Chip);
const MotionTypography = motion(Typography);

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, when: "beforeChildren" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const listItemSx = {
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "flex-start", sm: "center" },
  mb: 1,
  borderRadius: 2,
  p: 1,
  transition: "transform 300ms, box-shadow 300ms",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 8px 20px rgba(11,34,64,0.08)",
  },
};

const missionPoints = [
  {
    chip: { label: "Integración de ciencia y tecnología", color: "primary" },
    text: "Fortalecer la salud animal y el desarrollo productivo",
  },
  {
    chip: { label: "Colaboración profesional", color: "secondary" },
    text: "Fomentar el intercambio de experiencias y conocimiento",
  },
  {
    chip: { label: "Innovación constante", color: "success" },
    text: "Transformar la manera en que los profesionales interactúan",
  },
];

const objectives = [
  {
    primary: "Mejorar el acceso a asesoría técnica",
    secondary:
      "Facilitar el contacto entre productores y profesionales capacitados.",
  },
  {
    primary: "Promover buenas prácticas",
    secondary:
      "Difundir guías y recomendaciones basadas en evidencia para el manejo animal y agrícola.",
  },
  {
    primary: "Fomentar la colaboración",
    secondary:
      "Crear espacios para compartir casos, experiencias y soluciones conjuntas.",
  },
];

const QuienesSomos = () => {
  return (
    <Box>
      <MotionBox
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
        sx={{
          color: "#0b2140",
          maxWidth: "1200px",
          mx: "auto",
          px: 3,
          py: 6,
          pt: 15,
        }}
        aria-labelledby="quienes-somos-title"
      >
        <MotionTypography
          id="quienes-somos-title"
          variant="h4"
          component="h1"
          fontWeight="bold"
          gutterBottom
          variants={{
            hidden: { opacity: 0, y: 12, letterSpacing: 0 },
            show: {
              opacity: 1,
              y: 0,
              letterSpacing: 1.2,
              transition: { duration: 0.8 },
            },
          }}
          sx={{
            fontSize: { xs: "1.6rem", sm: "2.1rem", md: "2.6rem" },
            background:
              "-webkit-linear-gradient(90deg, #0b6cff, #00c6a7 60%, #ffb86b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Quiénes Somos
        </MotionTypography>

        <MotionTypography
          variant="body1"
          sx={{ mb: 3, fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" } }}
          variants={itemVariants}
        >
          Somos un emprendimiento tecnológico que desarrolla software
          especializado para el sector veterinario y agropecuario. Nuestra
          plataforma conecta a veterinarios, agrónomos, productores y
          propietarios de animales, permitiendo realizar consultas, compartir
          casos clínicos, publicar productos y servicios, y debatir
          experiencias.
        </MotionTypography>

        <Divider sx={{ mb: 3, backgroundColor: "#d7eaf7" }} />

        <MotionTypography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          variants={itemVariants}
          sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.7rem" } }}
        >
          Nuestra misión
        </MotionTypography>

        <List aria-label="puntos de misión">
          {missionPoints.map((m, idx) => (
            <MotionListItem key={idx} variants={itemVariants} sx={listItemSx}>
              <MotionChip
                label={m.chip.label}
                color={m.chip.color}
                whileHover={{ scale: 1.04, y: -3 }}
                sx={{ mb: { xs: 1, sm: 0 } }}
                aria-hidden="false"
              />
              <ListItemText
                sx={{ ml: { xs: 0, sm: 2 } }}
                primary={m.text}
                primaryTypographyProps={{ component: "p" }}
              />
            </MotionListItem>
          ))}
        </List>

        <Divider sx={{ my: 3, backgroundColor: "#e6eef8" }} />

        <MotionTypography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          variants={itemVariants}
          sx={{ mt: 2 }}
        >
          Qué hacemos
        </MotionTypography>

        <MotionTypography
          variant="body1"
          sx={{ mb: 2 }}
          variants={itemVariants}
        >
          Desarrollamos soluciones digitales para mejorar la salud animal y la
          productividad agrícola. Nuestra plataforma facilita la comunicación
          entre productores, veterinarios y agrónomos, permite compartir casos
          clínicos, publicar servicios y acceder a recomendaciones prácticas.
        </MotionTypography>

        <MotionTypography
          variant="h6"
          fontWeight="600"
          gutterBottom
          sx={{ mt: 1 }}
          variants={itemVariants}
        >
          Visión
        </MotionTypography>
        <MotionTypography
          variant="body2"
          sx={{ mb: 2 }}
          variants={itemVariants}
        >
          Ser la plataforma de referencia en la región para la gestión de salud
          animal y prácticas agrícolas sostenibles, conectando conocimiento
          técnico con tecnología accesible para todos los actores del sector.
        </MotionTypography>

        <MotionTypography
          variant="h6"
          fontWeight="600"
          gutterBottom
          sx={{ mt: 1 }}
          variants={itemVariants}
        >
          Objetivos
        </MotionTypography>

        <List aria-label="objetivos">
          {objectives.map((o, idx) => (
            <MotionListItem key={idx} variants={itemVariants}>
              <ListItemText primary={o.primary} secondary={o.secondary} />
            </MotionListItem>
          ))}
        </List>
      </MotionBox>

      <Footer />
    </Box>
  );
};

export default React.memo(QuienesSomos);
