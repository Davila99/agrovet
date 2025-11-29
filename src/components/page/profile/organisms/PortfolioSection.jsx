import React, { useState, useEffect } from "react";
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
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import PortfolioCard from "../molecules/PortfolioCard";
import AddProductCard from "../molecules/AddProductCard";
import { uploadMedia } from "../../../../services/endpoints/media";
import { normalizeStoredToken } from "../../chat/chatUtils";
import { profilesAPI } from "../../../../services/endpoints";
import { authHeaders } from "../../../../services/endpoints/utils";

const PortfolioSection = ({ portfolio = [], editing, userId, userRole, onUpdate, isOwnProfile = true }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    imagePreview: null,
  });
  const [uploading, setUploading] = useState(false);

  // Debug: Log portfolio data
  useEffect(() => {
    console.log("=".repeat(60));
    console.log("=== PortfolioSection Debug ===");
    console.log("portfolio recibido:", portfolio);
    console.log("portfolio es array?", Array.isArray(portfolio));
    console.log("portfolio.length:", portfolio?.length);
    console.log("portfolio tipo:", typeof portfolio);
    if (portfolio && Array.isArray(portfolio) && portfolio.length > 0) {
      console.log("portfolio items detallados:");
      portfolio.forEach((item, idx) => {
        console.log(`  Item ${idx}:`, {
          id: item?.id,
          name: item?.name || item?.title,
          url: item?.url,
          image: item?.image,
          description: item?.description,
          created_at: item?.created_at,
          keys: item ? Object.keys(item) : 'null'
        });
        // Validar URL
        const url = item?.url || item?.image;
        if (url) {
          console.log(`    URL válida?:`, typeof url === 'string' && url.trim() !== '');
          console.log(`    URL tipo:`, typeof url);
          console.log(`    URL valor:`, url);
        } else {
          console.warn(`    ⚠️ Item ${idx} NO TIENE URL`);
        }
      });
    } else {
      console.warn("⚠️ Portfolio está vacío o no es un array válido");
    }
    console.log("editing:", editing);
    console.log("isOwnProfile:", isOwnProfile);
    console.log("userId:", userId);
    console.log("userRole:", userRole);
    console.log("=".repeat(60));
  }, [portfolio, editing, isOwnProfile, userId, userRole]);

  const handleOpenDialog = (index = null) => {
    if (index !== null) {
      const item = portfolio[index];
      setFormData({
        title: item.title || item.name || "",
        description: item.description || "",
        image: null,
        imagePreview: item.image || item.url || null,
      });
      setEditingIndex(index);
    } else {
      setFormData({
        title: "",
        description: "",
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
      title: "",
      description: "",
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
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("El título y la descripción son obligatorios");
      return;
    }

    setUploading(true);
    try {
      const token = normalizeStoredToken(localStorage.getItem("token"));
      let mediaId = null;
      let uploadedMedia = null;

      // Si hay una nueva imagen, subirla
      if (formData.image) {
        console.log("📤 Iniciando subida de imagen...");
        const formDataToSend = new FormData();
        formDataToSend.append("image", formData.image);
        formDataToSend.append("name", formData.title);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("folder", "portfolio");

        try {
          uploadedMedia = await uploadMedia(formDataToSend, token);
          console.log("✅ Media subido - Respuesta completa:", JSON.stringify(uploadedMedia, null, 2));
          
          mediaId = uploadedMedia?.id || uploadedMedia?.pk;
          
          // Validar que tenemos la URL de Supabase
          const mediaUrl = uploadedMedia?.url || uploadedMedia?.public_url || uploadedMedia?.path;
          if (!mediaUrl) {
            console.error("❌ Error: No se recibió URL del media subido. Respuesta completa:", uploadedMedia);
            alert("Error al subir la imagen. Por favor intenta de nuevo.");
            setUploading(false);
            return;
          }
          
          // Asegurar que uploadedMedia tenga la URL correcta
          if (!uploadedMedia.url) {
            uploadedMedia.url = mediaUrl;
          }
          
          console.log("✅ Media subido correctamente - ID:", mediaId, "URL:", uploadedMedia.url);
          console.log("✅ uploadedMedia completo:", JSON.stringify(uploadedMedia, null, 2));
          
          // CRÍTICO: Asegurar que la URL esté disponible inmediatamente
          if (!uploadedMedia.url) {
            console.error("❌ ERROR CRÍTICO: uploadedMedia no tiene URL después de normalizar");
            console.error("❌ uploadedMedia keys:", Object.keys(uploadedMedia));
            alert("Error: No se pudo obtener la URL de la imagen subida. Por favor intenta de nuevo.");
            setUploading(false);
            return;
          }
        } catch (uploadError) {
          console.error("❌ Error al subir media:", uploadError);
          alert("Error al subir la imagen: " + (uploadError.message || "Error desconocido"));
          setUploading(false);
          return;
        }
      }

      // Obtener items actuales
      const currentItems = [...portfolio];
      
      if (editingIndex !== null) {
        // Editar item existente - necesitamos actualizar el media existente
        const existingItem = currentItems[editingIndex];
        const existingMediaId = existingItem.id;
        
        // Si hay nueva imagen, crear nuevo media y reemplazar el anterior
        if (mediaId && formData.image && uploadedMedia) {
          // Usar la URL del media subido (de Supabase), no el preview temporal
          const mediaUrl = uploadedMedia.url || existingItem.url;
          // Actualizar el item con el nuevo media
          currentItems[editingIndex] = {
            id: mediaId,
            name: formData.title,
            description: formData.description,
            title: formData.title, // Para compatibilidad
            url: mediaUrl, // Usar URL de Supabase
            created_at: uploadedMedia.created_at || existingItem.created_at || new Date().toISOString(),
          };
        } else {
          // Solo actualizar los campos name y description del media existente
          // Necesitamos hacer un PATCH al media service
          try {
            const httpClient = (await import("../../../../services/httpClient")).default;
            const env = (await import("../../../../services/env")).default;
            const mediaUrl = env.buildUrl('MEDIA', `/media/${existingMediaId}/`);
            const updatedMedia = await httpClient(mediaUrl, {
              method: "PATCH",
              headers: authHeaders(token),
              body: {
                name: formData.title,
                description: formData.description,
              },
            });
            
            // Actualizar el item localmente manteniendo la URL original de Supabase
            currentItems[editingIndex] = {
              ...existingItem,
              name: formData.title,
              description: formData.description,
              title: formData.title, // Para compatibilidad
              url: existingItem.url, // Mantener la URL original de Supabase
            };
          } catch (e) {
            console.error("Error al actualizar media:", e);
            // Si falla, al menos actualizar localmente
            currentItems[editingIndex] = {
              ...existingItem,
              name: formData.title,
              description: formData.description,
              title: formData.title,
            };
          }
        }
      } else {
        // Agregar nuevo item
        if (!mediaId || !uploadedMedia) {
          alert("Debes subir una imagen para el proyecto");
          setUploading(false);
          return;
        }
        
            // Usar SIEMPRE la URL del media subido desde Supabase
            const mediaUrl = uploadedMedia.url || uploadedMedia.public_url || uploadedMedia.publicURL;
            if (!mediaUrl) {
              console.error("❌ Error: No se recibió URL del media subido");
              console.error("❌ uploadedMedia completo:", JSON.stringify(uploadedMedia, null, 2));
              console.error("❌ uploadedMedia keys:", Object.keys(uploadedMedia));
              alert("Error al subir la imagen. Por favor intenta de nuevo.");
              setUploading(false);
              return;
            }
            
            console.log("✅ Agregando nuevo item con URL:", mediaUrl);
            const newItem = {
              id: mediaId,
              name: formData.title,
              description: formData.description,
              title: formData.title, // Para compatibilidad
              url: mediaUrl, // URL de Supabase - CRÍTICO que esté aquí
              image: mediaUrl, // También en image para compatibilidad
              created_at: uploadedMedia.created_at || new Date().toISOString(),
            };
            console.log("✅ Nuevo item creado:", JSON.stringify(newItem, null, 2));
            currentItems.push(newItem);
      }

      // Actualizar el perfil con los nuevos items
      const itemIds = currentItems.map((item) => item.id).filter(Boolean);
      console.log("💾 Guardando IDs en perfil:", itemIds);
      console.log("💾 currentItems completo:", currentItems.map(item => ({ id: item.id, name: item.name, url: item.url })));
      console.log("💾 itemIds filtrados:", itemIds);
      console.log("💾 itemIds tipo:", typeof itemIds, Array.isArray(itemIds));
      console.log("💾 itemIds length:", itemIds.length);
      
      // Actualizar el perfil según el rol
      let updatedProfileFromPatch = null;
      try {
        if (userRole?.toLowerCase() === "specialist") {
          console.log("=".repeat(60));
          console.log("💾 [PortfolioSection] Actualizando perfil de specialist con work_images_ids:", itemIds);
          console.log("💾 [PortfolioSection] userId:", userId);
          console.log("💾 [PortfolioSection] token disponible:", !!token);
          
          const patchData = {
            work_images_ids: itemIds,
          };
          console.log("💾 [PortfolioSection] Datos del PATCH:", JSON.stringify(patchData, null, 2));
          
          updatedProfileFromPatch = await profilesAPI.patchSpecialistByUser(userId, patchData, token);
          console.log("✅ [PortfolioSection] Perfil de specialist actualizado desde PATCH");
          console.log("✅ [PortfolioSection] updatedProfileFromPatch completo:", JSON.stringify(updatedProfileFromPatch, null, 2));
          console.log("✅ [PortfolioSection] work_images_full desde PATCH:", updatedProfileFromPatch?.work_images_full);
          console.log("✅ [PortfolioSection] work_images_full es array?:", Array.isArray(updatedProfileFromPatch?.work_images_full));
          console.log("✅ [PortfolioSection] work_images_full length:", updatedProfileFromPatch?.work_images_full?.length);
          
          // SIEMPRE usar los items locales con la URL del media subido primero
          // Luego intentar usar work_images_full del PATCH si está disponible
          const itemsToUpdate = currentItems.map(item => ({
            ...item,
            url: item.url || uploadedMedia?.url || null
          })).filter(item => item.url); // Filtrar items sin URL
          
          console.log("✅ [PortfolioSection] Items locales preparados:", itemsToUpdate);
          
          // Si el PATCH devuelve work_images_full válido, usarlo (tiene prioridad)
          if (updatedProfileFromPatch?.work_images_full && Array.isArray(updatedProfileFromPatch.work_images_full) && updatedProfileFromPatch.work_images_full.length > 0) {
            console.log("✅ [PortfolioSection] Usando work_images_full del PATCH response");
            // Guardar en localStorage como respaldo
            try {
              const backupKey = `portfolio_backup_${userId}`;
              localStorage.setItem(backupKey, JSON.stringify({
                work_images_full: updatedProfileFromPatch.work_images_full,
                work_images_ids: updatedProfileFromPatch.work_images_ids || itemIds,
                timestamp: Date.now()
              }));
            } catch (e) {
              console.warn("⚠️ [PortfolioSection] No se pudo guardar en localStorage:", e);
            }
            // Forzar actualización del estado INMEDIATAMENTE
            if (onUpdate) {
              console.log("✅ [PortfolioSection] Llamando onUpdate con work_images_full del PATCH");
              onUpdate(updatedProfileFromPatch.work_images_full);
            }
          } else {
            console.log("⚠️ [PortfolioSection] PATCH no devolvió work_images_full válido, usando items locales");
            // Guardar en localStorage como respaldo
            if (itemsToUpdate.length > 0) {
              try {
                const backupKey = `portfolio_backup_${userId}`;
                localStorage.setItem(backupKey, JSON.stringify({
                  work_images_full: itemsToUpdate,
                  work_images_ids: itemIds,
                  timestamp: Date.now()
                }));
                console.log("✅ [PortfolioSection] Items locales guardados en localStorage como respaldo");
              } catch (e) {
                console.warn("⚠️ [PortfolioSection] No se pudo guardar en localStorage:", e);
              }
            }
            // Usar los items locales con la URL del media subido
            if (onUpdate && itemsToUpdate.length > 0) {
              onUpdate(itemsToUpdate);
            }
          }
          
          handleCloseDialog();
          setUploading(false);
          
          // NO recargar inmediatamente - ya actualizamos el estado arriba
          // Solo recargar después de un delay más largo para sincronizar con el backend
          setTimeout(async () => {
            try {
              console.log("🔄 [PortfolioSection] Recargando desde backend para verificar...");
              const refreshedProfile = await profilesAPI.getSpecialistByUser(userId, token);
              console.log("🔄 [PortfolioSection] Perfil refrescado completo:", JSON.stringify(refreshedProfile, null, 2));
              console.log("🔄 [PortfolioSection] work_images_ids desde backend:", refreshedProfile?.work_images_ids);
              console.log("🔄 [PortfolioSection] work_images_full desde backend:", refreshedProfile?.work_images_full);
              
              if (refreshedProfile?.work_images_full && Array.isArray(refreshedProfile.work_images_full) && refreshedProfile.work_images_full.length > 0) {
                console.log("✅ [PortfolioSection] Datos refrescados desde backend:", refreshedProfile.work_images_full.length, "items");
                // Actualizar localStorage con los datos confirmados del backend
                try {
                  const backupKey = `portfolio_backup_${userId}`;
                  localStorage.setItem(backupKey, JSON.stringify({
                    work_images_full: refreshedProfile.work_images_full,
                    work_images_ids: refreshedProfile.work_images_ids || [],
                    timestamp: Date.now()
                  }));
                  console.log("✅ [PortfolioSection] localStorage actualizado con datos confirmados del backend");
                } catch (e) {
                  console.warn("⚠️ [PortfolioSection] No se pudo actualizar localStorage:", e);
                }
                if (onUpdate) {
                  onUpdate(refreshedProfile.work_images_full);
                }
              } else {
                // Si el backend devuelve vacío pero tenemos items locales, preservarlos
                console.warn("⚠️ [PortfolioSection] Backend devolvió work_images_full vacío");
                console.warn("⚠️ [PortfolioSection] work_images_ids desde backend:", refreshedProfile?.work_images_ids);
                if (currentItems && currentItems.length > 0) {
                  console.log("🔄 [PortfolioSection] Preservando items locales:", currentItems.length, "items");
                  const itemsWithUrls = currentItems.map(item => ({
                    ...item,
                    url: item.url || null
                  })).filter(item => item.url && item.id);
                  if (itemsWithUrls.length > 0 && onUpdate) {
                    console.log("✅ [PortfolioSection] Actualizando con items locales preservados");
                    onUpdate(itemsWithUrls);
                  }
                }
              }
            } catch (e) {
              console.error("❌ [PortfolioSection] Error al refrescar:", e);
              // En caso de error, preservar items locales
              if (currentItems && currentItems.length > 0) {
                console.log("🔄 [PortfolioSection] Error al refrescar, preservando items locales");
                const itemsWithUrls = currentItems.map(item => ({
                  ...item,
                  url: item.url || null
                })).filter(item => item.url && item.id);
                if (itemsWithUrls.length > 0 && onUpdate) {
                  onUpdate(itemsWithUrls);
                }
              }
            }
          }, 1000); // Aumentar delay a 1 segundo para dar más tiempo al backend
          
          return; // Salir después de actualizar
        } else if (userRole?.toLowerCase() === "businessman") {
          // Para businessman también puede tener portafolio
          console.log("💾 [PortfolioSection] Actualizando perfil de businessman con products_and_services_ids:", itemIds);
          updatedProfileFromPatch = await profilesAPI.patchBusinessmanByUser(userId, {
            products_and_services_ids: itemIds,
          }, token);
          console.log("✅ [PortfolioSection] Perfil de businessman actualizado desde PATCH:", updatedProfileFromPatch);
          
          // Si el PATCH devuelve products_and_services_full, usarlo inmediatamente
          if (updatedProfileFromPatch?.products_and_services_full && Array.isArray(updatedProfileFromPatch.products_and_services_full) && updatedProfileFromPatch.products_and_services_full.length > 0) {
            console.log("✅ [PortfolioSection] Usando products_and_services_full del PATCH response inmediatamente");
            onUpdate && onUpdate(updatedProfileFromPatch.products_and_services_full);
            handleCloseDialog();
            setUploading(false);
            return;
          }
        }
        console.log("=".repeat(60));
      } catch (profileError) {
        console.error("❌ [PortfolioSection] Error al actualizar perfil:", profileError);
        alert("Error al guardar el perfil. Por favor intenta de nuevo.");
        setUploading(false);
        return;
      }

      // NO actualizar inmediatamente con items locales, esperar la respuesta del backend
      console.log("🔄 Esperando respuesta del backend antes de actualizar...");
      
      // Recargar los datos completos desde el backend para obtener las URLs actualizadas
      // Esperar un poco para asegurar que el backend haya procesado todo
      setTimeout(async () => {
        try {
          console.log("🔄 Recargando datos del backend después de guardar...");
          if (userRole?.toLowerCase() === "specialist") {
            const updatedProfile = await profilesAPI.getSpecialistByUser(userId, token);
            console.log("📥 Perfil completo desde backend (specialist):", JSON.stringify(updatedProfile, null, 2));
            console.log("📥 work_images_full recibido:", updatedProfile?.work_images_full);
            console.log("📥 work_images_full es array?:", Array.isArray(updatedProfile?.work_images_full));
            console.log("📥 work_images_full length:", updatedProfile?.work_images_full?.length);
            
            if (updatedProfile?.work_images_full && Array.isArray(updatedProfile.work_images_full) && updatedProfile.work_images_full.length > 0) {
              console.log("✅ Actualizando con work_images_full del backend:", updatedProfile.work_images_full.map(item => ({
                id: item.id,
                name: item.name,
                url: item.url,
                description: item.description
              })));
              // Actualizar localStorage con los datos confirmados del backend
              try {
                const backupKey = `portfolio_backup_${userId}`;
                localStorage.setItem(backupKey, JSON.stringify({
                  work_images_full: updatedProfile.work_images_full,
                  work_images_ids: updatedProfile.work_images_ids || [],
                  timestamp: Date.now()
                }));
                console.log("✅ [PortfolioSection] localStorage actualizado con datos confirmados del backend");
              } catch (e) {
                console.warn("⚠️ [PortfolioSection] No se pudo actualizar localStorage:", e);
              }
              onUpdate && onUpdate(updatedProfile.work_images_full);
            } else {
              // Si no hay work_images_full pero tenemos items locales, usar los locales como fallback
              console.warn("⚠️ No se recibieron work_images_full del backend o está vacío");
              console.warn("⚠️ Usando items locales como fallback:", currentItems);
              // Asegurar que los items locales tengan URLs válidas
              const itemsWithUrls = currentItems.map(item => ({
                ...item,
                url: item.url || uploadedMedia?.url || null
              })).filter(item => item.url); // Filtrar items sin URL
              onUpdate && onUpdate(itemsWithUrls);
            }
          } else if (userRole?.toLowerCase() === "businessman") {
            const updatedProfile = await profilesAPI.getBusinessmanByUser(userId, token);
            console.log("📥 Perfil completo desde backend (businessman):", JSON.stringify(updatedProfile, null, 2));
            // Para businessman, puede tener tanto work_images_full como products_and_services_full
            if (updatedProfile?.work_images_full && Array.isArray(updatedProfile.work_images_full) && updatedProfile.work_images_full.length > 0) {
              console.log("✅ Actualizando con work_images_full (businessman):", updatedProfile.work_images_full);
              onUpdate && onUpdate(updatedProfile.work_images_full);
            } else if (updatedProfile?.products_and_services_full && Array.isArray(updatedProfile.products_and_services_full) && updatedProfile.products_and_services_full.length > 0) {
              console.log("✅ Actualizando con products_and_services_full (businessman):", updatedProfile.products_and_services_full);
              onUpdate && onUpdate(updatedProfile.products_and_services_full);
            } else {
              console.warn("⚠️ No se recibieron datos del backend, usando items locales");
              const itemsWithUrls = currentItems.map(item => ({
                ...item,
                url: item.url || uploadedMedia?.url || null
              })).filter(item => item.url);
              onUpdate && onUpdate(itemsWithUrls);
            }
          }
        } catch (e) {
          console.error("❌ Error al recargar datos del backend:", e);
          console.error("❌ Error details:", {
            message: e.message,
            status: e.status,
            body: e.body
          });
          // En caso de error, usar los items locales con la URL del media subido
          console.log("🔄 Usando items locales debido a error:", currentItems);
          const itemsWithUrls = currentItems.map(item => ({
            ...item,
            url: item.url || uploadedMedia?.url || null
          })).filter(item => item.url);
          onUpdate && onUpdate(itemsWithUrls);
        }
      }, 1000); // Reducir a 1 segundo para respuesta más rápida
      
      handleCloseDialog();
    } catch (error) {
      console.error("Error al guardar item del portafolio:", error);
      alert("Error al guardar el proyecto");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (index) => {
    if (!window.confirm("¿Estás seguro de eliminar este proyecto?")) return;

    try {
      const token = normalizeStoredToken(localStorage.getItem("token"));
      const updatedItems = portfolio.filter((_, i) => i !== index);
      const itemIds = updatedItems.map((item) => item.id).filter(Boolean);

      console.log("🗑️ [PortfolioSection] Eliminando item en índice:", index);
      console.log("🗑️ [PortfolioSection] Items actualizados:", updatedItems.length);
      console.log("🗑️ [PortfolioSection] IDs actualizados:", itemIds);

      if (userRole?.toLowerCase() === "specialist") {
        const updatedProfile = await profilesAPI.patchSpecialistByUser(userId, {
          work_images_ids: itemIds,
        }, token);
        
        // Actualizar localStorage con los nuevos datos
        try {
          const backupKey = `portfolio_backup_${userId}`;
          const backupData = {
            work_images_full: updatedProfile?.work_images_full || updatedItems,
            work_images_ids: updatedProfile?.work_images_ids || itemIds,
            timestamp: Date.now()
          };
          localStorage.setItem(backupKey, JSON.stringify(backupData));
          console.log("✅ [PortfolioSection] localStorage actualizado después de eliminar");
        } catch (e) {
          console.warn("⚠️ [PortfolioSection] No se pudo actualizar localStorage:", e);
        }
        
        // Si el backend devuelve work_images_full, usarlo
        if (updatedProfile?.work_images_full && Array.isArray(updatedProfile.work_images_full) && updatedProfile.work_images_full.length > 0) {
          console.log("✅ [PortfolioSection] Usando work_images_full del backend después de eliminar");
          onUpdate && onUpdate(updatedProfile.work_images_full);
        } else {
          console.log("⚠️ [PortfolioSection] Backend no devolvió work_images_full, usando items locales");
          onUpdate && onUpdate(updatedItems);
        }
      } else {
        onUpdate && onUpdate(updatedItems);
      }
    } catch (error) {
      console.error("❌ [PortfolioSection] Error al eliminar item del portafolio:", error);
      alert("Error al eliminar el proyecto");
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        bgcolor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "#103E68",
            fontSize: "0.95rem",
            mb: 1.5,
          }}
        >
          Portafolio
        </Typography>
      </Box>

      {/* Debug info - siempre visible para debugging */}
      <Box sx={{ mb: 1, p: 1, bgcolor: '#fff3cd', borderRadius: 1, fontSize: '0.7rem' }}>
        <div><strong>Debug:</strong> Editing: {editing ? 'Sí' : 'No'} | Portfolio length: {portfolio?.length || 0} | Is Array: {Array.isArray(portfolio) ? 'Sí' : 'No'} | Is Own Profile: {isOwnProfile ? 'Sí' : 'No'}</div>
      </Box>

      <Grid container spacing={1.5}>
        {/* Botón de agregar SIEMPRE visible si es mi perfil */}
        {isOwnProfile && (
          <Grid item xs={6} sm={5} md={3} lg={3} sx={{ display: "flex" }}>
            <AddProductCard onClick={() => {
              handleOpenDialog();
            }} />
          </Grid>
        )}
        
        {/* Mostrar proyectos */}
        {portfolio && Array.isArray(portfolio) && portfolio.length > 0 && portfolio.map((item, index) => {
          // Validar que el item tenga datos mínimos
          if (!item || (!item.id && !item.url && !item.image)) {
            console.warn(`[PortfolioSection] Item ${index} inválido, omitiendo:`, item);
            return null;
          }
          
          // Normalizar el item para asegurar que tenga los campos necesarios
          const normalizedItem = {
            id: item.id,
            name: item.name || item.title || '',
            description: item.description || '',
            url: item.url || item.image || null,
            image: item.image || item.url || null,
            created_at: item.created_at || null,
            ...item // Preservar otros campos
          };
          
          console.log(`[PortfolioSection] Renderizando item ${index}:`, {
            id: normalizedItem.id,
            name: normalizedItem.name,
            url: normalizedItem.url,
            hasUrl: !!normalizedItem.url
          });
          
          return (
            <Grid item xs={6} sm={4} md={2.4} lg={2} key={normalizedItem.id || normalizedItem.url || `portfolio-${index}`} sx={{ display: "flex" }}>
              <PortfolioCard
                item={normalizedItem}
                editing={editing}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
                index={index}
              />
            </Grid>
          );
        }).filter(Boolean)}
        
        {/* Mostrar mensaje vacío solo si no es el propio perfil y no hay proyectos */}
        {(!portfolio || !Array.isArray(portfolio) || portfolio.length === 0) && !isOwnProfile && (
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                px: 2,
                borderRadius: 1.5,
                bgcolor: "#f8f9fa",
                border: "2px dashed #dee2e6",
              }}
            >
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, fontSize: "0.75rem" }}>
                No hay proyectos aún.
              </Typography>
            </Box>
          </Grid>
        )}
        
        {/* Si está vacío y es mi perfil, mostrar mensaje después del botón */}
        {(!portfolio || !Array.isArray(portfolio) || portfolio.length === 0) && isOwnProfile && (
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: "center",
                py: 2,
                px: 2,
                borderRadius: 1.5,
                bgcolor: "#f8f9fa",
                border: "1px dashed #e0e0e0",
                mt: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, fontSize: "0.75rem" }}>
                Haz clic en "Agregar" para empezar a construir tu portafolio.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          }
        }}
      >
        <Box sx={{ background: 'linear-gradient(90deg, rgba(24,119,242,0.12), rgba(16,142,137,0.06))', p: 1.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f1724', fontSize: "0.95rem" }}>
              {editingIndex !== null ? "Editar Proyecto" : "Agregar Proyecto"}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small" sx={{ color: '#6b7280' }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <DialogContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Image Upload Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 600, color: '#374151', fontSize: "0.75rem" }}>
                Foto o Video
              </Typography>
              <input
                accept="image/*,video/*"
                style={{ display: "none" }}
                id="portfolio-image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <Box
                onClick={() => document.getElementById('portfolio-image-upload')?.click()}
                sx={{
                  borderRadius: 2,
                  border: '1px dashed rgba(16,24,40,0.12)',
                  overflow: 'hidden',
                  bgcolor: '#fbfdff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'rgba(16,142,137,0.4)',
                    bgcolor: '#f0fdfa',
                  }
                }}
              >
                {!formData.imagePreview ? (
                  <Box sx={{ 
                    width: '100%', 
                    height: 150, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 0.5
                  }}>
                    <AddAPhotoIcon sx={{ fontSize: 28, color: '#6b7280' }} />
                    <Typography sx={{ color: '#6b7280', fontWeight: 600, fontSize: "0.75rem" }}>
                      Haz clic para agregar foto o video
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: "0.65rem" }}>
                      JPG, PNG o MP4
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ position: 'relative' }}>
                    {formData.imagePreview.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video
                        src={formData.imagePreview}
                        controls
                        style={{
                          width: "100%",
                          maxHeight: "200px",
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                    ) : (
                      <img
                        src={formData.imagePreview}
                        alt="Preview"
                        style={{
                          width: "100%",
                          maxHeight: "200px",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        bgcolor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        px: 1,
                        py: 0.25,
                        borderRadius: 0.5,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    >
                      Cambiar
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Title Field */}
            <TextField
              fullWidth
              size="small"
              label="Título del proyecto *"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Ej: Cirugía de esterilización canina"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            />

            {/* Description Field */}
            <TextField
              fullWidth
              size="small"
              label="Descripción *"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              required
              placeholder="Describe tu proyecto, servicio o trabajo realizado..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            />

            {/* Date Info */}
            {editingIndex === null && (
              <Box sx={{ 
                bgcolor: '#f0f9ff', 
                border: '1px solid #bae6fd', 
                borderRadius: 1.5, 
                p: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 500, fontSize: "0.7rem" }}>
                  📅 Fecha: {new Date().toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, gap: 1.5 }}>
          <Button 
            onClick={handleCloseDialog}
            size="small"
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              px: 2,
              fontSize: "0.75rem",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="small"
            disabled={uploading || !formData.title.trim() || !formData.description.trim() || !formData.imagePreview}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              fontSize: "0.75rem",
              bgcolor: '#00c6a7',
              '&:hover': {
                bgcolor: '#00b598',
              },
              boxShadow: '0 2px 8px rgba(0, 198, 167, 0.25)',
            }}
          >
            {uploading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CircularProgress size={14} sx={{ color: 'white' }} />
                Guardando...
              </Box>
            ) : (
              editingIndex !== null ? "Actualizar" : "Agregar"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PortfolioSection;

