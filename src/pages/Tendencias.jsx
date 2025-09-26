import React from "react";
import { Card, CardContent, Typography, Grid, Box, Chip } from "@mui/material";

const tendenciasMock = [
  {
    id: 1,
    titulo: "Control biológico de plagas en tomate",
    autor: "Juan Pérez",
    reacciones: 45,
    categoria: "Agronomía",
  },
  {
    id: 2,
    titulo: "Alza del precio del maíz en septiembre",
    autor: "María López",
    reacciones: 32,
    categoria: "Negocios",
  },
  {
    id: 3,
    titulo: "Mejores vacunas para ganado bovino 2025",
    autor: "Carlos Ramírez",
    reacciones: 28,
    categoria: "Veterinaria",
  },
];

const TendenciasPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 3, color: "#103E68" }}>
        🔥 Tendencias
      </Typography>
      <Grid container spacing={3}>
        {tendenciasMock.map((post) => (
          <Grid item xs={12} md={4} key={post.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {post.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Por {post.autor}
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "space-between",
                  }}>
                  <Chip
                    label={post.categoria}
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="body2">👍 {post.reacciones}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TendenciasPage;
