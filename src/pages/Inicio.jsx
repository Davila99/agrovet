import React from "react";
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";

import banner from "../assets/banner.png";
import Movil from "../assets/movil.svg";

import NotificationsSection from "./HomePage/NotificationsSection";
const WelcomePage = () => {
  return (
    <Box sx={{ bgcolor: "#f8f9fa" }}>
      <Box
        sx={{
          position: "relative",
          color: "white",
          padding: "10px",
          backgroundImage: `url(${banner})`, // ✅ usando import
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
        }}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
        />

        {/* Contenido encima */}
        <Box sx={{ position: "relative", zIndex: 2 }}>
          <Container
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              mt: { xs: 5, md: 0 },
              mb: { xs: 5, md: 0 },
              px: { xs: 5, md: 5 },
            }}>
            <Container
              sx={{
                textAlign: { xs: "center", md: "left" },
                mb: { xs: 5, md: 0 },
              }}>
              <Typography variant="h3" fontWeight="bold">
                Bienvenido a AgroVets
              </Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>
                La primera comunidad de agrónomos y veterinarios,
              </Typography>
              <Typography variant="h6">
                para resolver problemas reales de campo.
              </Typography>
              <Container
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" }, // columna en móvil, fila en escritorio
                  alignItems: { xs: "center", md: "flex-start" },
                  gap: 2,
                  mt: 4,
                }}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#103E68",
                    color: "#fff",
                    fontWeight: "bold",
                    "&:hover": {
                      bgcolor: "#35722b",
                      color: "#fff",
                    },
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    width: { xs: "100%", md: "auto" }, // full en móvil, auto en desktop
                  }}>
                  Descargar App
                </Button>

                <Button
                  variant="outlined"
                  sx={{
                    borderColor: "#fff",
                    color: "white",
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    width: { xs: "100%", md: "auto" }, // full en móvil, auto en desktop
                  }}>
                  Registrarme
                </Button>
              </Container>
            </Container>
            <CardMedia
              component="img"
              image={Movil}
              alt="imagen"
              sx={{
                display: { xs: "none", md: "block" },
                width: 500,
              }}
            />
          </Container>
        </Box>
        <NotificationsSection />
      </Box>
      {/* FEATURES */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h4"
          textAlign="center"
          fontWeight="bold"
          sx={{ color: "#103E68", mb: 6 }}>
          ¿Por qué unirte a AgroVets?
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              title: "Comparte problemas y soluciones",
              desc: "Publica tus dudas sobre cultivos, ganado y medicina veterinaria, y recibe retroalimentación de expertos.",
            },
            {
              title: "Conecta con profesionales",
              desc: "Crea tu perfil y colabora con otros colegas en la comunidad.",
            },
            {
              title: "Accede a conocimiento validado",
              desc: "Encuentra respuestas rápidas y confiables de personas con experiencia en el campo.",
            },
          ].map((feature, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  boxShadow: 3,
                  border: "1px solid #eaeaea",
                }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ color: "#103E68", mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      {/* CALL TO ACTION */}
      <Box
        sx={{
          bgcolor: "#35722b",
          py: 8,
          textAlign: "center",
          color: "#fff",
        }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Únete hoy a la comunidad AgroVets
        </Typography>
        <Typography variant="h6" gutterBottom>
          Comparte, aprende y haz crecer tu red profesional.
        </Typography>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#103E68",
            color: "white",
            fontWeight: "bold",
            px: 4,
            py: 1.5,
            borderRadius: 3,
            mt: 3,
          }}>
          Crear Cuenta Gratis
        </Button>
      </Box>

    </Box>
  );
};
 export default WelcomePage