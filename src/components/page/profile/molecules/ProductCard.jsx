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
import useCurrency from "../../../../hooks/useCurrency";

const ProductCard = ({ product, editing, onEdit, onDelete, index }) => {
  const { symbol: currencySymbol } = useCurrency();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Normalizar la URL de la imagen - buscar en múltiples campos posibles
  const imageUrl = React.useMemo(() => {
    const url = product?.url || 
                product?.file_url || 
                product?.public_url || 
                product?.image || 
                product?.image_url ||
                (product?.images && product?.images[0]) || 
                null;
    if (!url) {
      console.warn('[ProductCard] Producto sin URL:', product);
      return null;
    }
    if (typeof url !== 'string' || url.trim() === '') return null;
    return url;
  }, [product]);

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
            alt={product?.title || product?.name || "Producto"}
            onError={(e) => {
              e.target.style.display = 'none';
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
                  top: 4,
                  right: 4,
                  bgcolor: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.8)",
                  },
                  zIndex: 2,
                  width: 24,
                  height: 24,
                }}
                size="small"
              >
                <MoreVert sx={{ fontSize: 16 }} />
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
          bgcolor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.6rem" }}>
            Sin imagen
          </Typography>
          {editing && (
            <IconButton
              onClick={handleClick}
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                bgcolor: "rgba(0, 0, 0, 0.6)",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.8)",
                },
                zIndex: 2,
                width: 24,
                height: 24,
              }}
              size="small"
            >
              <MoreVert sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>
      )}
      <CardContent sx={{ p: 1, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            mb: 0.25,
            fontSize: "0.75rem",
            color: "#103E68",
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.title || product.name || "Sin título"}
        </Typography>
        {product.description && (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              lineHeight: 1.3,
              fontSize: "0.65rem",
              flexGrow: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.description}
          </Typography>
        )}
        {/* Precio destacado */}
        {product.price && (
          <Typography
            sx={{
              color: "#00896b",
              fontWeight: 800,
              fontSize: "1rem",
              mt: "auto",
              pt: 0.5,
            }}
          >
            {currencySymbol} {product.price}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
