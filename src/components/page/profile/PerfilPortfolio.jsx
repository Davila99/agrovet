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
  Paper,
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
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        bgcolor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#103E68",
            fontSize: "1.25rem",
          }}
        >
          Portafolio
        </Typography>

        {editing && (
          <Tooltip title="Agregar nuevo proyecto">
            <IconButton
              color="primary"
              onClick={onAdd}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                "&:hover": {
                  bgcolor: "primary.dark",
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <Add />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {empty ? (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            px: 2,
            borderRadius: 2,
            bgcolor: "#f8f9fa",
            border: "2px dashed #dee2e6",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            No hay proyectos aún.
          </Typography>
          {editing && (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mt: 1,
              }}
            >
              Agrega tu primer trabajo o servicio.
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {portfolio.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  },
                }}
              >
                {item.image && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image}
                    alt={item.title}
                    sx={{
                      objectFit: "cover",
                      transition: "transform 0.3s",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  />
                )}
                <CardContent sx={{ p: 2.5 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: "1.125rem",
                      color: "#103E68",
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.description}
                  </Typography>
                </CardContent>

                {editing && (
                  <CardActions
                    sx={{
                      justifyContent: "flex-end",
                      px: 2,
                      pb: 2,
                      borderTop: "1px solid #e9ecef",
                      pt: 1.5,
                    }}
                  >
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => onEdit && onEdit(index)}
                        sx={{
                          color: "text.secondary",
                          "&:hover": {
                            color: "primary.main",
                            bgcolor: "#f8f9fa",
                          },
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete && onDelete(index)}
                        sx={{
                          "&:hover": {
                            bgcolor: "#fee",
                          },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default PerfilPortfolio;
