import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const sampleAds = [
  {
    id: 1,
    name: "Clínica Vet SanJosé",
    desc: "Vacunaciones y emergencias 24/7. Promo: 10% en consulta nueva.",
    initials: "VS",
    color: "#FFD166",
  },
  {
    id: 2,
    name: "AgroVet Supplies",
    desc: "Insumos veterinarios y piensos de calidad. Envíos a todo el país.",
    initials: "AV",
    color: "#06D6A0",
  },
  {
    id: 3,
    name: "Hosp. Veterinario Central",
    desc: "Hospitalización y cirugía especializada para animales grandes y pequeños.",
    initials: "HV",
    color: "#118AB2",
  },
  {
    id: 4,
    name: "Campo y Salud",
    desc: "Asesoría en sanidad animal para fincas y productores.",
    initials: "CS",
    color: "#EF476F",
  },
  {
    id: 5,
    name: "PetCare Mobile",
    desc: "Visitas domiciliarias y cuidado preventivo. Agenda rápida.",
    initials: "PM",
    color: "#8ECAE6",
  },
];

const NotificationsSection = () => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));

  // Número de tarjetas visibles según tamaño de pantalla
  const itemsToShow = isMd ? 3 : isSm ? 2 : 1;
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(0, sampleAds.length - itemsToShow);

  const handlePrev = () => setIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setIndex((i) => Math.min(maxIndex, i + 1));

  const cardWidthPercent = useMemo(() => 100 / itemsToShow, [itemsToShow]);
  const viewportRef = React.useRef(null);

  // Al cambiar index, desplazamos el viewport (en px) para mostrar la página correcta
  React.useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const cardWidth = vp.clientWidth / itemsToShow;
    vp.scrollTo({ left: index * cardWidth, behavior: "smooth" });
  }, [index, itemsToShow]);

  // Ajuste al cambiar tamaño
  React.useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onResize = () => {
      const cardWidth = vp.clientWidth / itemsToShow;
      vp.scrollTo({ left: index * cardWidth, behavior: "auto" });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [index, itemsToShow]);

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      {/* Navegación */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={handlePrev} disabled={index === 0} size="small">
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={handleNext}
          disabled={index === maxIndex}
          size="small"
        >
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Contenedor de carrusel */}
      <Box sx={{ overflow: "hidden", position: "relative" }} ref={viewportRef}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            width: "100%",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {sampleAds.map((ad) => (
            <Box
              key={ad.id}
              sx={{
                flex: `0 0 ${100 / itemsToShow}%`,
                boxSizing: "border-box",
                scrollSnapAlign: "start",
              }}
            >
              <Card sx={{ borderRadius: 2, boxShadow: 3, height: "100%" }}>
                <CardContent
                  sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
                >
                  <Avatar
                    sx={{
                      bgcolor: ad.color,
                      width: 56,
                      height: 56,
                      fontWeight: 700,
                    }}
                  >
                    {ad.initials}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {ad.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ad.desc}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Indicadores */}
      <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: 2 }}>
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <Box
            key={i}
            onClick={() => setIndex(i)}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: i === index ? "primary.main" : "grey.300",
              cursor: "pointer",
              transition: "background-color 300ms",
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default NotificationsSection;
