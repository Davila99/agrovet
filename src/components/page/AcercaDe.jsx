import React from "react";
import AVALogo from "../../assets/AVA.svg";
import AVAFallback from "../../assets/logo.svg";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Button,
  Grid,
  Avatar,
  Paper,
  Stack,
} from "@mui/material";

const QuienesSomos = () => {
  // Envío de mensajes al widget de AVA mediante CustomEvent
  function sendToAVA(text) {
    try {
      const event = new CustomEvent("n8n-chat-message", { detail: { text } });
      window.dispatchEvent(event);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error enviando mensaje a AVA:", e);
    }
  }

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
        <ListItem
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            mb: 1,
          }}
        >
          <Chip
            label="Integración de ciencia y tecnología"
            color="primary"
            sx={{ mb: { xs: 1, sm: 0 } }}
          />
          <ListItemText
            sx={{ ml: { xs: 0, sm: 2 } }}
            primary="Fortalecer la salud animal y el desarrollo productivo"
          />
        </ListItem>

        <ListItem
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            mb: 1,
          }}
        >
          <Chip
            label="Colaboración profesional"
            color="secondary"
            sx={{ mb: { xs: 1, sm: 0 } }}
          />
          <ListItemText
            sx={{ ml: { xs: 0, sm: 2 } }}
            primary="Fomentar el intercambio de experiencias y conocimiento"
          />
        </ListItem>

        <ListItem
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
          }}
        >
          <Chip
            label="Innovación constante"
            color="success"
            sx={{ mb: { xs: 1, sm: 0 } }}
          />
          <ListItemText
            sx={{ ml: { xs: 0, sm: 2 } }}
            primary="Transformar la manera en que los profesionales interactúan"
          />
        </ListItem>
      </List>

      <Divider sx={{ my: 3, backgroundColor: "#e6eef8" }} />

      {/* Qué hacemos, Visión y Objetivos */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
        Qué hacemos
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Desarrollamos soluciones digitales para mejorar la salud animal y la
        productividad agrícola. Nuestra plataforma facilita la comunicación
        entre productores, veterinarios y agrónomos, permite compartir casos
        clínicos, publicar servicios y acceder a recomendaciones prácticas.
      </Typography>

      <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mt: 1 }}>
        Visión
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Ser la plataforma de referencia en la región para la gestión de salud
        animal y prácticas agrícolas sostenibles, conectando conocimiento
        técnico con tecnología accesible para todos los actores del sector.
      </Typography>

      <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mt: 1 }}>
        Objetivos
      </Typography>
      <List>
        <ListItem>
          <ListItemText
            primary="Mejorar el acceso a asesoría técnica"
            secondary="Facilitar el contacto entre productores y profesionales capacitados."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Promover buenas prácticas"
            secondary="Difundir guías y recomendaciones basadas en evidencia para el manejo animal y agrícola."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Fomentar la colaboración"
            secondary="Crear espacios para compartir casos, experiencias y soluciones conjuntas."
          />
        </ListItem>
      </List>

      {/* Sección AVA */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
        Conócenos — AVA
      </Typography>

      <Paper
        sx={{ p: 2, mt: 1, backgroundColor: "rgba(240,249,255,0.8)" }}
        elevation={0}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                bgcolor: "#22c55e",
                width: 64,
                height: 64,
                fontWeight: 700,
              }}
            >
              <img
                src={AVALogo}
                alt="AVA"
                style={{ width: 44, height: 44 }}
                onError={(e) => {
                  // @ts-ignore
                  e.currentTarget.onerror = null;
                  // @ts-ignore
                  e.currentTarget.src = AVAFallback;
                }}
              />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="subtitle1" fontWeight={700}>
              AVA — Tu asistente Agrovets
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AVA te ayuda con dudas sobre cuidado animal, recomendaciones de
              prácticas agrícolas, y pasos para registrarte y aprovechar la
              plataforma.
            </Typography>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => sendToAVA("¿Cómo me registro?")}
          >
            Cómo registrarme
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => sendToAVA("Recomendaciones para vacunas")}
          >
            Vacunas
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => sendToAVA("Consejos para control de plagas")}
          >
            Control de plagas
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => sendToAVA("Habla con un veterinario")}
          >
            Contactar profesional
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default QuienesSomos;
