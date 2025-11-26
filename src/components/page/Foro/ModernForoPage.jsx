import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  Stack,
  Button,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  Search,
  FilterList,
  Agriculture,
  LocalHospital,
  Pets,
  TrendingUp,
  NewReleases,
  Whatshot,
} from '@mui/icons-material';
import ModernPostCard from '../../molecules/Foro/ModernPostCard';
import ModernCommentCard from '../../molecules/Foro/ModernCommentCard';

/**
 * ModernForoPage - Página principal del foro con diseño moderno
 * Incluye filtros, categorías y búsqueda
 */
const ModernForoPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [sortBy, setSortBy] = useState('recientes');
  const [currentUser] = useState({ id: 1, name: 'Usuario Actual' }); // Mock user

  // Mock data - Reemplazar con datos reales del backend
  const [posts] = useState([
    {
      id: 1,
      title: 'Consulta sobre alimentación de ganado bovino',
      content: 'Hola comunidad, tengo una pregunta sobre la alimentación adecuada para ganado bovino en época de sequía. ¿Alguien tiene experiencia con esto?',
      author: { id: 1, name: 'Juan Pérez', profile_picture: null },
      category: 'ganadero',
      created_at: '2024-01-15T10:30:00Z',
      likes_count: 12,
      comments_count: 5,
      views_count: 45,
      tags: ['ganado', 'alimentación', 'bovino'],
      media: null,
    },
    {
      id: 2,
      title: 'Vacunación preventiva en cerdos',
      content: 'Comparto mi experiencia con el programa de vacunación preventiva que implementé en mi granja porcina. Los resultados han sido excelentes.',
      author: { id: 2, name: 'Dra. María González', profile_picture: null },
      category: 'veterinario',
      created_at: '2024-01-14T15:20:00Z',
      likes_count: 28,
      comments_count: 12,
      views_count: 89,
      tags: ['cerdos', 'vacunación', 'prevención'],
      media: null,
    },
    {
      id: 3,
      title: 'Nuevas técnicas de inseminación artificial',
      content: '¿Alguien ha probado las nuevas técnicas de IA que están usando en Europa? Me gustaría conocer experiencias de otros ganaderos.',
      author: { id: 3, name: 'Carlos Ramírez', profile_picture: null },
      category: 'ganadero',
      created_at: '2024-01-13T09:15:00Z',
      likes_count: 19,
      comments_count: 8,
      views_count: 67,
      tags: ['inseminación', 'técnicas', 'ganadería'],
      media: null,
    },
  ]);

  const categories = [
    { id: 'todos', label: 'Todos', icon: <FilterList />, color: '#757575' },
    { id: 'ganadero', label: 'Ganaderos', icon: <Agriculture />, color: '#2E7D32' },
    { id: 'veterinario', label: 'Veterinarios', icon: <LocalHospital />, color: '#1976D2' },
    { id: 'especialista', label: 'Especialistas', icon: <Pets />, color: '#7B1FA2' },
  ];

  const sortOptions = [
    { id: 'recientes', label: 'Más recientes', icon: <NewReleases /> },
    { id: 'populares', label: 'Más populares', icon: <TrendingUp /> },
    { id: 'tendencias', label: 'Tendencias', icon: <Whatshot /> },
  ];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'todos' || post.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'recientes') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === 'populares') {
      return b.likes_count - a.likes_count;
    } else {
      return (b.likes_count + b.comments_count) - (a.likes_count + a.comments_count);
    }
  });

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Sidebar izquierdo - Categorías */}
          <Grid item xs={12} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                position: 'sticky',
                top: 20,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontSize: '1.1rem' }}>
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
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      color: selectedCategory === cat.id ? cat.color : 'text.secondary',
                      bgcolor: selectedCategory === cat.id ? `${cat.color}15` : 'transparent',
                      fontWeight: selectedCategory === cat.id ? 700 : 500,
                      '&:hover': {
                        bgcolor: `${cat.color}10`,
                      },
                    }}
                  >
                    {cat.label}
                  </Button>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Contenido principal */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {/* Barra de búsqueda y filtros */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
                        <Search sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                {/* Filtros de ordenamiento */}
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {sortOptions.map((option) => (
                    <Chip
                      key={option.id}
                      icon={option.icon}
                      label={option.label}
                      onClick={() => setSortBy(option.id)}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: sortBy === option.id ? 'primary.main' : 'transparent',
                        color: sortBy === option.id ? 'white' : 'text.secondary',
                        border: `1px solid ${sortBy === option.id ? 'primary.main' : 'rgba(0,0,0,0.12)'}`,
                        fontWeight: sortBy === option.id ? 600 : 500,
                        '&:hover': {
                          bgcolor: sortBy === option.id ? 'primary.dark' : 'rgba(0,0,0,0.04)',
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Paper>

              {/* Lista de posts */}
              {sortedPosts.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 3,
                    bgcolor: '#ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                    No se encontraron publicaciones
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Intenta cambiar los filtros o crear una nueva publicación
                  </Typography>
                </Paper>
              ) : (
                sortedPosts.map((post) => (
                  <ModernPostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onLike={(id) => console.log('Like post:', id)}
                    onComment={(id) => console.log('Comment post:', id)}
                    onShare={(post) => console.log('Share post:', post)}
                    onBookmark={(id) => console.log('Bookmark post:', id)}
                    onDelete={(id) => console.log('Delete post:', id)}
                  />
                ))
              )}
            </Stack>
          </Grid>

          {/* Sidebar derecho - Estadísticas y comunidades */}
          <Grid item xs={12} md={3}>
            <Stack spacing={3}>
              {/* Estadísticas */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontSize: '1.1rem' }}>
                  Estadísticas
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Publicaciones
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {posts.length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Miembros activos
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      1,234
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Comentarios hoy
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      89
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
                  bgcolor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontSize: '1.1rem' }}>
                  Comunidades
                </Typography>
                <Stack spacing={1.5}>
                  {categories.slice(1).map((cat) => (
                    <Card
                      key={cat.id}
                      sx={{
                        p: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: cat.color, width: 40, height: 40 }}>
                          {cat.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {cat.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {Math.floor(Math.random() * 500 + 100)} miembros
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
    </Box>
  );
};

export default ModernForoPage;

