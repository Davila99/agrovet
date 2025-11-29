import React, { useState } from "react";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { MoreVert, Edit, Delete } from "@mui/icons-material";

const PortfolioCard = ({ item, editing, onEdit, onDelete, index }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Validar y normalizar la URL de la imagen
  const imageUrl = React.useMemo(() => {
    const url = item?.url || item?.image || null;
    if (!url) {
      console.warn(`[PortfolioCard] Item ${index} no tiene URL:`, item);
      return null;
    }
    // Validar que sea una URL válida
    if (typeof url !== 'string' || url.trim() === '') {
      console.warn(`[PortfolioCard] Item ${index} tiene URL inválida:`, url);
      return null;
    }
    // Si es una URL relativa, convertirla a absoluta
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Si empieza con /, asumir que es relativa al dominio
    if (url.startsWith('/')) {
      return url;
    }
    // Si no, devolverla tal cual (puede ser una URL de Supabase)
    return url;
  }, [item?.url, item?.image, index]);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleClose();
    onEdit && onEdit(index);
  };

  const handleDelete = () => {
    handleClose();
    onDelete && onDelete(index);
  };

  // Log para debugging
  React.useEffect(() => {
    console.log(`[PortfolioCard ${index}] Renderizando:`, {
      id: item?.id,
      name: item?.name || item?.title,
      url: item?.url,
      image: item?.image,
      imageUrl,
      hasImage: !!imageUrl
    });
  }, [item, index, imageUrl]);

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        },
      }}
    >
      {imageUrl ? (
        <Box sx={{ position: "relative", width: "100%", height: "120px", flexShrink: 0 }}>
          <CardMedia
            component="img"
            image={imageUrl}
            alt={item?.title || item?.name || "Portafolio"}
            onError={(e) => {
              console.error(`[PortfolioCard ${index}] Error al cargar imagen:`, imageUrl, e);
              e.target.style.display = 'none';
            }}
            onLoad={() => {
              console.log(`[PortfolioCard ${index}] Imagen cargada exitosamente:`, imageUrl);
            }}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
          {editing && (
            <>
              <IconButton
                onClick={handleClick}
                sx={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  bgcolor: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.8)",
                  },
                  zIndex: 2,
                  width: 20,
                  height: 20,
                }}
                size="small"
              >
                <MoreVert sx={{ fontSize: 14 }} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem onClick={handleEdit}>
                  <Edit fontSize="small" sx={{ mr: 1 }} />
                  Editar
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
                  <Delete fontSize="small" sx={{ mr: 1 }} />
                  Eliminar
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      ) : (
        <Box sx={{ 
          position: "relative", 
          width: "100%", 
          height: "120px", 
          flexShrink: 0,
          bgcolor: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.6rem" }}>
            Sin imagen
          </Typography>
        </Box>
      )}
      <CardContent sx={{ p: 0.75, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            mb: 0.15,
            fontSize: "0.7rem",
            color: "#103E68",
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}
        >
          {item.name || item.title || "Sin título"}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            lineHeight: 1.25,
            mb: 0.25,
            fontSize: "0.6rem",
            flexGrow: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {item.description || "Sin descripción"}
        </Typography>
        {item.created_at && (
          <Typography
            variant="caption"
            sx={{
              color: "text.disabled",
              fontSize: "0.55rem",
              display: "block",
              mt: "auto",
            }}
          >
            📅 {new Date(item.created_at).toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioCard;

