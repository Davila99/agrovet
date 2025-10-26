import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Box, CardMedia } from "@mui/material";
import { motion } from "framer-motion";
import { getProfile } from "../services/endpoints";
import { useNavigate } from "react-router-dom";

import banner1 from "../../assets/image/banner1.webp";
import banner2 from "../../assets/image/banner2.webp";
import banner3 from "../../assets/image/banner3.webp";
import LandingAgrovets from "./HomePage/LandingAgrovets";
import NotificationsSection from "./HomePage/NotificationsSection";

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const WelcomePage = () => {
  const banners = [banner1, banner2, banner3];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avaQuestion, setAvaQuestion] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const raw = localStorage.getItem("token");
        if (!raw) {
          if (mounted) setIsLoggedIn(false);
          return;
        }
        const token = String(raw)
          .replace(/^Token\s*/i, "")
          .replace(/^Bearer\s*/i, "")
          .trim();
        if (!token) {
          if (mounted) setIsLoggedIn(false);
          return;
        }
        try {
          const profile = await getProfile(token);
          if (mounted && profile && profile.id) setIsLoggedIn(true);
          else if (mounted) setIsLoggedIn(false);
        } catch (e) {
          if (mounted) setIsLoggedIn(false);
        }
      } catch (e) {
        if (mounted) setIsLoggedIn(false);
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleExplore = () => {
    navigate("/comunidad/explorar");
  };

  return (
    <Box sx={{ bgcolor: "#f8f9fa" }}>
      <Box
        sx={{
          position: "relative",
          color: "white",
          backgroundImage: `url(${banners[currentIndex]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          transition: "background-image 2s ease-in-out",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0, 25, 94, 0.65) 0%, rgba(0, 0, 0, 0.55) 50%, rgba(0, 0, 0, 0.43) 100%)",
            backdropFilter: "blur(2px)",
            zIndex: 1,
          }}
        />
        <Box sx={{ position: "relative", zIndex: 2, mt: 25 }}>
          <Container
            maxWidth="md"
            sx={{
              mb: 10,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  color: "#fff",
                }}
              >
                Bienvenido a{" "}
                <Box component="span" sx={{ color: "#9EF01A" }}>
                  AgroVets
                </Box>
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.9,
                  mb: 4,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  maxWidth: 600,
                  mx: "auto",
                }}
              >
                La comunidad donde agrónomos y veterinarios se unen para
                resolver problemas reales del campo, compartir conocimiento y
                potenciar su crecimiento profesional.
              </Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Box
                  component="input"
                  value={avaQuestion}
                  onChange={(e) => setAvaQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      console.log("Pregunta a AVA:", avaQuestion);
                      setAvaQuestion("");
                    }
                  }}
                  placeholder="💡 Pregúntale a AVA..."
                  aria-label="Pregúntale a AVA"
                  sx={{
                    width: { xs: "90%", sm: "400px" },
                    px: 3,
                    py: 2,
                    fontSize: 15,
                    borderRadius: 999,
                    outline: "none",
                    border: "2px solid #35722b",
                    background: "rgba(16, 62, 104, 0.1)",
                    color: "#fff",

                    marginBottom: 3,
                    boxShadow:
                      "0 0 6px rgba(158, 240, 26, 0.5), 0 0 12px rgba(158, 240, 26, 0.3)",
                    transition: "all 0.3s ease",
                    "&::placeholder": {
                      color: "#9EF01A",
                      opacity: 0.7,
                      fontWeight: 500,
                    },
                    "&:focus": {
                      px: 5,
                      py: 2.2,
                      borderColor: "#9EF01A",

                      boxShadow:
                        "0 0 10px rgba(158, 240, 26, 0.8), 0 0 20px rgba(158, 240, 26, 0.6)",
                      background: "rgba(16, 62, 104, 0.2)",
                    },
                  }}
                />
              </Box>
            </motion.div>
          </Container>
        </Box>
      </Box>

      <Container
        maxWidth="lg"
        sx={{
          py: 10,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <NotificationsSection />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight="bold"
            sx={{ color: "#103E68", mb: 6 }}
          >
            ¿Por qué unirte a AgroVets?
          </Typography>
        </motion.div>
        <LandingAgrovets />
      </Container>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <Box
          sx={{
            bgcolor: "#35722b",
            py: 8,
            textAlign: "center",
            color: "#fff",
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Mejora la salud de tu ganado y cultivos
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Únete a la revolución agropecuaria de Nicaragua con Agrovets y
            potencia tu producción.
          </Typography>

          {isLoggedIn && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleExplore}
            >
              Explorar
            </Button>
          )}
        </Box>
        <Box sx={{ py: 6 }}>
          <Container
            maxWidth="sm"
            sx={{
              bgcolor: "#fff",
              p: 4,
              borderRadius: 2,
              boxShadow: 3,
              textAlign: "center",
            }}
          >
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ mb: 1, color: "#000" }}
              >
                Reseña de usuario satisfecho
              </Typography>

              <Typography
                variant="body1"
                sx={{ fontStyle: "italic", mb: 2, color: "#000" }}
              >
                "AgroVets me ayudó a identificar y resolver problemas en mi hato
                en tiempo récord. La comunidad y los consejos profesionales
                marcaron una gran diferencia en mi producción. ¡Muy
                recomendable!"
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                — María López, productora
              </Typography>
            </motion.div>
          </Container>
        </Box>
      </motion.div>
    </Box>
  );
};

export default WelcomePage;
