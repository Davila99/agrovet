import React from "react";
import { Box, Typography, Divider, Button } from "@mui/material";
import { motion } from "framer-motion";
import ImgOne from "../../assets/image/img1.webp";
import ImgThree from "../../assets/image/img3.webp";
import ImgFour from "../../assets/image/img4.webp";
import ImgFive from "../../assets/image/img5.webp";

// Animación básica para secciones
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const LandingAgrovetsAnim = () => {
  return (
    <Box
      sx={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem",
        color: "#000",
      }}>
      {/* Sección 1: Hero */}
      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: 3,
            mb: 5,
          }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Descubre el futuro agropecuario de Nicaragua con Agrovets
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Sabías que Nicaragua tiene un gran potencial en el sector
              agropecuario, pero a menudo se enfrenta a desafíos de salud e
              información.
            </Typography>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#103E68",
                color: "#fff",
                fontWeight: "bold",
                transition: "transform 0.4s ease",
                "&:hover": {
                  bgcolor: "#35722b",
                  color: "#fff",
                  transform: "scale(1.1)",
                },
                px: 4,
                py: 1.5,
                borderRadius: 3,
                width: { xs: "100%", md: "auto" },
              }}>
              Únete ahora
            </Button>
          </Box>
          <Box />

          <Box
            component="img"
            src={ImgOne}
            alt="camion"
            sx={{
              width: 500,
              borderRadius: 3,
              transition: "transform 0.4s ease",
              "&:hover": {
                transform: "scale(1.1)",
              },
            }}
          />
        </Box>
      </motion.div>

      <Divider sx={{ mb: 5 }} />

      {/* Sección 2: Datos del sector */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Situación del sector agropecuario
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Nuestro país es destacado por su agricultura y ganadería. Según el
            Banco Central de Nicaragua, el primer trimestre del año 2023, el
            valor de las exportaciones totales fue de 2,014.6 millones de
            dólares, donde el sector agropecuario representó el 2.4%. Sin
            embargo, en el primer trimestre de este año hubo una caída del 4.5%
            respecto al año anterior, de la cual el 3.11% se debe a la
            disminución en las exportaciones del sector agropecuario.
          </Typography>
          <Box
            component="img"
            src={ImgThree}
            alt="camion"
            sx={{
              width: "100%",
              height: 200,
              borderRadius: 3,
              objectFit: "cover",
              transition: "transform 0.4s ease",
              "&:hover": {
                transform: "scale(1.1)",
              },
            }}
          />
        </Box>
      </motion.div>

      <Divider sx={{ mb: 5 }} />

      {/* Sección 3: Desafíos y solución */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}>
        <Box
          sx={{
            borderRadius: 5,
            color: "#fff",
            mb: 6,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: { xs: 4, md: 6 },
            bgcolor: "#35722b",
            pb: 2,
            p: { xs: 1, md: 0 },
            mt: 10,
          }}>
          <Box
            component="img"
            src={ImgFour}
            alt="camion"
            sx={{
              width: { xs: "100%", md: "40%" },
              height: { xs: 300, md: 310 },
              mt: { xs: 0, md: -2 },
              ml: { xs: -0, md: -2 },
              borderRadius: 4,
              objectFit: "cover",
              boxShadow: "0 12px 24px rgba(0,0,0,0.3)",
              transform: "translateY(-20px)",
              transition: "transform 0.4s ease, box-shadow 0.4s ease",
              "&:hover": {
                transform: "translateY(-25px) scale(1.05)",
                boxShadow: "0 16px 32px rgba(0,0,0,0.4)",
              },
            }}
          />

          {/* Texto */}
          <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              gutterBottom
              sx={{ fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
              Salud de cultivos y ganado
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 2,
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                lineHeight: 1.6,
              }}>
              La salud de cultivos y ganado, tanto bovino como porcino, es
              esencial. Sin embargo, los productores enfrentan desafíos debido a
              la falta de accesibilidad en tiempo real a veterinarios y
              agrónomos.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                lineHeight: 1.6,
              }}>
              Aquí es donde entra Agrovets, la aplicación móvil revolucionaria
              diseñada para impulsar a los agricultores y ganaderos de
              Nicaragua.
            </Typography>
          </Box>
        </Box>
      </motion.div>

      <Divider sx={{ mb: 5 }} />

      {/* Sección 4: Funcionalidades */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Funcionalidades de Agrovets
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Con Agrovets podrás:
          </Typography>
          <ul>
            <li>
              Acceder a una lista de veterinarios y agrónomos según tu
              ubicación.
            </li>
            <li>Chatear y hacer llamadas o videollamadas en tiempo real.</li>
            <li>Ver publicaciones y anuncios de profesionales del sector.</li>
            <li>
              Explorar perfiles profesionales de veterinarios y agrónomos.
            </li>
          </ul>
          <Box
            component="img"
            src={ImgFive}
            alt="camion"
            sx={{
              width: "100%",
              height: 200,
              borderRadius: 3,
              objectFit: "cover",
              transition: "transform 0.4s ease",
              "&:hover": {
                transform: "scale(1.1)",
              },
            }}
          />
        </Box>
      </motion.div>

      <Divider sx={{ mb: 5 }} />

      {/* Sección 5: CTA final */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}>
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Mejora la salud de tu ganado y cultivos
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Únete a la revolución agropecuaria de Nicaragua con Agrovets y
            potencia tu producción.
          </Typography>
          <Button variant="contained" color="primary" size="large">
            Comienza ahora
          </Button>
        </Box>
      </motion.div>
    </Box>
  );
};

export default LandingAgrovetsAnim;
