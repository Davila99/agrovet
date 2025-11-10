import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Divider, Button, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ForumIcon from "@mui/icons-material/Forum";
import ChatIcon from "@mui/icons-material/Chat";
import ImgOne from "../../../assets/image/img1.webp";

// Animaciones base
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring" } },
};

// Funciones de conteo y animaciones
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function useCountUp(end, { start = false, duration = 1.2, decimals = 0 } = {}) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!start) {
      setValue(0);
      return;
    }

    startTimeRef.current = null;
    const from = 0;
    const delta = end - from;

    function tick(ts) {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = easeOutCubic(progress);
      const current = from + delta * eased;
      setValue(Number(current.toFixed(decimals)));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [start, end, duration, decimals]);

  return value;
}

const formatNumber = (num, decimals = 0) =>
  new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);

// Typewriter animado
const TypewriterText = ({
  text,
  speed = 45,
  delay = 0,
  variant = "h4",
  sx,
}) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i));
        i++;
        if (i > text.length) clearInterval(interval);
      }, speed);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  return (
    <Typography
      variant={variant}
      sx={{ ...sx, whiteSpace: "pre-line", display: "inline-block" }}
    >
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
        style={{ display: "inline-block" }}
      >
        |
      </motion.span>
    </Typography>
  );
};

const LandingAgrovetsAnim = () => {
  const [startStats, setStartStats] = useState(false);
  const navigate = useNavigate();

  const valExports = useCountUp(2014.6, {
    start: startStats,
    duration: 1.4,
    decimals: 1,
  });
  const valVariation = useCountUp(-4.5, {
    start: startStats,
    duration: 1.2,
    decimals: 1,
  });
  const valParticipation = useCountUp(2.4, {
    start: startStats,
    duration: 1.2,
    decimals: 1,
  });

  const sections = [
    {
      key: "specialist",
      title: "¿Eres especialista?",
      description:
        "Crea tu perfil profesional y ofrece tus servicios a productores.",
      icon: <PersonSearchIcon sx={{ fontSize: 46, color: "#103E68" }} />,
      action: () => navigate("/profile/create?role=specialist"),
      cta: "Crear perfil",
      color: "#103E68",
    },
    {
      key: "business",
      title: "¿Tienes un negocio?",
      description:
        "Registra tu empresa para llegar a más clientes y gestionar servicios.",
      icon: <BusinessCenterIcon sx={{ fontSize: 46, color: "#35722b" }} />,
      action: () => navigate("/profile/create?role=business"),
      cta: "Registrar negocio",
      color: "#35722b",
    },
    {
      key: "forum",
      title: "Comparte en el foro",
      description: "Publica tus dudas, ideas o experiencias con la comunidad.",
      icon: <ForumIcon sx={{ fontSize: 46, color: "#6b4fdb" }} />,
      action: () => navigate("/forum"),
      cta: "Ir al foro",
      color: "#6b4fdb",
    },
    {
      key: "ava",
      title: "Consulta con AVA",
      description:
        "Habla con nuestro asistente virtual para obtener respuestas rápidas.",
      icon: <ChatIcon sx={{ fontSize: 46, color: "#e07a5f" }} />,
      action: () => navigate("/chat"),
      cta: "Hablar con AVA",
      color: "#e07a5f",
    },
  ];

  return (
    <Box
      sx={{
        mx: "auto",
        px: { xs: 3, md: 6 },
        py: { xs: 6, md: 10 },
        background: "linear-gradient(180deg, #f9fafc 0%, #ffffff 100%)",
      }}
    >
      {/* HERO */}
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
            <TypewriterText
              text="Descubre el futuro agropecuario de Nicaragua con Agrovets"
              variant="h3"
              speed={35}
              sx={{
                fontWeight: "bold",
                mb: 3,
                lineHeight: 1.2,
                background: "linear-gradient(90deg,#103E68 0%,#35722b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            />
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
              Conecta con especialistas, negocios y productores para impulsar el
              desarrollo agropecuario. Agrovets facilita la colaboración y el
              conocimiento compartido.
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
                boxShadow: "0 4px 12px rgba(16,62,104,0.3)",
                "&:hover": {
                  bgcolor: "#35722b",
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => navigate("/chat")}
            >
              Únete ahora
            </Button>
          </Box>

          <Box
            component={motion.img}
            src={ImgOne}
            alt="Imagen agro"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 100 }}
            sx={{
              width: { xs: "100%", md: 420 },
              borderRadius: 3,
              objectFit: "cover",
              boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
            }}
          />
        </Box>
      </motion.div>

      <Divider sx={{ my: 8 }} />

      {/* ESTADÍSTICAS */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        onViewportEnter={() => setStartStats(true)}
      >
        <TypewriterText
          text="Situación del sector agropecuario"
          variant="h4"
          speed={45}
          sx={{ fontWeight: "bold", mb: 2, color: "#103E68" }}
        />
        <Typography variant="body1" sx={{ mb: 3 }}>
          Algunos datos relevantes:
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 3,
          }}
        >
          {[
            {
              value: valExports,
              label: "Valor exportaciones (1er trim. 2023)",
              color: "#103E68",
            },
            {
              value: valVariation,
              label: "Variación anual del sector",
              color: "#35722b",
            },
            {
              value: valParticipation,
              label: "Participación en exportaciones",
              color: "#103E68",
            },
          ].map((item, i) => (
            <Box key={i} sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ color: item.color }}
              >
                {formatNumber(item.value, 1)}
                {i === 0 ? "M $" : "%"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#445660" }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </motion.div>

      <Divider sx={{ my: 8 }} />

      {/* PARTICIPACIÓN (fluido, sin cards) */}
{/* PARTICIPACIÓN — versión narrativa fluida */}
<Box
  sx={{
    mt: 10,
    py: 8,
    px: { xs: 2, md: 6 },
    background: "linear-gradient(180deg,#ffffff 0%,#f7faf8 100%)",
  }}
>
  <Stack spacing={8}>
    {[
      {
        key: "specialist",
        text: "¿Eres especialista? En Agrovets puedes crear tu perfil profesional, conectar con productores y ofrecer tus servicios directamente.",
        icon: <PersonSearchIcon sx={{ fontSize: 56, color: "#103E68" }} />,
        cta: "Crear perfil profesional",
        color: "#103E68",
        action: () => navigate("/profile/create?role=specialist"),
      },
      {
        key: "business",
        text: "¿Tienes un negocio? Regístralo en Agrovets y llega a más clientes agropecuarios que buscan tus productos y servicios.",
        icon: <BusinessCenterIcon sx={{ fontSize: 56, color: "#35722b" }} />,
        cta: "Registrar mi negocio",
        color: "#35722b",
        action: () => navigate("/profile/create?role=business"),
      },
      {
        key: "forum",
        text: "Únete a la comunidad. Publica tus dudas, comparte experiencias o novedades del sector en nuestro foro colaborativo.",
        icon: <ForumIcon sx={{ fontSize: 56, color: "#6b4fdb" }} />,
        cta: "Ir al foro",
        color: "#6b4fdb",
        action: () => navigate("/forum"),
      },
      {
        key: "ava",
        text: "Consulta con AVA, el asistente virtual de Agrovets. Recibe orientación inmediata sobre servicios, perfiles o temas del sector.",
        icon: <ChatIcon sx={{ fontSize: 56, color: "#e07a5f" }} />,
        cta: "Hablar con AVA",
        color: "#e07a5f",
        action: () => navigate("/chat"),
      },
    ].map((section, idx) => (
      <motion.div
        key={section.key}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: idx * 0.15, duration: 0.6, type: "spring" }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          alignItems="center"
          sx={{
            pl: { md: 4 },
            pr: { md: 6 },
            py: 3,
            borderLeft: { md: `5px solid ${section.color}` },
            borderRadius: 2,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "rgba(16,62,104,0.04)",
              transform: "translateY(-3px)",
            },
          }}
        >
          {section.icon}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                color: section.color,
                mb: 1,
              }}
            >
              {section.text.split("?")[0]}?
            </Typography>
            <Typography variant="body1" sx={{ color: "#445660", mb: 2 }}>
              {section.text.split("?")[1]}
            </Typography>
            <Button
              variant="outlined"
              onClick={section.action}
              sx={{
                color: section.color,
                borderColor: section.color,
                fontWeight: 600,
                px: 3,
                "&:hover": {
                  bgcolor: section.color,
                  color: "#fff",
                },
              }}
            >
              {section.cta}
            </Button>
          </Box>
        </Stack>
      </motion.div>
    ))}
  </Stack>
</Box>

    </Box>
  );
};

export default LandingAgrovetsAnim;
