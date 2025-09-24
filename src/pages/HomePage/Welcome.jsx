import React from "react";
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
} from "@mui/material";

const WelcomePage = () => {
  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* HERO */}
      <Box
        sx={{
          bgcolor: "#103E68",
          color: "white",
          py: 10,
          textAlign: "center",
        }}>
        <Container maxWidth="md">
          <Typography variant="h2" fontWeight="bold">
            Bienvenido a AgroVets
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 4 }}>
            La primera comunidad de agrónomos y veterinarios para resolver
            problemas reales de campo.
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#A3BB71",
              color: "#103E68",
              fontWeight: "bold",
              px: 4,
              py: 1.5,
              borderRadius: 3,
              mr: 2,
            }}>
            Descargar App
          </Button>
          <Button
            variant="outlined"
            sx={{
              borderColor: "#A3BB71",
              color: "white",
              px: 4,
              py: 1.5,
              borderRadius: 3,
            }}>
            Registrarme
          </Button>
        </Container>
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
          bgcolor: "#A3BB71",
          py: 8,
          textAlign: "center",
          color: "#103E68",
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

      {/* FOOTER */}
      <Box
        sx={{ bgcolor: "#103E68", color: "white", py: 3, textAlign: "center" }}>
        <Typography variant="body2">
          © {new Date().getFullYear()} AgroVets. Todos los derechos reservados.
        </Typography>
      </Box>
    </Box>
  );
}
 export default WelcomePage