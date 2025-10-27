import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";

const PerfilPortfolio = ({
  editing,
  portfolio = [],
  onAdd,
  onEdit,
  onDelete,
}) => {
  const empty = portfolio.length === 0;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, mt: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight="bold" color="#103E68">
          Portafolio
        </Typography>

        {editing && (
          <Tooltip title="Agregar nuevo">
            <IconButton color="primary" onClick={onAdd}>
              <Add />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {empty ? (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          No hay proyectos aún.{" "}
          {editing && "Agrega tu primer trabajo o servicio."}
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {portfolio.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s ease",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                {item.image && (
                  <CardMedia
                    component="img"
                    height="160"
                    image={item.image}
                    alt={item.title}
                  />
                )}
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>

                {editing && (
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <IconButton size="small" onClick={() => onEdit(index)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(index)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PerfilPortfolio;
