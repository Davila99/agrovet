import React, { useState } from "react";
import {
  Box,
  Card,
  CardMedia,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
} from "@mui/material";
import { MoreVert, Edit, Delete } from "@mui/icons-material";

const ProductCard = ({ product, editing, onEdit, onDelete, index }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

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
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        height: "100%",
        minHeight: "140px", // Altura mínima reducida
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardMedia
        component="img"
        image={product.url || product.image}
        alt={product.name || product.description || "Producto"}
        sx={{
          width: "100%",
          height: "80px", // Altura reducida para la imagen
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
      {(product.name || product.description || product.price) && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            p: 0.5,
            backdropFilter: "blur(4px)",
          }}
        >
          {product.name && (
            <Typography variant="caption" sx={{ fontWeight: 600, display: "block", fontSize: "0.6rem" }}>
              {product.name}
            </Typography>
          )}
          {product.description && (
            <Typography variant="caption" sx={{ fontSize: "0.55rem", display: "block", mt: 0.15 }}>
              {product.description}
            </Typography>
          )}
          {product.price && (
            <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mt: 0.15, fontSize: "0.6rem" }}>
              ${product.price}
            </Typography>
          )}
        </Box>
      )}
    </Card>
  );
};

export default ProductCard;

