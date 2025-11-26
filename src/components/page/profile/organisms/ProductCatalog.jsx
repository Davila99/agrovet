import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import ProductCard from "../molecules/ProductCard";
import AddProductCard from "../molecules/AddProductCard";
import { uploadMedia } from "../../../../services/endpoints/media";
import { normalizeStoredToken } from "../../chat/chatUtils";
import { profilesAPI } from "../../../../services/endpoints";

const ProductCatalog = ({ products = [], editing, userId, userRole, onUpdate }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
    imagePreview: null,
  });
  const [uploading, setUploading] = useState(false);

  const handleOpenDialog = (index = null) => {
    if (index !== null) {
      const product = products[index];
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        image: null,
        imagePreview: product.url || product.image || null,
      });
      setEditingIndex(index);
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        image: null,
        imagePreview: null,
      });
      setEditingIndex(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      name: "",
      description: "",
      price: "",
      image: null,
      imagePreview: null,
    });
    setEditingIndex(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.description.trim()) {
      alert("La descripción es obligatoria");
      return;
    }

    setUploading(true);
    try {
      const token = normalizeStoredToken(localStorage.getItem("token"));
      let mediaId = null;

      // Si hay una nueva imagen, subirla
      if (formData.image) {
        const formDataToSend = new FormData();
        formDataToSend.append("image", formData.image);
        formDataToSend.append("name", formData.name || formData.description);
        formDataToSend.append("description", formData.description);
        if (formData.price) {
          formDataToSend.append("price", formData.price);
        }
        formDataToSend.append("folder", "products");

        const uploadedMedia = await uploadMedia(formDataToSend, token);
        mediaId = uploadedMedia.id;
      }

      // Obtener productos actuales
      const currentProducts = [...products];
      
      if (editingIndex !== null) {
        // Editar producto existente
        const existingProduct = currentProducts[editingIndex];
        const updatedProduct = {
          ...existingProduct,
          name: formData.name || null,
          description: formData.description,
          price: formData.price || null,
        };
        
        // Si hay nueva imagen, crear nuevo media y mantener el ID anterior para referencia
        if (mediaId && formData.image) {
          updatedProduct.id = mediaId;
          updatedProduct.url = formData.imagePreview;
        }
        // Si no hay nueva imagen, mantener el ID y URL existentes
        
        currentProducts[editingIndex] = updatedProduct;
      } else {
        // Agregar nuevo producto
        if (!mediaId) {
          alert("Debes subir una imagen para el producto");
          setUploading(false);
          return;
        }
        
        currentProducts.push({
          id: mediaId,
          name: formData.name || null,
          description: formData.description,
          price: formData.price || null,
          url: formData.imagePreview,
        });
      }

      // Actualizar el perfil con los nuevos productos
      const productIds = currentProducts.map((p) => p.id).filter(Boolean);
      
      // Actualizar el perfil de businessman
      if (userRole?.toLowerCase() === "businessman") {
        await profilesAPI.patchBusinessmanByUser(userId, {
          products_and_services_ids: productIds,
        }, token);
      }

      onUpdate && onUpdate(currentProducts);
      handleCloseDialog();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Error al guardar el producto");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (index) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      const token = normalizeStoredToken(localStorage.getItem("token"));
      const updatedProducts = products.filter((_, i) => i !== index);
      const productIds = updatedProducts.map((p) => p.id).filter(Boolean);

      if (userRole?.toLowerCase() === "businessman") {
        await profilesAPI.patchBusinessmanByUser(userId, {
          products_and_services_ids: productIds,
        }, token);
      }

      onUpdate && onUpdate(updatedProducts);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar el producto");
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        bgcolor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
          Catálogo de Productos
        </Typography>
      </Box>

      {products.length === 0 && !editing ? (
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
          <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 500 }}>
            No hay productos aún.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={1.5}>
          {/* Botón de agregar SIEMPRE visible si es mi perfil */}
          {editing && (
            <Grid item xs={6} sm={4} md={3} lg={2.4} sx={{ display: "flex" }}>
              <AddProductCard onClick={() => handleOpenDialog()} />
            </Grid>
          )}
          {products.map((product, index) => (
            <Grid item xs={6} sm={4} md={3} lg={2.4} key={product.id || index} sx={{ display: "flex" }}>
              <ProductCard
                product={product}
                editing={editing}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
                index={index}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {editingIndex !== null ? "Editar Producto" : "Agregar Producto"}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre del producto (opcional)"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              size="small"
            />
            <TextField
              fullWidth
              label="Descripción *"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              required
              size="small"
            />
            <TextField
              fullWidth
              label="Precio (opcional)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              size="small"
              inputProps={{ step: "0.01", min: "0" }}
            />
            <Box>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="product-image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="product-image-upload">
                <Button variant="outlined" component="span" fullWidth>
                  {formData.imagePreview ? "Cambiar imagen" : "Subir imagen"}
                </Button>
              </label>
              {formData.imagePreview && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={uploading || !formData.description.trim()}
          >
            {uploading ? <CircularProgress size={20} /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ProductCatalog;

