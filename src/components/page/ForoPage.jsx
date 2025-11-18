import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Stack,
  Chip,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Skeleton,
  TextField,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import Navbar from "./navigation/nav.jsx";
import { fetchUsers } from "../../data/users";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import MicNoneIcon from "@mui/icons-material/MicNone";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function ForoTuani() {
  // Datos dinámicos desde backend
  const [especialistas, setEspecialistas] = useState([]);
  const [negocios, setNegocios] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [postText, setPostText] = useState("");

  const posts = [
    {
      id: 1,
      author: "Comunidad",
      title: "Parásitos comunes en bovinos: prevención y manejo",
      text: "Guía completa, calendario de desparasitación y señales de alerta...",
      tags: ["Bovinos", "Salud"],
      likes: 40,
      comments: 12,
    },
    {
      id: 2,
      author: "Ing. Carlos Rivas",
      title: "Riego eficiente en tiempo de sequía",
      text: "Costos, sensores de humedad y recomendaciones para pequeñas parcelas...",
      tags: ["Riego"],
      likes: 18,
      comments: 4,
    },
    {
      id: 3,
      author: "Comunidad",
      title: "¿Qué vacuna recomiendan para brote de Newcastle?",
      text: "En mi zona hay síntomas. ¿Qué recomiendan ustedes?",
      tags: ["Avicultura"],
      likes: 91,
      comments: 32,
    },
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingUsers(true);
        const users = await fetchUsers();
        if (!mounted) return;
        const list = Array.isArray(users) ? users : [];
        const specs = list.filter(
          (u) => String(u.role || "").toLowerCase() === "specialist"
        );
        const buss = list.filter((u) => {
          const r = String(u.role || "").toLowerCase();
          return r === "businessman" || r === "business";
        });
        setEspecialistas(
          specs.map((u, i) => ({
            id: u.id,
            name: u.full_name || u.user_display || "Especialista",
            role: "Especialista",
            profile_picture: u.profile_picture,
            online: [true, false, true, true, false][i % 5],
          }))
        );
        setNegocios(
          buss.map((b) => ({
            id: b.id,
            nombre:
              b.businessman_profile?.business_name ||
              b.full_name ||
              b.user_display ||
              "Negocio",
            detalle: b.businessman_profile?.descriptions || b.bio || "",
            profile_picture: b.profile_picture,
          }))
        );
      } catch (e) {
        setEspecialistas([]);
        setNegocios([]);
      } finally {
        if (mounted) setLoadingUsers(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: "#f4f6fc", minHeight: "100vh", pt: 10, pb: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {/* ======= COLUMNA IZQUIERDA – ESPECIALISTAS ======= */}
            <Grid
              item
              xs={12}
              md={3}
              sx={{ display: { xs: "none", md: "block" } }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: "1px solid #e6edf3",
                  bgcolor: "#ffffff",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Especialistas
                </Typography>

                <Stack spacing={1.8}>
                  {loadingUsers && (
                    <>
                      {[...Array(4)].map((_, i) => (
                        <Stack
                          key={i}
                          direction="row"
                          spacing={2}
                          alignItems="center"
                        >
                          <Skeleton variant="circular" width={40} height={40} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width={140} />
                            <Skeleton variant="text" width={100} />
                          </Box>
                          <Skeleton variant="rounded" width={72} height={28} />
                        </Stack>
                      ))}
                    </>
                  )}
                  {!loadingUsers &&
                    especialistas.map((e, i) => (
                      <Stack
                        key={i}
                        direction="row"
                        spacing={2}
                        alignItems="center"
                      >
                        <Avatar src={e.profile_picture || undefined}>
                          {!e.profile_picture && e.name ? e.name[0] : null}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>
                            {e.name}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            {e.role}
                          </Typography>
                        </Box>
                        <Chip
                          label={e.online ? "En línea" : "Ocupado"}
                          color={e.online ? "success" : "default"}
                          size="small"
                        />
                      </Stack>
                    ))}
                </Stack>
              </Paper>
            </Grid>

            {/* ======= CENTRO – FORO NOTICIAS ======= */}
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                {/* Composer de publicación */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    border: "1px solid #e6edf3",
                    bgcolor: "#ffffff",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar sx={{ bgcolor: "#6a4df4" }}>T</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        placeholder="¿Qué quieres publicar en el foro?"
                        fullWidth
                        multiline
                        minRows={2}
                        variant="outlined"
                      />
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                        sx={{ mt: 1.5 }}
                      >
                        <Button
                          size="small"
                          startIcon={<ImageOutlinedIcon />}
                          sx={{ textTransform: "none" }}
                        >
                          Imagen
                        </Button>
                        <Button
                          size="small"
                          startIcon={<MicNoneIcon />}
                          sx={{ textTransform: "none" }}
                        >
                          Audio
                        </Button>
                        <Box sx={{ flex: 1 }} />
                        <Button
                          variant="contained"
                          disabled={!postText.trim()}
                          onClick={() => setPostText("")}
                          sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                          Publicar
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>

                {posts.map((p) => (
                  <Card
                    key={p.id}
                    sx={{
                      borderRadius: 4,
                      border: "1px solid #e8e8ef",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    <CardHeader
                      avatar={<Avatar>{p.author[0]}</Avatar>}
                      action={
                        <IconButton>
                          <MoreHorizIcon />
                        </IconButton>
                      }
                      title={
                        <Typography sx={{ fontWeight: 700 }}>
                          {p.author}
                        </Typography>
                      }
                      subheader="hace 2 horas"
                    />

                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                        {p.title}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {p.text}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        {p.tags.map((t) => (
                          <Chip
                            key={t}
                            label={t}
                            color="primary"
                            size="small"
                          />
                        ))}
                      </Stack>
                    </CardContent>

                    <CardActions>
                      <Chip
                        icon={<ThumbUpOffAltIcon />}
                        label={p.likes}
                        variant="outlined"
                      />
                      <Button
                        startIcon={<ChatBubbleOutlineIcon />}
                        sx={{ textTransform: "none" }}
                      >
                        {p.comments} comentarios
                      </Button>
                      <IconButton>
                        <BookmarkBorderIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))}

                {/* Secciones móviles para Especialistas y Negocios */}
                <Box sx={{ display: { xs: "block", md: "none" } }}>
                  <Accordion sx={{ borderRadius: 3 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 800 }}>
                        Especialistas
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={1.8}>
                        {loadingUsers && (
                          <>
                            {[...Array(4)].map((_, i) => (
                              <Stack
                                key={i}
                                direction="row"
                                spacing={2}
                                alignItems="center"
                              >
                                <Skeleton
                                  variant="circular"
                                  width={40}
                                  height={40}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Skeleton variant="text" width={140} />
                                  <Skeleton variant="text" width={100} />
                                </Box>
                                <Skeleton
                                  variant="rounded"
                                  width={72}
                                  height={28}
                                />
                              </Stack>
                            ))}
                          </>
                        )}
                        {!loadingUsers &&
                          especialistas.map((e, i) => (
                            <Stack
                              key={i}
                              direction="row"
                              spacing={2}
                              alignItems="center"
                            >
                              <Avatar src={e.profile_picture || undefined}>
                                {!e.profile_picture && e.name
                                  ? e.name[0]
                                  : null}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontWeight: 700 }}>
                                  {e.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ opacity: 0.7 }}
                                >
                                  {e.role}
                                </Typography>
                              </Box>
                              <Chip
                                label={e.online ? "En línea" : "Ocupado"}
                                color={e.online ? "success" : "default"}
                                size="small"
                              />
                            </Stack>
                          ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion sx={{ borderRadius: 3, mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 800 }}>Negocios</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        {loadingUsers && (
                          <>
                            {[...Array(3)].map((_, i) => (
                              <Paper
                                key={`mb-biz-skel-${i}`}
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  borderRadius: 3,
                                  border: "1px solid #e6edf3",
                                  bgcolor: "#fafbff",
                                }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={2}
                                  alignItems="center"
                                >
                                  <Skeleton
                                    variant="circular"
                                    width={40}
                                    height={40}
                                  />
                                  <Box sx={{ flex: 1 }}>
                                    <Skeleton variant="text" width={160} />
                                    <Skeleton variant="text" width={120} />
                                  </Box>
                                  <Skeleton
                                    variant="rounded"
                                    width={64}
                                    height={28}
                                  />
                                </Stack>
                              </Paper>
                            ))}
                          </>
                        )}
                        {!loadingUsers &&
                          negocios.map((n, i) => (
                            <Paper
                              key={i}
                              variant="outlined"
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                border: "1px solid #e6edf3",
                                bgcolor: "#fafbff",
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                              >
                                <Avatar
                                  src={n.profile_picture || undefined}
                                  sx={{ bgcolor: "#6a4df4" }}
                                >
                                  {!n.profile_picture && n.nombre
                                    ? n.nombre[0]
                                    : null}
                                </Avatar>
                                <Box>
                                  <Typography sx={{ fontWeight: 700 }}>
                                    {n.nombre}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ opacity: 0.7 }}
                                  >
                                    {n.detalle}
                                  </Typography>
                                </Box>
                                <Button
                                  size="small"
                                  variant="contained"
                                  sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                    bgcolor: "#6a4df4",
                                  }}
                                >
                                  Ver
                                </Button>
                              </Stack>
                            </Paper>
                          ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              </Stack>
            </Grid>

            {/* ======= COLUMNA DERECHA – NEGOCIOS ======= */}
            <Grid
              item
              xs={12}
              md={3}
              sx={{ display: { xs: "none", md: "block" } }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: "1px solid #e6edf3",
                  bgcolor: "#ffffff",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Negocios
                </Typography>

                <Stack spacing={2}>
                  {loadingUsers && (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <Paper
                          key={`biz-skel-${i}`}
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            border: "1px solid #e6edf3",
                            bgcolor: "#fafbff",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Skeleton
                              variant="circular"
                              width={40}
                              height={40}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Skeleton variant="text" width={160} />
                              <Skeleton variant="text" width={120} />
                            </Box>
                            <Skeleton
                              variant="rounded"
                              width={64}
                              height={28}
                            />
                          </Stack>
                        </Paper>
                      ))}
                    </>
                  )}
                  {!loadingUsers &&
                    negocios.map((n, i) => (
                      <Paper
                        key={i}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: "1px solid #e6edf3",
                          bgcolor: "#fafbff",
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            src={n.profile_picture || undefined}
                            sx={{ bgcolor: "#6a4df4" }}
                          >
                            {!n.profile_picture && n.nombre
                              ? n.nombre[0]
                              : null}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>
                              {n.nombre}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                              {n.detalle}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="contained"
                            sx={{
                              textTransform: "none",
                              borderRadius: 2,
                              bgcolor: "#6a4df4",
                            }}
                          >
                            Ver
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
