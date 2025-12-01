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
  Avatar,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import { useParams } from 'react-router-dom';
import {
  Search,
  Add,
  TrendingUp,
  AccessTime,
  Whatshot,
  ArrowForward,
  People,
  Public,
  Agriculture,
  LocalHospital,
  Business,
} from "@mui/icons-material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import PostCard from "../molecules/Foro/PostCard";
import PostComposer from "../molecules/Foro/PostComposer";
import { usePosts, useCommunities } from "../../hooks/Foro/useForoApi";
import { getProfile } from "../../services/endpoints/auth";
import { autoJoinCommunitiesByRole, filterCommunitiesByRole, COMMUNITY_SLUGS } from "../../utils/Foro/autoJoinCommunities";
import CommunityView from '../organisms/Foro/CommunityView';

// Colors and icons for each community type
const communityConfig = {
  [COMMUNITY_SLUGS.GENERAL]: {
    color: '#6366F1',
    icon: <Public />,
  },
  [COMMUNITY_SLUGS.CONSUMERS]: {
    color: '#F59E0B',
    icon: <Agriculture />,
  },
  [COMMUNITY_SLUGS.SPECIALISTS]: {
    color: '#10B981',
    icon: <LocalHospital />,
  },
  [COMMUNITY_SLUGS.BUSINESSMEN]: {
    color: '#3B82F6',
    icon: <Business />,
  },
};

const getCommunityConfig = (slug) => {
  return communityConfig[slug] || { color: '#00695c', icon: <Public /> };
};

/**
 * ForoPage: Main forum page with role-based communities
 * Layout: Posts on the left, Communities sidebar on the right (no stats or profile card)
 */
export default function ForoPage({ initialCommunityId = null }) {
  // Diagnostic logging helper (enable by setting debugForo = true)
  const debugForo = false;
  if (debugForo) console.debug('[ForoPage] mount initialCommunityId=', initialCommunityId);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [openComposer, setOpenComposer] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [createdPosts, setCreatedPosts] = useState([]);
  const navigate = useNavigate();

  // Load communities
  const { data: communitiesData, isLoading: loadingCommunities, error: communitiesError } = useCommunities();
  const allCommunities = communitiesData || [];

  // Filter communities based on user role
  const communities = currentUser?.role 
    ? filterCommunitiesByRole(allCommunities, currentUser.role)
    : allCommunities;

  // Load posts (filtered by community if one is selected)
  const postsParams = selectedCommunity ? { community: selectedCommunity } : {};
  const { data: postsData, isLoading: loadingPosts } = usePosts(postsParams);

  // Get current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
          const user = await getProfile(token.replace(/^Bearer\s*/i, ""));
          const userData = {
            id: user.id || user.user_id,
            name: user.full_name || user.username || "Usuario",
            full_name: user.full_name,
            profile_picture: user.profile_picture,
            role: user.role,
            is_student: user.is_student,
            is_titled: user.is_titled,
          };
          setCurrentUser(userData);
          
          // Store in localStorage for useAuth hook
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Auto-join communities based on role
          if (user.role) {
            autoJoinCommunitiesByRole(user.role);
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  // Apply initialCommunityId if parent provided it (e.g. Dashboard passes params.id)
  useEffect(() => {
    if (initialCommunityId) {
      const parsed = parseInt(initialCommunityId);
      if (!isNaN(parsed)) {
        setSelectedCommunity(parsed);
        window.scrollTo(0, 0);
      }
    }
  }, [initialCommunityId]);

  useEffect(() => {
    if (debugForo) console.debug('[ForoPage] selectedCommunity changed=', selectedCommunity);
  }, [selectedCommunity]);
  

  // Combine backend posts with locally created posts
  const backendPosts = Array.isArray(postsData) ? postsData : postsData?.results || [];
  const allPosts = [...createdPosts, ...backendPosts];

  // Calculate relevance score for sorting
  const getRelevanceScore = (post) => {
    const likes = post.reactions_count || post.likes_count || 0;
    const comments = post.comments_count || 0;
    return (likes * 3) + (comments * 2);
  };

  // Filter and sort posts
  const filteredPosts = allPosts.filter((post) => {
    const matchesSearch =
      !searchQuery ||
      (post.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.content || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "relevance":
        return getRelevanceScore(b) - getRelevanceScore(a);
      case "trending": {
        const aScore = getRelevanceScore(a);
        const bScore = getRelevanceScore(b);
        const aAge = (Date.now() - new Date(a.created_at || 0).getTime()) / 3600000;
        const bAge = (Date.now() - new Date(b.created_at || 0).getTime()) / 3600000;
        const aDecay = Math.max(0.1, 1 - (aAge / 168));
        const bDecay = Math.max(0.1, 1 - (bAge / 168));
        return (bScore * bDecay) - (aScore * aDecay);
      }
      case "date":
      default:
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });

  const handlePostCreated = (newPost) => {
    if (newPost && newPost.id) {
      setCreatedPosts((prev) => [newPost, ...prev]);
      setOpenComposer(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setCreatedPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const sortOptions = [
    { id: "relevance", label: "Relevantes", icon: <TrendingUp sx={{ fontSize: 16 }} /> },
    { id: "date", label: "Recientes", icon: <AccessTime sx={{ fontSize: 16 }} /> },
    { id: "trending", label: "Tendencia", icon: <Whatshot sx={{ fontSize: 16 }} /> },
  ];

  if (loadingUser) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress sx={{ color: '#00695c' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", pt: 3, pb: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Main content - Posts */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              {/* Create post card */}
              <Paper
                elevation={0}
                onClick={() => setOpenComposer(true)}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  cursor: "pointer",
                  bgcolor: "#ffffff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    borderColor: "#00695c",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src={currentUser?.profile_picture}
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: "#00695c",
                      fontSize: "1.2rem",
                      fontWeight: 600,
                    }}
                  >
                    {currentUser?.name?.[0] || "?"}
                  </Avatar>
                  <Box
                    sx={{
                      flex: 1,
                      py: 1.5,
                      px: 2,
                      borderRadius: 6,
                      bgcolor: "#f0f2f5",
                      color: "text.secondary",
                      fontSize: "0.95rem",
                    }}
                  >
                    ¿Qué quieres compartir hoy?
                  </Box>
                </Box>
              </Paper>

              {/* Search and filters */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Buscar publicaciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 1.5,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#f8f9fa",
                    },
                  }}
                />

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, mr: 1 }}>
                    Ordenar:
                  </Typography>
                  {sortOptions.map((option) => (
                    <Chip
                      key={option.id}
                      icon={option.icon}
                      label={option.label}
                      onClick={() => setSortBy(option.id)}
                      size="small"
                      sx={{
                        cursor: "pointer",
                        fontWeight: sortBy === option.id ? 600 : 400,
                        bgcolor: sortBy === option.id ? "#00695c" : "transparent",
                        color: sortBy === option.id ? "white" : "text.secondary",
                        borderColor: sortBy === option.id ? "#00695c" : "rgba(0,0,0,0.2)",
                        "&:hover": {
                          bgcolor: sortBy === option.id ? "#00796b" : "rgba(0,0,0,0.04)",
                        },
                        "& .MuiChip-icon": {
                          color: sortBy === option.id ? "white" : "text.secondary",
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Paper>

              {/* Posts list */}
              {loadingPosts ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: 3,
                    bgcolor: "#ffffff",
                  }}
                >
                  <CircularProgress sx={{ color: '#00695c' }} />
                </Paper>
              ) : sortedPosts.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: 3,
                    bgcolor: "#ffffff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>
                    No hay publicaciones
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                    Sé el primero en publicar algo interesante
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenComposer(true)}
                    sx={{ 
                      borderRadius: 2, 
                      textTransform: "none",
                      bgcolor: '#00695c',
                      '&:hover': { bgcolor: '#00796b' },
                    }}
                  >
                    Crear publicación
                  </Button>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {sortedPosts.map((post) => (
                    <PostCard key={post.id} post={post} onDeleted={handlePostDeleted} />
                  ))}
                </Stack>
              )}
            </Stack>
          </Grid>

          {/* Right Sidebar - Communities only (no stats or profile) */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: "sticky", top: 80 }}>
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
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#1a1a1a",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <People sx={{ fontSize: 20, color: "#00695c" }} />
                  Mis Comunidades
                </Typography>

                {loadingCommunities ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                    <CircularProgress size={24} sx={{ color: '#00695c' }} />
                  </Box>
                ) : communitiesError ? (
                  <Alert severity="warning" sx={{ fontSize: "0.85rem" }}>
                    No se pudieron cargar las comunidades
                  </Alert>
                ) : communities.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No tienes comunidades asignadas
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {communities.map((community) => {
                      const config = getCommunityConfig(community.slug);
                      const isSelected = selectedCommunity === community.id;

                      return (
                          <Box
                            key={community.id}
                            onClick={() => navigate(`/foro/community/${community.id}`)}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: 2,
                            cursor: "pointer",
                            bgcolor: isSelected ? `${config.color}15` : "transparent",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: `${config.color}10`,
                              transform: "translateX(4px)",
                            },
                          }}
                        >
                          <Avatar
                            src={community.avatar}
                            sx={{
                              width: 44,
                              height: 44,
                              bgcolor: config.color,
                              boxShadow: `0 4px 12px ${config.color}40`,
                            }}
                          >
                            {config.icon}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                color: "#1a1a1a",
                              }}
                            >
                              {community.name}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="caption" color="text.secondary">
                                {community.members_count || 0} miembros
                              </Typography>
                              <Chip
                                size="small"
                                label="Miembro"
                                sx={{
                                  height: 18,
                                  fontSize: "0.65rem",
                                  bgcolor: `${config.color}20`,
                                  color: config.color,
                                  fontWeight: 600,
                                }}
                              />
                            </Stack>
                          </Box>
                          <Button
                            size="small"
                            component={RouterLink}
                            to={`/foro/community/${community.id}`}
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                              minWidth: "auto",
                              p: 0.5,
                              color: config.color,
                            }}
                          >
                            <ArrowForward sx={{ fontSize: 18 }} />
                          </Button>
                        </Box>
                      );
                    })}
                  </Stack>
                )}

                {selectedCommunity && (
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => setSelectedCommunity(null)}
                    sx={{
                      mt: 2,
                      textTransform: "none",
                      borderRadius: 2,
                      color: "text.secondary",
                    }}
                  >
                    Ver todas las publicaciones
                  </Button>
                )}
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Create post dialog */}
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
            <PostComposer
              communityId={selectedCommunity}
              onCreated={handlePostCreated}
            />
          </Paper>
        </Box>
      )}
    </Box>
  );
}
