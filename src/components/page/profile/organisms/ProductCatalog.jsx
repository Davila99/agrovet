import React, { useState, useRef, useEffect } from "react";
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
  Chip,
  InputAdornment,
} from "@mui/material";
import { Close, AddAPhoto } from "@mui/icons-material";
import ProductCard from "../molecules/ProductCard";
import AddProductCard from "../molecules/AddProductCard";
import ImageCarousel from "../../../atoms/add/ImageCarousel";
import { normalizeStoredToken } from "../../chat/chatUtils";
import { profilesAPI } from "../../../../services/endpoints";
import { buildUrl } from "../../../../services/env";
import useCurrency from "../../../../hooks/useCurrency";

const ProductCatalog = ({ products = [], editing, userId, userRole, onUpdate, isOwnProfile, userLocation }) => {
  const { symbol: currencySymbol } = useCurrency();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    main_image: null,
    secondary_images: [],
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Intentar recuperar productos de localStorage si products está vacío
  useEffect(() => {
    if (products.length === 0 && userId && onUpdate) {
      try {
        const backupKey = `products_backup_${userId}`;
        const backupData = localStorage.getItem(backupKey);
        if (backupData) {
          const backup = JSON.parse(backupData);
          if (backup.products_and_services_full?.length > 0) {
            console.log('[ProductCatalog] 🔄 Recuperando productos de localStorage:', backup.products_and_services_full.length);
            onUpdate(backup.products_and_services_full);
          }
        }
      } catch (e) {
        console.warn('[ProductCatalog] Error recuperando backup:', e);
      }
    }
  }, [products.length, userId, onUpdate]);

  const handleOpenDialog = (index = null) => {
    if (index !== null) {
      const product = products[index];
      // Si el producto tiene múltiples imágenes, separarlas
      const images = product.images || (product.url ? [product.url] : []);
      setFormData({
        title: product.title || product.name || "",
        description: product.description || "",
        price: product.price || "",
        main_image: images[0] || null,
        secondary_images: images.slice(1) || [],
      });
      setEditingIndex(index);
    } else {
      setFormData({
        title: "",
        description: "",
        price: "",
        main_image: null,
        secondary_images: [],
      });
      setEditingIndex(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      title: "",
      description: "",
      price: "",
      main_image: null,
      secondary_images: [],
    });
    setEditingIndex(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiles = (fileList) => {
    if (!fileList) return;
    const arr = Array.from(fileList || []).slice(0, 5);
    if (!arr.length) return;
    setFormData((prev) => {
      const prevSecondary = Array.isArray(prev.secondary_images) ? [...prev.secondary_images] : [];
      if (!prev.main_image) {
        const [first, ...rest] = arr;
        const newSecondaries = [...prevSecondary, ...rest].slice(0, 4);
        return { ...prev, main_image: first, secondary_images: newSecondaries };
      }
      const combined = [...prevSecondary, ...arr].slice(0, 4);
      return { ...prev, secondary_images: combined };
    });
  };

  const onFileChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const removeImage = (index, isMain = false) => {
    setFormData((prev) => {
      if (isMain) {
        const newSecondaries = prev.secondary_images || [];
        const newMain = newSecondaries[0] || null;
        return {
          ...prev,
          main_image: newMain,
          secondary_images: newSecondaries.slice(1),
        };
      } else {
        const newSecondaries = [...(prev.secondary_images || [])];
        newSecondaries.splice(index, 1);
        return { ...prev, secondary_images: newSecondaries };
      }
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || formData.title.trim().length < 3) {
      alert("El título es obligatorio y debe tener al menos 3 caracteres");
      return;
    }
    if (!formData.main_image && editingIndex === null) {
      alert("Debes subir al menos una imagen para el producto");
      return;
    }

    setUploading(true);
    try {
      const token = normalizeStoredToken(localStorage.getItem("token"));

      // Helper para subir un archivo al servicio de media
      // Retorna { id, url } para guardar la URL permanente
      const uploadFile = async (file) => {
        try {
          const mfd = new FormData();
          mfd.append("image", file, file.name);
          mfd.append("name", formData.title);
          mfd.append("description", formData.description || "");
          if (formData.price) {
            mfd.append("price", formData.price);
          }
          mfd.append("folder", "products");

          const mediaUrl = buildUrl("MEDIA", "/media/");
          const response = await fetch(mediaUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: mfd,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const resp = await response.json();
          console.log('[ProductCatalog] 📤 Respuesta del media service:', JSON.stringify(resp, null, 2));
          // Retornar tanto el ID como la URL permanente
          const uploadedUrl = resp?.file_url || resp?.url || resp?.image_url || resp?.public_url || null;
          console.log('[ProductCatalog] 📤 URL extraída:', uploadedUrl);
          return resp ? { 
            id: resp.id, 
            url: uploadedUrl
          } : null;
        } catch (e) {
          console.error("uploadFile error", e);
          return null;
        }
      };

      // Subir imágenes
      let mainMedia = null;
      const secondaryMedia = [];

      if (formData.main_image instanceof File) {
        console.log('[ProductCatalog] 📤 Subiendo imagen principal...');
        mainMedia = await uploadFile(formData.main_image);
        console.log('[ProductCatalog] 📤 mainMedia resultado:', mainMedia);
        if (!mainMedia || !mainMedia.id) throw new Error("No se pudo subir la imagen principal");
      } else if (formData.main_image && typeof formData.main_image === "string") {
        // Si es una URL (imagen existente), buscar el ID del producto existente
        const existingProduct = editingIndex !== null ? products[editingIndex] : null;
        if (existingProduct && existingProduct.id) {
          mainMedia = { id: existingProduct.id, url: existingProduct.url };
        }
      }

      // Subir imágenes secundarias
      for (const img of formData.secondary_images || []) {
        if (img instanceof File) {
          const media = await uploadFile(img);
          if (media && media.id) secondaryMedia.push(media);
        } else if (img && typeof img === "string") {
          // Si es una URL existente, mantenerla
          secondaryMedia.push({ id: null, url: img });
        }
      }

      // Obtener productos actuales
      const currentProducts = [...products];

      if (editingIndex !== null) {
        // Editar producto existente
        const existingProduct = currentProducts[editingIndex];
        const updatedProduct = {
          ...existingProduct,
          title: formData.title,
          name: formData.title,
          description: formData.description || null,
          price: formData.price || null,
          images: [mainMedia?.id, ...secondaryMedia.map(m => m.id)].filter(Boolean),
        };

        // Si hay nueva imagen principal, actualizar con URL permanente
        if (mainMedia && formData.main_image instanceof File) {
          updatedProduct.id = mainMedia.id;
          updatedProduct.url = mainMedia.url; // URL permanente del servidor
        }

        currentProducts[editingIndex] = updatedProduct;
      } else {
        // Agregar nuevo producto
        if (!mainMedia || !mainMedia.id) {
          alert("Debes subir al menos una imagen para el producto");
          setUploading(false);
          return;
        }

        const newProduct = {
          id: mainMedia.id,
          title: formData.title,
          name: formData.title,
          description: formData.description || null,
          price: formData.price || null,
          url: mainMedia.url, // URL permanente del servidor, no blob URL
          images: [mainMedia.id, ...secondaryMedia.map(m => m.id)].filter(Boolean),
        };
        console.log('[ProductCatalog] ✅ Nuevo producto creado:', newProduct);
        currentProducts.push(newProduct);
      }

      // Actualizar el perfil con los nuevos productos
      const productIds = currentProducts.map((p) => p.id).filter(Boolean);

      // Actualizar el perfil de businessman
      if (userRole?.toLowerCase() === "businessman") {
        await profilesAPI.patchBusinessmanByUser(userId, {
          products_and_services_ids: productIds,
        }, token);
      }

      // Guardar backup en localStorage para recuperación
      try {
        const backupKey = `products_backup_${userId}`;
        const backupData = {
          products_and_services_ids: productIds,
          products_and_services_full: currentProducts,
          timestamp: Date.now(),
        };
        localStorage.setItem(backupKey, JSON.stringify(backupData));
        console.log('[ProductCatalog] ✅ Backup guardado en localStorage:', productIds.length, 'productos');
      } catch (e) {
        console.warn('[ProductCatalog] No se pudo guardar backup:', e);
      }

      onUpdate && onUpdate(currentProducts);
      handleCloseDialog();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Error al guardar el producto: " + (error.message || "Error desconocido"));
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

      // Actualizar backup en localStorage
      try {
        const backupKey = `products_backup_${userId}`;
        const backupData = {
          products_and_services_ids: productIds,
          products_and_services_full: updatedProducts,
          timestamp: Date.now(),
        };
        localStorage.setItem(backupKey, JSON.stringify(backupData));
      } catch (e) {
        // Ignorar errores de localStorage
      }

      onUpdate && onUpdate(updatedProducts);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar el producto");
    }
  };

  const allImages = [
    ...(formData.main_image ? [formData.main_image] : []),
    ...(formData.secondary_images || []),
  ];

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
            bgcolor: "transparent",
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

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { maxHeight: "90vh" }
        }}
      >
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
            {/* Sección de fotos */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Fotos
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={onFileChange}
              />
              <Box
                sx={{
                  mt: 1,
                  borderRadius: 2,
                  border: "1px dashed rgba(16,24,40,0.06)",
                  overflow: "hidden",
                  bgcolor: "#ffffff",
                  cursor: "pointer",
                }}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                {allImages.length === 0 ? (
                  <Box
                    sx={{
                      width: "100%",
                      height: 200,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box sx={{ textAlign: "center", color: "#6b7280" }}>
                      <AddAPhoto sx={{ fontSize: 42 }} />
                      <Typography sx={{ mt: 1, color: "#6b7280", fontWeight: 600 }}>
                        Agregar fotos
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ position: "relative" }}>
                    <ImageCarousel images={allImages} height={200} />
                    <Chip
                      label={`${allImages.length} foto${allImages.length !== 1 ? "s" : ""}`}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "rgba(0,0,0,0.55)",
                        color: "#fff",
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Box>

            {/* Título (obligatorio) */}
            <TextField
              fullWidth
              label="Título *"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              size="small"
              helperText="Mínimo 3 caracteres"
            />

            {/* Descripción (opcional) */}
            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              size="small"
            />

            {/* Precio (opcional) */}
            <TextField
              fullWidth
              label="Precio"
              name="price"
              value={formData.price}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^\d*(\.\d{0,2})?$/.test(v)) {
                  handleInputChange(e);
                }
              }}
              inputProps={{ inputMode: "decimal", pattern: "^\\d*(\\.\\d{0,2})?$" }}
              InputProps={{
                startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
              }}
              size="small"
            />


          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={uploading || !formData.title || formData.title.trim().length < 3}
          >
            {uploading ? <CircularProgress size={20} /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ProductCatalog;
