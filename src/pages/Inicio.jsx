import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Box, CardMedia } from "@mui/material";
import { motion } from "framer-motion";

import banner1 from "../assets/image/banner1.webp";
import banner2 from "../assets/image/banner2.webp";

import banner3 from "../assets/image/banner3.webp";
import Movil from "../assets/image/movil.webp";

import NotificationsSection from "./HomePage/NotificationsSection";
import LandingAgrovets from "./HomePage/LandingAgrovets";

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const WelcomePage = () => {
  const banners = [banner1, banner2, banner3];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <Box sx={{ bgcolor: "#f8f9fa" }}>
      {/* Hero / Banner con carrusel */}
      <Box
        sx={{
          position: "relative",
          color: "white",
          padding: "10px",
          backgroundImage: `url(${banners[currentIndex]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          transition: "background-image 1s ease-in-out",
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
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}>
                <Typography variant="h3" fontWeight="bold">
                  Bienvenido a AgroVets
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  La primera comunidad de agrónomos y veterinarios,
                </Typography>
                <Typography variant="h6">
                  para resolver problemas reales de campo.
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}>
                <Container
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
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
                      "&:hover": { bgcolor: "#35722b", color: "#fff" },
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      width: { xs: "100%", md: "auto" },
                    }}>
                    Iniciar Secion
                  </Button>

                  <Button
                    variant="outlined"
                    sx={{
                      borderColor: "#fff",
                      color: "white",
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      width: { xs: "100%", md: "auto" },
                    }}>
                    Registrarme
                  </Button>
                </Container>
              </motion.div>
            </Container>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}>
              <CardMedia
                component="img"
                image={Movil}
                alt="imagen"
                sx={{
                  display: { xs: "none", md: "block" },
                  width: 500,
                }}
              />
            </motion.div>
          </Container>
        </Box>
        <NotificationsSection />
      </Box>

      {/* FEATURES */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}>
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight="bold"
            sx={{ color: "#103E68", mb: 6 }}>
            ¿Por qué unirte a AgroVets?
          </Typography>
        </motion.div>
        <LandingAgrovets />
      </Container>

      {/* CALL TO ACTION */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}>
        <Box
          sx={{
            bgcolor: "#35722b",
            py: 8,
            textAlign: "center",
            color: "#fff",
          }}>
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

export default WelcomePage;
