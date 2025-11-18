import React, { useMemo, useState } from "react";
import Navbar from "./navigation/nav.jsx";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ShareIcon from "@mui/icons-material/Share";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SearchIcon from "@mui/icons-material/Search";

const fakeSpecialists = [
  { id: 1, name: "Dra. Ana López", role: "Veterinaria", online: true },
  { id: 2, name: "Ing. Carlos Rivas", role: "Agroindustrial", online: false },
  { id: 3, name: "Dr. Julio Méndez", role: "Zootecnista", online: true },
  { id: 4, name: "MSc. María Téllez", role: "Suelo y cultivos", online: true },
  { id: 5, name: "Lic. Pedro Ruiz", role: "Nutrición animal", online: false },
];

const fakePosts = [
  {
    id: 1,
    author: "Dra. Ana López",
    title: "Parásitos comunes en bovinos: prevención y manejo",
    excerpt:
      "Buenas prácticas, calendario de desparasitación y señales de alerta en el hato...",
    tags: ["Bovinos", "Salud"],
    comments: 42,
    votes: 215,
  },
  {
    id: 2,
    author: "Ing. Carlos Rivas",
    title: "Riego eficiente en sequía: goteo y sensores de humedad",
    excerpt:
      "Compartimos kit básico, costos aproximados y recomendaciones para pequeñas parcelas...",
    tags: ["Riego", "Sequía"],
    comments: 18,
    votes: 129,
  },
  {
    id: 3,
    author: "Comunidad",
    title: "¿Qué vacuna recomiendan para brote de Newcastle?",
    excerpt:
      "Veo síntomas en aves de traspatio en la zona. Consejos y experiencias.",
    tags: ["Avicultura"],
    comments: 61,
    votes: 301,
  },
  {
    id: 4,
    author: "CHEYOS",
    title: "¿Porque Cheyo es retrasado con las mujeres?",
    excerpt:
      "Cheyos es una persona que le gustan los hombres por eso no le gustan las mujeres",
    tags: ["Avicultura"],
    comments: 61,
    votes: 301,
  },
];

const fakeAds = [
  { id: 1, name: "VetPlus Clínicas", cta: "Agendar", desc: "Atención 24/7" },
  {
    id: 2,
    name: "AgroInsumos La Finca",
    cta: "Visitar",
    desc: "Fertilizantes y semillas",
  },
  {
    id: 3,
    name: "LabTec Análisis",
    cta: "Contactar",
    desc: "Análisis de suelos",
  },
];

export default function ForoPage() {
  const [tab, setTab] = useState("populares");
  const [query, setQuery] = useState("");

  const filteredPosts = useMemo(() => {
    if (!query.trim()) return fakePosts;
    const q = query.toLowerCase();
    return fakePosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: "#f7f9fb" }}>
        <Container maxWidth="lg" sx={{ pt: { xs: 12, md: 14 }, pb: 6 }}>
          <Grid container spacing={2}>
            {/* Columna izquierda: especialistas */}
            <Grid item xs={12} md={3} order={{ xs: 3, md: 1 }}>
              <Box sx={{ position: { md: "sticky" }, top: { md: 96 } }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "#fff",
                    border: "1px solid #e6edf3",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: "#103E68", mb: 1 }}
                  >
                    Especialistas
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#5b6b7c", mb: 1.5 }}
                  >
                    Conecta con profesionales de la comunidad
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                  <Stack spacing={1.25}>
                    {fakeSpecialists.map((s) => (
                      <Stack
                        key={s.id}
                        direction="row"
                        spacing={1.2}
                        alignItems="center"
                      >
                        <Avatar
                          sx={{ width: 36, height: 36, bgcolor: "#103E68" }}
                        >
                          {s.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            noWrap
                            sx={{ fontWeight: 600, fontSize: 14 }}
                          >
                            {s.name}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: "#66788a" }}
                            >
                              {s.role}
                            </Typography>
                            <Chip
                              size="small"
                              label={s.online ? "En línea" : "Ocupado"}
                              color={s.online ? "success" : "default"}
                              variant={s.online ? "filled" : "outlined"}
                            />
                          </Stack>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                          Ver
                        </Button>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Box>
            </Grid>

            {/* Columna central: foros/noticias */}
            <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
              {/* Barra superior: búsqueda + tabs */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.2,
                  mb: 2,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  border: "1px solid #e6edf3",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Buscar temas, etiquetas o autores"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                  <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                      minHeight: 36,
                      "& .MuiTab-root": {
                        minHeight: 36,
                        textTransform: "none",
                      },
                    }}
                  >
                    <Tab value="populares" label="Populares" />
                    <Tab value="recientes" label="Recientes" />
                    <Tab value="sin_resolver" label="Sin resolver" />
                  </Tabs>
                </Stack>
              </Paper>

              <Stack spacing={2}>
                {filteredPosts.map((p) => (
                  <Card
                    key={p.id}
                    variant="outlined"
                    sx={{ borderRadius: 3, borderColor: "#e6edf3" }}
                  >
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: "#103E68" }}>
                          {(p.author || "?").split(" ")[0][0]}
                        </Avatar>
                      }
                      action={
                        <IconButton>
                          <MoreHorizIcon />
                        </IconButton>
                      }
                      title={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: "#103E68" }}
                          >
                            {p.author}
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            {p.tags.map((t) => (
                              <Chip
                                key={t}
                                size="small"
                                label={t}
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        </Stack>
                      }
                      subheader={
                        <Typography variant="caption" sx={{ color: "#6b7c8f" }}>
                          Comunidad • hace 3 h
                        </Typography>
                      }
                    />
                    <CardContent sx={{ pt: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 800, mb: 0.5 }}
                      >
                        {p.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#4a5a6a" }}>
                        {p.excerpt}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ pt: 0.5, pb: 1.5, px: 2, gap: 1 }}>
                      <Chip
                        icon={<ThumbUpOffAltIcon />}
                        label={p.votes}
                        size="small"
                        variant="outlined"
                      />
                      <IconButton size="small" color="default">
                        <ThumbDownOffAltIcon />
                      </IconButton>
                      <Button
                        size="small"
                        startIcon={<ChatBubbleOutlineIcon />}
                      >
                        {" "}
                        {p.comments} comentarios
                      </Button>
                      <IconButton size="small">
                        <ShareIcon />
                      </IconButton>
                      <IconButton size="small">
                        <BookmarkBorderIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))}

                {/* Placeholders para carga */}
                {filteredPosts.length === 0 && (
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 3, borderColor: "#e6edf3" }}
                  >
                    <Stack spacing={1}>
                      <Skeleton variant="text" width={180} />
                      <Skeleton variant="rounded" height={72} />
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </Grid>

            {/* Columna derecha: ads/negocios */}
            <Grid item xs={12} md={3} order={{ xs: 2, md: 3 }}>
              <Box sx={{ position: { md: "sticky" }, top: { md: 96 } }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "#fff",
                    border: "1px solid #e6edf3",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: "#103E68", mb: 1 }}
                  >
                    Negocios y anuncios
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                  <Stack spacing={1.25}>
                    {fakeAds.map((ad) => (
                      <Paper
                        key={ad.id}
                        variant="outlined"
                        sx={{ p: 1.5, borderRadius: 2, borderColor: "#e6edf3" }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.2}
                          alignItems="center"
                        >
                          <Avatar sx={{ bgcolor: "#00c6a7" }}>
                            {ad.name[0]}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              noWrap
                              sx={{ fontWeight: 700, fontSize: 14 }}
                            >
                              {ad.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#66788a" }}
                            >
                              {ad.desc}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="contained"
                            sx={{
                              textTransform: "none",
                              borderRadius: 2,
                              bgcolor: "#103E68",
                            }}
                          >
                            {ad.cta}
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
