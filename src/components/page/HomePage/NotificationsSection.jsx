import React, { useEffect, useRef } from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";

const sampleAds = [
  {
    id: 1,
    name: "Clínica Vet SanJosé",
    desc: "Vacunaciones y emergencias 24/7. Promo: 10% en consulta nueva.",
  },
  {
    id: 2,
    name: "AgroVet Supplies",
    desc: "Insumos veterinarios y piensos de calidad. Envíos a todo el país.",
  },
  {
    id: 3,
    name: "Hosp. Veterinario Central",
    desc: "Hospitalización y cirugía especializada para animales grandes y pequeños.",
  },
  {
    id: 4,
    name: "Campo y Salud",
    desc: "Asesoría en sanidad animal para fincas y productores.",
  },
  {
    id: 5,
    name: "PetCare Mobile",
    desc: "Visitas domiciliarias y cuidado preventivo. Agenda rápida.",
  },
];

const NotificationsSection = () => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));

  const itemsToShow = isMd ? 3 : isSm ? 2 : 1;

  // duplicar para loop infinito
  const duplicatedAds = [...sampleAds, ...sampleAds];

  const viewportRef = useRef(null);
  const rafRef = useRef(null);
  const lastRef = useRef(null);
  const speed = 0.05; // px per ms, ajustar para velocidad

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    const step = (t) => {
      if (lastRef.current == null) lastRef.current = t;
      const delta = t - lastRef.current;
      lastRef.current = t;
      vp.scrollLeft += speed * delta;
      const half = vp.scrollWidth / 2;
      if (vp.scrollLeft >= half) vp.scrollLeft -= half;
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
    };
  }, [itemsToShow]);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onResize = () => {
      const half = vp.scrollWidth / 2;
      if (vp.scrollLeft >= half) vp.scrollLeft = vp.scrollLeft % half;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [itemsToShow]);

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        width: "100%",
        boxSizing: "border-box",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }}
    >
      <Box
        sx={{
          bgcolor: (t) => (t.palette.mode === "light" ? "#faf8ff" : "#121215"),
          borderRadius: 3,
          px: 2,
          py: 1,
          overflow: "hidden",
          width: "100%",
        }}
        ref={viewportRef}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            minWidth: "max-content",
            boxSizing: "border-box",
            alignItems: "center",
            py: 1,
          }}
        >
          {duplicatedAds.map((ad, idx) => (
            <Box
              key={`${ad.id}-${idx}`}
              sx={{
                flex: `0 0 ${100 / itemsToShow}%`,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: { xs: 72, sm: 96, md: 120 },
                px: 1,
              }}
            >
              <Box sx={{ textAlign: "center", width: "100%" }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                  noWrap
                >
                  {ad.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {ad.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
export default NotificationsSection;
