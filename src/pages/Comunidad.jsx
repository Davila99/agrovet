import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from "@mui/material";

const comunidadMock = [
  {
    id: 1,
    titulo: "¿Qué fertilizante recomiendan para frijol en suelos ácidos?",
    autor: "Ana Castillo",
    respuestas: 12,
    categoria: "Agronomía",
  },
  {
    id: 2,
    titulo: "Ayuda: tratamiento para mastitis en vacas",
    autor: "Pedro Gómez",
    respuestas: 8,
    categoria: "Veterinaria",
  },
  {
    id: 3,
    titulo: "Experiencias usando drones en monitoreo de cultivos",
    autor: "Luis Martínez",
    respuestas: 15,
    categoria: "Tecnología",
  },
];

const ComunidadPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 3, color: "#103E68" }}>
        👥 Comunidad
      </Typography>
      <List>
        {comunidadMock.map((post, index) => (
          <React.Fragment key={post.id}>
            <ListItem
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
              <ListItemText
                primary={post.titulo}
                secondary={`Por ${post.autor} • ${post.respuestas} respuestas`}
              />
              <Chip label={post.categoria} color="success" variant="outlined" />
            </ListItem>
            {index < comunidadMock.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default ComunidadPage;
