import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

import banner1 from "../../assets/image/banner1.webp";
import banner2 from "../../assets/image/banner2.webp";
import banner3 from "../../assets/image/banner3.webp";
import LandingAgrovetsAnim from "./HomePage/LandingAgrovets.jsx";

const WelcomePage = () => {
  const banners = [banner1, banner2, banner3];
  const phrases = [
    "La inteligencia artificial llega al campo 🌾",
    "Conectando ciencia y naturaleza 🌿",
    "Tu aliado digital en veterinaria y agricultura 🤖",
  ];

  const titleText = "Bienvenido a AgroVets";
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [displayedPhrase, setDisplayedPhrase] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const navigate = useNavigate();

  // Carrusel de banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Efecto escribir título
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedTitle((prev) => titleText.slice(0, index));
      index++;
      if (index > titleText.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Efecto escribir frases
  useEffect(() => {
    let phrase = phrases[textIndex];
    let i = 0;
    setDisplayedPhrase("");
    const interval = setInterval(() => {
      setDisplayedPhrase(phrase.slice(0, i));
      i++;
      if (i > phrase.length) {
        clearInterval(interval);
        setTimeout(
          () => setTextIndex((prev) => (prev + 1) % phrases.length),
          2500
        );
      }
    }, 70);
    return () => clearInterval(interval);
  }, [textIndex]);


  return (
    <>
      <Box sx={{ color: "#fff", overflow: "hidden" }}>
        <Box
          sx={{
            position: "relative",
            backgroundImage: `url(${banners[currentIndex]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-image 1.5s ease-in-out",
          }}
        >
          {/* Capa oscura + blur */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(120deg, rgba(0,0,0,0.7) 20%, rgba(16,62,104,0.65) 100%)",
              backdropFilter: "blur(10px)",
              zIndex: 1,
            }}
          />

          {/* Burbujas flotantes "liquid glass" */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              zIndex: 1,
            }}
          >
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: "100vh", x: Math.random() * window.innerWidth }}
                animate={{ y: "-10vh", opacity: [0, 0.6, 0] }}
                transition={{
                  duration: 10 + Math.random() * 8,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
                style={{
                  position: "absolute",
                  width: 40 + Math.random() * 40,
                  height: 40 + Math.random() * 40,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), rgba(255,255,255,0.08))",
                  backdropFilter: "blur(12px)",
                }}
              />
            ))}
          </Box>

          {/* Contenido principal */}
          <Container
            maxWidth="md"
            sx={{
              position: "relative",
              zIndex: 3,
              textAlign: "center",
              px: 4,
            }}
          >
            {/* Título con efecto escribir */}
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: "linear-gradient(90deg, #00C6A7, #9EF01A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Fira Code', monospace",
              }}
            >
              {displayedTitle}
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: "10px",
                  bgcolor: "#9EF01A",
                  ml: 0.5,
                  height: "1em",
                  animation: "blink 0.8s infinite",
                  "@keyframes blink": {
                    "0%, 50%": { opacity: 1 },
                    "51%, 100%": { opacity: 0 },
                  },
                }}
              />
            </Typography>

            {/* Descripción con efecto escribir */}
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.9,
                fontWeight: 400,
                lineHeight: 1.6,
                fontFamily: "'Fira Code', monospace",
              }}
            >
              {displayedPhrase}
            </Typography>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/chat")}
                sx={{
                  bgcolor: "#00c6a7",
                  px: 6,
                  py: 1.6,
                  fontWeight: 700,
                  color: "#fff",
                  borderRadius: "30px",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 10px 30px rgba(0, 198, 167, 0.4)",
                }}
              >
                Hablar con AVA 🤖
              </Button>
            </motion.div>
          </Container>

          {/* Burbuja de chat fija abajo a la derecha */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            style={{
              position: "fixed",
              bottom: 30,
              right: 30,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(18px)",
              borderRadius: "25px",
              padding: "14px 20px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
              fontSize: "0.95rem",
              color: "#fff",
              zIndex: 10,
              maxWidth: "260px",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <motion.div
              key={textIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              💬 <strong>AVA:</strong> {phrases[textIndex]}
            </motion.div>
          </motion.div>
        </Box>

        {/* Sección informativa */}
        <LandingAgrovetsAnim />
        <Footer />
      </Box>
    </>
  );
};

export default WelcomePage;
