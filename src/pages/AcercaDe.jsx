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

const QuienesSomos = () => {
  return (
    <Box
      sx={{
        maxWidth: { xs: "90%", sm: "700px", md: "800px" }, // ancho adaptable
        margin: "0 auto",
        padding: { xs: "1rem", sm: "2rem", md: "2.5rem" }, // padding adaptable
        color: "#000",
      }}
    >
      {/* Título */}
      <Typography
        variant="h4"
        component="h1"
        fontWeight="bold"
        gutterBottom
        sx={{ fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" } }} // tamaño adaptable
      >
        Quiénes Somos
      </Typography>

      {/* Descripción principal */}
      <Typography
        variant="body1"
        sx={{ mb: 3, fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" } }}
      >
        Somos un emprendimiento tecnológico que desarrolla software
        especializado para el sector veterinario y agropecuario. Nuestra
        plataforma conecta a veterinarios, agrónomos, productores y propietarios
        de animales, permitiendo realizar consultas, compartir casos clínicos,
        publicar productos y servicios, y debatir experiencias.
      </Typography>

      <Divider sx={{ mb: 3, backgroundColor: "#ccc" }} />

      {/* Valores / Beneficios */}
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.7rem" } }}
      >
        Nuestra misión
      </Typography>

      <List>
        <ListItem sx={{ flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, mb: 1 }}>
          <Chip label="Integración de ciencia y tecnología" color="primary" sx={{ mb: { xs: 1, sm: 0 } }} />
          <ListItemText
            sx={{ ml: { xs: 0, sm: 2 } }}
            primary="Fortalecer la salud animal y el desarrollo productivo"
          />
        </ListItem>

        <ListItem sx={{ flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, mb: 1 }}>
          <Chip label="Colaboración profesional" color="secondary" sx={{ mb: { xs: 1, sm: 0 } }} />
          <ListItemText
            sx={{ ml: { xs: 0, sm: 2 } }}
            primary="Fomentar el intercambio de experiencias y conocimiento"
          />
        </ListItem>

        <ListItem sx={{ flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" } }}>
          <Chip label="Innovación constante" color="success" sx={{ mb: { xs: 1, sm: 0 } }} />
          <ListItemText
            sx={{ ml: { xs: 0, sm: 2 } }}
            primary="Transformar la manera en que los profesionales interactúan"
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default QuienesSomos;
