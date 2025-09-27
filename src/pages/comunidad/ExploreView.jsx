import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";

const exploreData = [
  {
    id: 1,
    title: "Veterinario destacado",
    image:
      "https://ineforma.com/wp-content/uploads/2025/01/El-papel-del-auxiliar-de-veterinario-en-la-atencion-a-animales-con-necesidades-especiales.jpg",
  },
  {
    id: 2,
    title: "Agrónoma experta",
    image:
      "https://usap.edu/2024/wp-content/uploads/2025/05/envato-articulo-0003-dic-24.jpg",
  },
  {
    id: 3,
    title: "Nuevo curso de ganado",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4XA8KNxrcNNoeo-iBWyI5t0jvgQ2FMLg2_Q&s",
  },
  {
    id: 4,
    title: "Cultivos sostenibles",
    image:
      "https://rodaleinstitute.org/wp-content/uploads/FSTorganicBeans2010.jpg",
  },
];

const ExploreView = () => {
  return (
    <Box
      sx={{
        mx: "auto",
        py: { xs: 3, md: 5 },
        px: { xs: 2, md: 0 },
        justifyContent: "center",
        color:"#000"
      }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: { xs: 3, md: 5 }, textAlign: "center" }}>
        Explorar
      </Typography>

      <Grid container spacing={3}>
        {exploreData.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 6,
                },
              }}>
              <CardMedia
                component="img"
                image={item.image}
                alt={item.title}
                sx={{
                  height: { xs: 180, sm: 200, md: 140 },
                  objectFit: "cover",
                }}
              />
              <CardContent>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ textAlign: "center" }}>
                  {item.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ExploreView;
