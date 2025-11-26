import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Button,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  FilterList,
  Agriculture,
  LocalHospital,
  Pets,
  TrendingUp,
  NewReleases,
  Whatshot,
} from "@mui/icons-material";
import ModernPostCard from "../molecules/Foro/ModernPostCard";
import { usePosts, useReact, useDeletePost } from "../../hooks/Foro/useForoApi";
import { getProfile } from "../../services/endpoints/auth";
import PostComposer from "../molecules/Foro/PostComposer";
import { useNavigate } from "react-router-dom";
import chatService from "../../services/endpoints/chat";

/**
 * ForoPage: Página principal del foro con diseño moderno
 * Integrada con el backend existente
 */
export default function ForoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [sortBy, setSortBy] = useState("recientes");
  const [currentUser, setCurrentUser] = useState(null);
  const [createdPosts, setCreatedPosts] = useState([]);
  const [openComposer, setOpenComposer] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();

  // Posts de ejemplo para rellenar la vista
  const examplePosts = [
    {
      id: 1001,
      title: "Consulta sobre alimentación de ganado bovino en época seca",
      content: "Hola comunidad, tengo una pregunta importante sobre la alimentación adecuada para ganado bovino durante la época de sequía. He notado que mis animales están perdiendo peso y quiero saber qué estrategias de alimentación están usando otros ganaderos. ¿Alguien tiene experiencia con suplementos o forrajes alternativos?",
      author: {
        id: 101,
        name: "Juan Pérez",
        profile_picture: null,
        role: "ganadero",
      },
      category: "ganadero",
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes_count: 24,
      comments_count: 8,
      views_count: 156,
      tags: ["ganado", "alimentación", "bovino", "sequía"],
      media: null,
    },
    {
      id: 1002,
      title: "Vacunación preventiva en cerdos: Resultados exitosos",
      content: "Comparto mi experiencia con el programa de vacunación preventiva que implementé en mi granja porcina hace 6 meses. Los resultados han sido excelentes: reducción del 80% en enfermedades respiratorias y mejor tasa de crecimiento. Estoy dispuesto a compartir el protocolo completo con quien lo necesite.",
      author: {
        id: 102,
        name: "Dra. María González",
        profile_picture: null,
        role: "veterinario",
      },
      category: "veterinario",
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      likes_count: 45,
      comments_count: 15,
      views_count: 289,
      tags: ["cerdos", "vacunación", "prevención", "salud"],
      media: null,
    },
    {
      id: 1003,
      title: "Nuevas técnicas de inseminación artificial en ganado",
      content: "¿Alguien ha probado las nuevas técnicas de inseminación artificial que están usando en Europa? Me gustaría conocer experiencias de otros ganaderos. Específicamente sobre el uso de semen sexado y las tasas de éxito que han obtenido.",
      author: {
        id: 103,
        name: "Carlos Ramírez",
        profile_picture: null,
        role: "ganadero",
      },
      category: "ganadero",
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      likes_count: 32,
      comments_count: 12,
      views_count: 198,
      tags: ["inseminación", "técnicas", "ganadería", "reproducción"],
      media: null,
    },
    {
      id: 1004,
      title: "Manejo de parásitos en ovinos: Guía práctica",
      content: "Como especialista en salud ovina, quiero compartir una guía práctica sobre el manejo de parásitos. Incluye identificación, tratamiento y prevención. Los parásitos internos son una de las principales causas de pérdidas económicas en la producción ovina.",
      author: {
        id: 104,
        name: "Dr. Roberto Silva",
        profile_picture: null,
        role: "especialista",
      },
      category: "especialista",
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      likes_count: 67,
      comments_count: 22,
      views_count: 412,
      tags: ["ovinos", "parásitos", "salud", "prevención"],
      media: null,
    },
    {
      id: 1005,
      title: "Sistema de riego para pastos: ¿Qué recomiendan?",
      content: "Estoy pensando en instalar un sistema de riego para mis pastos. Tengo 50 hectáreas y quiero saber qué sistema es más eficiente. ¿Riego por aspersión o por goteo? ¿Alguien tiene experiencia con sistemas automatizados?",
      author: {
        id: 105,
        name: "Ana Martínez",
        profile_picture: null,
        role: "ganadero",
      },
      category: "ganadero",
      created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      likes_count: 19,
      comments_count: 7,
      views_count: 134,
      tags: ["riego", "pastos", "infraestructura"],
      media: null,
    },
    {
      id: 1006,
      title: "Emergencia veterinaria: Intoxicación en bovinos",
      content: "URGENTE: Tengo varios bovinos que presentan síntomas de intoxicación después de consumir pasto en un área nueva. Síntomas: salivación excesiva, temblores, dificultad para respirar. ¿Qué debo hacer inmediatamente mientras espero al veterinario?",
      author: {
        id: 106,
        name: "Luis Fernández",
        profile_picture: null,
        role: "ganadero",
      },
      category: "ganadero",
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      likes_count: 8,
      comments_count: 15,
      views_count: 89,
      tags: ["emergencia", "intoxicación", "bovinos", "urgencia"],
      media: null,
    },
    {
      id: 1007,
      title: "Bienestar animal en producción intensiva",
      content: "Como veterinario especializado en bienestar animal, quiero abrir un debate sobre las mejores prácticas en producción intensiva. ¿Cómo podemos balancear la productividad con el bienestar animal? Comparto algunas estrategias que he implementado con éxito.",
      author: {
        id: 107,
        name: "Dra. Laura Torres",
        profile_picture: null,
        role: "veterinario",
      },
      category: "veterinario",
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      likes_count: 56,
      comments_count: 18,
      views_count: 321,
      tags: ["bienestar", "producción", "ética"],
      media: null,
    },
    {
      id: 1008,
      title: "Cría de cabras lecheras: Experiencias y consejos",
      content: "Estoy iniciando en la cría de cabras lecheras y me gustaría conocer las experiencias de otros productores. ¿Qué razas recomiendan para clima templado? ¿Cuáles son los principales desafíos que enfrentaron al inicio?",
      author: {
        id: 108,
        name: "Miguel Ángel",
        profile_picture: null,
        role: "ganadero",
      },
      category: "ganadero",
      created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      likes_count: 28,
      comments_count: 11,
      views_count: 167,
      tags: ["cabras", "lecheras", "cría"],
      media: null,
    },
  ];

  // Obtener usuario actual
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
          const user = await getProfile(token.replace(/^Bearer\s*/i, ""));
          setCurrentUser({
            id: user.id || user.user_id,
            name: user.full_name || user.username || "Usuario",
            profile_picture: user.profile_picture,
            role: user.role,
          });
        }
      } catch (error) {
        console.error("Error cargando usuario:", error);
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  // Obtener posts del backend (sin mostrar error si falla, usamos posts de ejemplo)
  const { data: postsData, isLoading: loadingPosts } = usePosts();
  const reactor = useReact();
  const deleter = useDeletePost();

  // Normalizar posts - combinar posts del backend con posts de ejemplo
  const backendPosts = Array.isArray(postsData) ? postsData : postsData?.results || [];
  
  // Filtrar posts muy pequeños o incompletos del backend
  const validBackendPosts = backendPosts.filter(post => {
    const hasTitle = post.title && post.title.trim().length > 5;
    const hasContent = post.content && post.content.trim().length > 20;
    const hasAuthor = post.author && (post.author.name || post.author.full_name || post.author.username);
    return hasTitle && hasContent && hasAuthor;
  });
  
  // Priorizar posts de ejemplo primero (más completos), luego creados, luego backend válidos
  const allPosts = [...examplePosts, ...createdPosts, ...validBackendPosts];

  // Determinar categoría del post basado en el autor o comunidad
  const getPostCategory = (post) => {
    if (post.community?.name) {
      const commName = post.community.name.toLowerCase();
      if (commName.includes("ganadero") || commName.includes("ganado")) return "ganadero";
      if (commName.includes("veterinario") || commName.includes("vet")) return "veterinario";
      if (commName.includes("especialista")) return "especialista";
    }
    if (post.author?.role) {
      const role = post.author.role.toLowerCase();
      if (role.includes("specialist") || role.includes("especialista")) return "especialista";
      if (role.includes("business") || role.includes("negocio")) return "ganadero";
      if (role.includes("veterinario") || role.includes("vet")) return "veterinario";
    }
    return post.category || "general";
  };

  // Normalizar post para ModernPostCard
  const normalizePost = (post) => {
    return {
      id: post.id,
      title: post.title || "Sin título",
      content: post.content || "",
      author: {
        id: post.author?.id || post.author?.user_id,
        name: post.author?.name || post.author?.full_name || post.author?.username || "Usuario Anónimo",
        profile_picture: post.author?.profile_picture || post.author?.avatar,
        role: post.author?.role,
      },
      category: getPostCategory(post),
      created_at: post.created_at || post.created || post.timestamp,
      likes_count: post.reactions_count || post.likes_count || 0,
      comments_count: post.comments_count || 0,
      views_count: post.views_count || 0,
      tags: post.tags || [],
      media: post.media,
    };
  };

  const categories = [
    { id: "todos", label: "Todos", icon: <FilterList />, color: "#757575" },
    { id: "ganadero", label: "Ganaderos", icon: <Agriculture />, color: "#2E7D32" },
    { id: "veterinario", label: "Veterinarios", icon: <LocalHospital />, color: "#1976D2" },
    { id: "especialista", label: "Especialistas", icon: <Pets />, color: "#7B1FA2" },
  ];

  const sortOptions = [
    { id: "recientes", label: "Más recientes", icon: <NewReleases /> },
    { id: "populares", label: "Más populares", icon: <TrendingUp /> },
    { id: "tendencias", label: "Tendencias", icon: <Whatshot /> },
  ];

  const filteredPosts = allPosts.filter((post) => {
    const normalized = normalizePost(post);
    const matchesCategory =
      selectedCategory === "todos" || normalized.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      normalized.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      normalized.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const normA = normalizePost(a);
    const normB = normalizePost(b);
    
    // Calcular score de calidad del post (contenido más completo = mejor)
    const getQualityScore = (post) => {
      const contentLength = (post.content || '').length;
      const hasMedia = post.media ? 10 : 0;
      const hasTags = (post.tags || []).length * 2;
      const engagement = (post.likes_count || 0) + (post.comments_count || 0) * 2;
      return contentLength + hasMedia + hasTags + engagement;
    };
    
    const qualityA = getQualityScore(normA);
    const qualityB = getQualityScore(normB);
    
    if (sortBy === "recientes") {
      // Primero por calidad, luego por fecha
      if (Math.abs(qualityB - qualityA) > 50) {
        return qualityB - qualityA;
      }
      return (
        new Date(normB.created_at || 0).getTime() -
        new Date(normA.created_at || 0).getTime()
      );
    } else if (sortBy === "populares") {
      // Primero por likes, luego por calidad
      const likesDiff = normB.likes_count - normA.likes_count;
      if (Math.abs(likesDiff) > 5) {
        return likesDiff;
      }
      return qualityB - qualityA;
    } else {
      // Tendencias: engagement total + calidad
      const engagementA = normA.likes_count + normA.comments_count * 2 + qualityA / 10;
      const engagementB = normB.likes_count + normB.comments_count * 2 + qualityB / 10;
      return engagementB - engagementA;
    }
  });

  const handleLike = async (postId) => {
    try {
      await reactor.mutateAsync({
        type: "heart",
        content_type: "post",
        object_id: postId,
      });
    } catch (error) {
      console.error("Error dando like:", error);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await deleter.mutateAsync(postId);
      setCreatedPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("Error eliminando post:", error);
    }
  };

  const handlePostCreated = (newPost) => {
    if (newPost && newPost.id) {
      setCreatedPosts((prev) => [newPost, ...prev]);
      setOpenComposer(false);
    }
  };

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: window.location.href + `/post/${post.id}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.href + `/post/${post.id}`);
      alert("Enlace copiado al portapapeles");
    }
  };

  // Función para abrir chat con el autor del post
  const handleConsult = async (post) => {
    try {
      if (!currentUser || !post.author?.id) {
        alert("Debes iniciar sesión para consultar con este usuario");
        return;
      }

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        alert("Debes iniciar sesión para consultar");
        return;
      }

      const authorId = parseInt(post.author.id);
      const currentUserId = parseInt(currentUser.id);

      if (authorId === currentUserId) {
        alert("No puedes consultarte a ti mismo");
        return;
      }

      // Crear o obtener sala de chat
      const room = await chatService.getOrCreatePrivateRoom(
        currentUserId,
        authorId,
        token.replace(/^Bearer\s*/i, "")
      );

      if (room && room.id) {
        // Navegar al dashboard con el chat abierto
        navigate(`/dashboard?tab=chat&roomId=${room.id}`);
      }
    } catch (error) {
      console.error("Error abriendo chat:", error);
      alert("Error al abrir el chat. Por favor, intenta de nuevo.");
    }
  };

  if (loadingUser) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", py: 4, px: { xs: 1, sm: 2 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Contenido principal */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Barra de búsqueda y filtros */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Buscar en el foro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#f8f9fa",
                      "&:hover": {
                        bgcolor: "#f0f1f2",
                      },
                      "&.Mui-focused": {
                        bgcolor: "#ffffff",
                      },
                    },
                  }}
                />

                {/* Filtros de ordenamiento */}
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flexWrap: "wrap", gap: 1 }}
                >
                  {sortOptions.map((option) => (
                    <Chip
                      key={option.id}
                      icon={option.icon}
                      label={option.label}
                      onClick={() => setSortBy(option.id)}
                      sx={{
                        cursor: "pointer",
                        bgcolor:
                          sortBy === option.id ? "primary.main" : "transparent",
                        color:
                          sortBy === option.id ? "white" : "text.secondary",
                        border: `1px solid ${
                          sortBy === option.id
                            ? "primary.main"
                            : "rgba(0,0,0,0.12)"
                        }`,
                        fontWeight: sortBy === option.id ? 600 : 500,
                        "&:hover": {
                          bgcolor:
                            sortBy === option.id
                              ? "primary.dark"
                              : "rgba(0,0,0,0.04)",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    />
                  ))}
                </Stack>

                {/* Botón para crear publicación */}
                <Box sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setOpenComposer(true)}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      py: 1.2,
                      fontWeight: 600,
                      boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                      "&:hover": {
                        boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Crear nueva publicación
                  </Button>
                </Box>
              </Paper>

              {/* Lista de posts */}
              {sortedPosts.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: 3,
                    bgcolor: "#ffffff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    border: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ color: "text.secondary", mb: 1 }}
                  >
                    No se encontraron publicaciones
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Intenta cambiar los filtros o crear una nueva publicación
                  </Typography>
                </Paper>
              ) : (
                sortedPosts.map((post) => {
                  const normalizedPost = normalizePost(post);
                  return (
                    <ModernPostCard
                      key={post.id}
                      post={normalizedPost}
                      currentUser={currentUser}
                      onLike={handleLike}
                      onComment={(id) => {
                        window.location.href = `/foro/post/${id}`;
                      }}
                      onShare={handleShare}
                      onBookmark={(id) => {
                        console.log("Bookmark post:", id);
                      }}
                      onDelete={handleDelete}
                      onConsult={handleConsult}
                    />
                  );
                })
              )}
            </Stack>
          </Grid>

          {/* Sidebar derecho - Categorías, Estadísticas y comunidades */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Categorías */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  position: "sticky",
                  top: 20,
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 700, fontSize: "1.1rem", color: "#1a1a1a" }}
                >
                  Categorías
                </Typography>
                <Stack spacing={1}>
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      fullWidth
                      startIcon={cat.icon}
                      onClick={() => setSelectedCategory(cat.id)}
                      sx={{
                        justifyContent: "flex-start",
                        textTransform: "none",
                        color:
                          selectedCategory === cat.id ? cat.color : "text.secondary",
                        bgcolor:
                          selectedCategory === cat.id
                            ? `${cat.color}15`
                            : "transparent",
                        fontWeight: selectedCategory === cat.id ? 700 : 500,
                        borderRadius: 2,
                        py: 1.2,
                        "&:hover": {
                          bgcolor: `${cat.color}10`,
                          transform: "translateX(4px)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      {cat.label}
                    </Button>
                  ))}
                </Stack>
              </Paper>

              {/* Estadísticas */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 700, fontSize: "1.1rem", color: "#1a1a1a" }}
                >
                  Estadísticas
                </Typography>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Publicaciones
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {allPosts.length}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Comentarios
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {allPosts.reduce((sum, p) => sum + (p.comments_count || 0), 0)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Comunidades destacadas */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 700, fontSize: "1.1rem", color: "#1a1a1a" }}
                >
                  Comunidades
                </Typography>
                <Stack spacing={1.5}>
                  {categories.slice(1).map((cat) => (
                    <Card
                      key={cat.id}
                      sx={{
                        p: 1.5,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        bgcolor: "transparent",
                        boxShadow: "none",
                        border: "1px solid transparent",
                        "&:hover": {
                          transform: "translateX(4px)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          borderColor: `${cat.color}30`,
                          bgcolor: `${cat.color}08`,
                        },
                      }}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: cat.color,
                            width: 40,
                            height: 40,
                          }}
                        >
                          {cat.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {cat.label}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            {allPosts.filter(
                              (p) => normalizePost(p).category === cat.id
                            ).length}{" "}
                            publicaciones
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Dialog para crear publicación */}
      {openComposer && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
          }}
          onClick={() => setOpenComposer(false)}
        >
          <Paper
            sx={{
              p: 3,
              maxWidth: 600,
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
              borderRadius: 3,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <PostComposer onCreated={handlePostCreated} />
          </Paper>
        </Box>
      )}
    </Box>
  );
}
