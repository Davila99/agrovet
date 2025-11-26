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
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import MicNoneIcon from "@mui/icons-material/MicNone";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Atomic Design components
import PostList from "../organisms/Foro/PostList";
import PostComposer from "../molecules/Foro/PostComposer";
import SidebarCommunities from "../organisms/Foro/SidebarCommunities";

// Services
import { fetchUsers } from "../../data/users";
import foroService from "../../services/endpoints/foro";
import { usePosts } from "../../hooks/Foro/useForoApi";

/**
 * ForoPage: Main forum page restored from commit 07f5d62
 * Adapted to use Atomic Design components and microservices backend
 */
export default function ForoPage() {
  // Datos dinámicos desde backend
  const [postText, setPostText] = useState("");
  const [openComposer, setOpenComposer] = useState(false);
  const [createdPosts, setCreatedPosts] = useState([]);

  // Use the hook to fetch posts from backend
  const { data: postsData, isLoading: loadingPosts } = usePosts();
  // Posts data structure: can be {results: [...]} or array directly
  const posts = Array.isArray(postsData) ? postsData : (postsData?.results || []);



  const handlePostCreated = (newPost) => {
    if (newPost && newPost.id) {
      setCreatedPosts((prev) => [newPost, ...prev]);
      setOpenComposer(false);
    }
  };

  const handlePublishClick = async () => {
    if (!postText.trim()) return;
    try {
      const newPost = await foroService.createPost({
        title: postText.substring(0, 100),
        content: postText,
      });
      if (newPost && newPost.id) {
        setCreatedPosts((prev) => [newPost, ...prev]);
        setPostText("");
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f4f6fc", minHeight: "100vh", pt: 4, pb: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* ======= COLUMNA IZQUIERDA – ESPECIALISTAS ======= */}


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
                        onClick={() => setOpenComposer(true)}
                      >
                        Imagen
                      </Button>
                      <Button
                        size="small"
                        startIcon={<MicNoneIcon />}
                        sx={{ textTransform: "none" }}
                        onClick={() => setOpenComposer(true)}
                      >
                        Audio
                      </Button>
                      <Box sx={{ flex: 1 }} />
                      <Button
                        variant="contained"
                        disabled={!postText.trim()}
                        onClick={handlePublishClick}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                      >
                        Publicar
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>

              {/* Posts List using Atomic Design component */}
              {loadingPosts ? (
                <Box>
                  {[...Array(3)].map((_, i) => (
                    <Card
                      key={i}
                      sx={{
                        borderRadius: 4,
                        border: "1px solid #e8e8ef",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.06)",
                        mb: 2,
                      }}
                    >
                      <CardContent>
                        <Skeleton variant="text" width="60%" height={40} />
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="80%" />
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <PostList extraPosts={createdPosts} />
              )}

              {/* Secciones móviles para Especialistas y Negocios */}


            </Stack>
          </Grid>

          {/* ======= COLUMNA DERECHA – NEGOCIOS Y COMUNIDADES ======= */}
          <Grid
            item
            xs={12}
            md={3}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Stack spacing={3}>
              {/* Comunidades usando Atomic Design component */}
              <SidebarCommunities />
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Dialog for Post Composer with media */}
      {
        openComposer && (
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
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <PostComposer onCreated={handlePostCreated} />
            </Paper>
          </Box>
        )
      }
    </Box >
  );
}
