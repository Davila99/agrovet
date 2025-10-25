import React from "react";
import { Box, Typography, Divider, Button } from "@mui/material";
import { motion } from "framer-motion";
import ImgOne from "../../../assets/image/img1.webp";
import ImgThree from "../../../assets/image/img3.webp";
import ImgFour from "../../../assets/image/img4.webp";

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const LandingAgrovetsAnim = () => {
  return (
    <Box
      sx={{
        maxWidth: "1200px",
        mx: "auto",
        px: { xs: 3, md: 2 },
        color: "#000",
      }}
    >
      {/* Hero */}
      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column-reverse", md: "row" },
            alignItems: "center",
            gap: 4,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ mb: 3, lineHeight: 1.2, color: "#103E68" }}
            >
              Descubre el futuro agropecuario de Nicaragua con{" "}
              <Box component="span" sx={{ color: "#9EF01A" }}>
                Agrovets
              </Box>
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
              Nicaragua tiene un gran potencial en agricultura y ganadería, pero
              se enfrenta a desafíos de salud e información que limitan su
              crecimiento.
            </Typography>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#103E68",
                color: "#fff",
                fontWeight: "bold",
                px: 5,
                py: 1.8,
                borderRadius: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "#35722b",
                  transform: "scale(1.05)",
                },
              }}
            >
              Únete ahora
            </Button>
          </Box>
          <Box
            component="img"
            src={ImgOne}
            alt="Camión agrícola"
            sx={{
              width: { xs: "100%", md: 400 },
              borderRadius: 3,
              objectFit: "cover",
              boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
              transition: "transform 0.4s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        </Box>
      </motion.div>

      <Divider sx={{ mb: 8 }} />

      {/* Estado del sector */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ mb: 2, color: "#103E68" }}
          >
            Situación del sector agropecuario
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
            Nicaragua cuenta con un potencial significativo en agricultura y
            ganadería, pero enfrenta retos de productividad y acceso a servicios
            técnicos en tiempo real. A continuación, datos relevantes que
            ilustran el panorama reciente:
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 3,
            }}
          >
            <Box
              sx={{
                flex: 1,
                bgcolor: "#F6FBF2",
                borderRadius: 2,
                p: 2,
                boxShadow: "0 6px 16px rgba(16,62,104,0.06)",
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ color: "#103E68" }}
              >
                2,014.6M $
              </Typography>
              <Typography variant="body2" sx={{ color: "#445660" }}>
                Valor exportaciones (1er trim. 2023)
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                bgcolor: "#FFF9EF",
                borderRadius: 2,
                p: 2,
                boxShadow: "0 6px 16px rgba(53,114,43,0.06)",
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ color: "#35722b" }}
              >
                -4.5%
              </Typography>
              <Typography variant="body2" sx={{ color: "#445660" }}>
                Variación anual del sector
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                bgcolor: "#F0F9FF",
                borderRadius: 2,
                p: 2,
                boxShadow: "0 6px 16px rgba(16,62,104,0.04)",
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ color: "#103E68" }}
              >
                2.4%
              </Typography>
              <Typography variant="body2" sx={{ color: "#445660" }}>
                Participación agropecuaria en exportaciones
              </Typography>
            </Box>
          </Box>

          <Box
            component="img"
            src={ImgThree}
            alt="Campos agrícolas de Nicaragua"
            sx={{
              width: "100%",
              height: { xs: 200, md: 260 },
              borderRadius: 3,
              objectFit: "cover",
              boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
              transition: "transform 0.4s ease",
              "&:hover": { transform: "scale(1.03)" },
            }}
          />
        </Box>
      </motion.div>

      <Divider sx={{ mb: 8 }} />

      {/* Información sobre AVA */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ mb: 2, color: "#103E68" }}
          >
            AVA (Agro Virtual Assistant)
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
            AVA es una herramienta diseñada para reducir la brecha de acceso a
            asesoría técnica en campo. Su objetivo es facilitar decisiones
            rápidas y basadas en conocimiento, mejorando salud animal y
            rendimiento de cultivos.
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Conecta a productores con veterinarios y agrónomos en tiempo
              real.
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Ofrece guías prácticas, diagnóstico inicial y seguimiento
              integrado.
            </Typography>
            <Typography variant="body2">
              • Permite priorizar intervenciones, reducir pérdidas y optimizar
              recursos.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Button
              variant="contained"
              sx={{
                bgcolor: "#103E68",
                color: "#fff",
                fontWeight: "bold",
                px: 4,
                py: 1.6,
                borderRadius: 3,
                "&:hover": { bgcolor: "#0b2a45" },
              }}
              aria-label="Conoce más sobre AVA"
            >
              Conoce AVA
            </Button>

            <Button
              variant="outlined"
              sx={{
                borderColor: "#103E68",
                color: "#103E68",
                fontWeight: 600,
                px: 4,
                py: 1.6,
                borderRadius: 3,
                "&:hover": { backgroundColor: "#F5F8FB" },
              }}
              aria-label="Únete a Agrovets"
            >
              Únete ahora
            </Button>
          </Box>
        </Box>
      </motion.div>

      <Divider sx={{ mb: 8 }} />

      {/* Desafíos y solución */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: 5,
            bgcolor: "#35722b",
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            color: "#fff",
            mb: 8,
          }}
        >
          <Box
            component="img"
            src={ImgFour}
            alt="Ganadería"
            sx={{
              width: { xs: "100%", md: "40%" },
              height: { xs: 250, md: 320 },
              borderRadius: 3,
              objectFit: "cover",
              boxShadow: "0 12px 24px rgba(0,0,0,0.3)",
            }}
          />
          <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
              Salud de cultivos y ganado
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
              La salud de cultivos y ganado, tanto bovino como porcino, es
              esencial. Los productores enfrentan dificultades para acceder en
              tiempo real a veterinarios y agrónomos.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
              Agrovets es la solución, una plataforma móvil que conecta
              agricultores y ganaderos con expertos, optimizando la producción y
              cuidado del sector agropecuario.
            </Typography>
          </Box>
        </Box>
      </motion.div>

      <Divider sx={{ mb: 8 }} />

      {/* ChatBot moved to its own route (/chat) and removed from landing */}
    </Box>
  );
};

export default LandingAgrovetsAnim;
