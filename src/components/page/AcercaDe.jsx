import React from "react";
import LandingAgrovets from "./HomePage/LandingAgrovets";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";

// `motion()` está deprecado; usar motion.create() por compatibilidad con la nueva API
const MotionBox = motion.create ? motion.create(Box) : motion(Box);
const MotionListItem = motion.create
  ? motion.create(ListItem)
  : motion(ListItem);
const MotionChip = motion.create ? motion.create(Chip) : motion(Chip);
const MotionTypography = motion.create
  ? motion.create(Typography)
  : motion(Typography);

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

const QuienesSomos = () => {
  return (
    <MotionBox
      initial="hidden"
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
    >
      {/* Título */}
      <MotionTypography
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

      {/* Descripción principal */}
      <MotionTypography
        variant="body1"
        sx={{ mb: 3, fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" } }}
        variants={itemVariants}
      >
        Somos un emprendimiento tecnológico que desarrolla software
        especializado para el sector veterinario y agropecuario. Nuestra
        plataforma conecta a veterinarios, agrónomos, productores y propietarios
        de animales, permitiendo realizar consultas, compartir casos clínicos,
        publicar productos y servicios, y debatir experiencias.
      </MotionTypography>

      <Divider sx={{ mb: 3, backgroundColor: "#d7eaf7" }} />

      {/* Nuestra misión */}
      <MotionTypography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        variants={itemVariants}
        sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.7rem" } }}
      >
        Nuestra misión
      </MotionTypography>

      <List>
        <MotionListItem
          variants={itemVariants}
          sx={{
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
          }}
        >
          <MotionChip
            label="Integración de ciencia y tecnología"
            color="primary"
            whileHover={{ scale: 1.04, y: -3 }}
            sx={{ mb: { xs: 1, sm: 0 } }}
          />
          <ListItemText
            sx={{ ml: { xs: 0, sm: 2 } }}
            primary="Fortalecer la salud animal y el desarrollo productivo"
          />
        </MotionListItem>

        <MotionListItem
          variants={itemVariants}
          sx={{
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
          }}
        >
          <MotionChip
            label="Colaboración profesional"
            color="secondary"
            whileHover={{ scale: 1.04, y: -3 }}
            sx={{ mb: { xs: 1, sm: 0 } }}
          />
          <ListItemText
            sx={{ ml: { xs: 0, sm: 2 } }}
            primary="Fomentar el intercambio de experiencias y conocimiento"
          />
        </MotionListItem>

        <MotionListItem
          variants={itemVariants}
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            borderRadius: 2,
            p: 1,
            transition: "transform 300ms, box-shadow 300ms",
            "&:hover": {
              transform: "translateY(-6px)",
              boxShadow: "0 8px 20px rgba(11,34,64,0.08)",
            },
          }}
        >
          <MotionChip
            label="Innovación constante"
            color="success"
            whileHover={{ scale: 1.04, y: -3 }}
            sx={{ mb: { xs: 1, sm: 0 } }}
          />
          <ListItemText
            sx={{ ml: { xs: 0, sm: 2 } }}
            primary="Transformar la manera en que los profesionales interactúan"
          />
        </MotionListItem>
      </List>

      <Divider sx={{ my: 3, backgroundColor: "#e6eef8" }} />

      {/* Qué hacemos, Visión y Objetivos */}
      <MotionTypography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        variants={itemVariants}
        sx={{ mt: 2 }}
      >
        Qué hacemos
      </MotionTypography>

      <MotionTypography variant="body1" sx={{ mb: 2 }} variants={itemVariants}>
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
      <MotionTypography variant="body2" sx={{ mb: 2 }} variants={itemVariants}>
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

      <List>
        <MotionListItem variants={itemVariants}>
          <ListItemText
            primary="Mejorar el acceso a asesoría técnica"
            secondary="Facilitar el contacto entre productores y profesionales capacitados."
          />
        </MotionListItem>
        <MotionListItem variants={itemVariants}>
          <ListItemText
            primary="Promover buenas prácticas"
            secondary="Difundir guías y recomendaciones basadas en evidencia para el manejo animal y agrícola."
          />
        </MotionListItem>
        <MotionListItem variants={itemVariants}>
          <ListItemText
            primary="Fomentar la colaboración"
            secondary="Crear espacios para compartir casos, experiencias y soluciones conjuntas."
          />
        </MotionListItem>
      </List>
    </MotionBox>
  );
};

export default QuienesSomos;
