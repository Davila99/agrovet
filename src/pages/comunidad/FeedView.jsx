import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  IconButton,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CommentIcon from "@mui/icons-material/Comment";

const feedData = [
  {
    id: 1,
    user: "Dr. Juan",
    avatar: "J",
    title: "Revisión de ganado bovino",
    image:
      "https://cdn.bmeditores.mx/2023/08/control-produccion-ganaderia-3.jpg",
    description: "Compartiendo buenas prácticas para el manejo sanitario.",
  },
  {
    id: 2,
    user: "Ana Agrónoma",
    avatar: "A",
    title: "Problemas en cultivo de frijol",
    image:
      "https://www.debate.com.mx/__export/1724119399342/sites/debate/img/2024/08/19/frijol.jpg_903949729.jpg",
    description: "Cómo prevenir plagas en tus cultivos.",
  },
];

const FeedView = () => {
  return (
    <Box sx={{ maxWidth: 800, mx: "auto", py: 5    ,     color:"#000"}}>
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 3, textAlign: "center" }}>
        Feed de AgroVets
      </Typography>
      {feedData.map((post) => (
        <Card key={post.id} sx={{ mb: 4, borderRadius: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
            <Avatar sx={{ mr: 2 }}>{post.avatar}</Avatar>
            <Typography variant="subtitle1" fontWeight="bold">
              {post.user}
            </Typography>
          </Box>
          <CardMedia
            component="img"
            height="200"
            image={post.image}
            alt={post.title}
            sx={{ objectFit: "cover" }}
          />
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {post.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {post.description}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <IconButton color="error">
                <FavoriteBorderIcon />
              </IconButton>
              <IconButton>
                <CommentIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default FeedView;
