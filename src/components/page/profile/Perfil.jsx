import React, { useEffect, useState, useRef } from "react";
import { Box, Paper, CircularProgress, Alert, Typography, Button } from "@mui/material";
import { getProfile, authAPI, profilesAPI } from "../../../services/endpoints";
import { authAPI as authAPIEndpoint } from "../../../services/endpoints/auth";
import { normalizeStoredToken } from "../chat/chatUtils";
import { useLocation } from "react-router-dom";
import PerfilHeader from "./PerfilHeader";
import PerfilForm from "./PerfilForm";
import PerfilPortfolio from "./PerfilPortfolio";
import PerfilContactHistory from "./PerfilContactHistory";
import PortfolioSection from "./organisms/PortfolioSection";
import ProductCatalog from "./organisms/ProductCatalog";
import VerificationDocumentsSection from "./organisms/VerificationDocumentsSection";
import authClient from "../../../services/authClient";

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({});
  const location = useLocation();
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const fetchInProgressRef = useRef(false);

  // Memoizar los valores de location para evitar re-renders innecesarios
  const pathname = location.pathname;
  const search = location.search;

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;
    let debounceTimer = null;

    const fetchProfile = async () => {
      // Prevenir múltiples ejecuciones - verificar ANTES de establecer el flag
      if (fetchInProgressRef.current) {
        return;
      }

      fetchInProgressRef.current = true;

      if (!isMounted) {
        fetchInProgressRef.current = false;
        return;
      }

      setLoading(true);
      setError("");

      // Timeout de seguridad: si tarda más de 30 segundos, mostrar error
      timeoutId = setTimeout(() => {
        if (isMounted) {
          setError("La carga del perfil está tardando demasiado. Por favor recarga la página.");
          setLoading(false);
          fetchInProgressRef.current = false;
        }
      }, 30000);

      try {
        const token = normalizeStoredToken(localStorage.getItem("token"));

        if (!token) {
          throw new Error("No se encontró el token de autenticación. Por favor inicia sesión.");
        }
        // Comprobar si se pasó userId por query param para ver un perfil (visita)
        const params = new URLSearchParams(search);
        const requestedId = params.get("userId");

        let res;
        if (requestedId) {
          // Cargar perfil por id (visita). No asumir que es el propio.
          setIsOwnProfile(
            String(requestedId) === String(localStorage.getItem("userId"))
          );
          try {
            res = await authAPI.userById(requestedId, token);
          } catch (e) {
            // si falla, intentar usar getProfile como fallback
            res = await getProfile(token);
          }
        } else {
          const userId = localStorage.getItem("userId");
          if (!userId) throw new Error("No se encontró el ID del usuario");
          res = await getProfile(token);
          setIsOwnProfile(true);
        }

        // Obtener perfil específico según el rol
        const userRole = (res.role || '').toString().toLowerCase();
        console.log('[Perfil] 🟢 Usuario cargado:', {
          userId: res.id,
          role: userRole,
          rawRole: res.role,
        });

        if (userRole === "specialist") {
          try {
            // Si ya viene specialist_profile del Auth Service, verificar si tiene profession
            const existingProfile = res.specialist_profile || {};
            console.log('[Perfil] 🔍 Perfil existente del Auth Service:', {
              userId: res.id,
              hasExistingProfile: !!res.specialist_profile,
              existingProfession: existingProfile.profession,
            });

            // Cargar perfil completo desde Profiles Service
            const specialistProfile = await profilesAPI.getSpecialistByUser(res.id, token);
            console.log('[Perfil] 🔍 Perfil de especialista cargado desde Profiles Service:', {
              userId: res.id,
              hasProfile: !!specialistProfile,
              profession: specialistProfile?.profession,
              fullProfile: specialistProfile,
            });
            if (specialistProfile) {
              // Combinar datos existentes con el perfil completo
              res.specialist_profile = {
                ...existingProfile,
                ...specialistProfile,
                // Asegurar que profession esté presente
                profession: specialistProfile.profession || existingProfile.profession || '',
              };
              console.log('[Perfil] ✅ Perfil combinado:', {
                profession: res.specialist_profile.profession,
              });
              let workImagesFull = specialistProfile.work_images_full || [];

              // Intentar cargar desde localStorage si está vacío
              if (workImagesFull.length === 0 && specialistProfile.work_images_ids?.length > 0) {
                try {
                  const backupKey = `portfolio_backup_${res.id}`;
                  const backupData = localStorage.getItem(backupKey);
                  if (backupData) {
                    const backup = JSON.parse(backupData);
                    const backupIds = backup.work_images_ids || [];
                    const currentIds = specialistProfile.work_images_ids || [];
                    const idsMatch = backupIds.length === currentIds.length &&
                      backupIds.every((id, idx) => id === currentIds[idx]);

                    if (idsMatch && backup.work_images_full?.length > 0) {
                      workImagesFull = backup.work_images_full;
                      specialistProfile.work_images_full = workImagesFull;
                    }
                  }
                } catch (e) {
                  // Ignorar errores de localStorage
                }
              }

              res.work_images_full = workImagesFull;
            }
          } catch (e) {
            // Continuar sin el perfil de especialista si falla
          }
        } else if (userRole === "businessman") {
          try {
            console.log('[Perfil] 🔵 Cargando perfil de businessman para userId:', res.id);
            const businessmanProfile = await profilesAPI.getBusinessmanByUser(res.id, token);
            console.log('[Perfil] 🟢 Respuesta businessman profile:', {
              hasProfile: !!businessmanProfile,
              products_ids: businessmanProfile?.products_and_services_ids,
              products_full_length: businessmanProfile?.products_and_services_full?.length,
              products_full: businessmanProfile?.products_and_services_full,
            });
            
            if (businessmanProfile) {
              res.businessman_profile = businessmanProfile;
              let productsFull = businessmanProfile.products_and_services_full || [];
              
              // Si products_and_services_full está vacío pero hay IDs, intentar recuperar de localStorage
              const productIds = businessmanProfile.products_and_services_ids || [];
              if (productsFull.length === 0 && productIds.length > 0) {
                console.warn('[Perfil] ⚠️ products_and_services_full vacío pero hay IDs:', productIds);
                try {
                  const backupKey = `products_backup_${res.id}`;
                  const backupData = localStorage.getItem(backupKey);
                  console.log('[Perfil] 🔍 Buscando backup en localStorage:', backupKey, '- existe:', !!backupData);
                  if (backupData) {
                    const backup = JSON.parse(backupData);
                    const backupIds = backup.products_and_services_ids || [];
                    // Verificar que los IDs coincidan
                    const idsMatch = backupIds.length === productIds.length &&
                      backupIds.every((id, idx) => String(id) === String(productIds[idx]));
                    
                    console.log('[Perfil] 🔍 Backup IDs match:', idsMatch, 'backupIds:', backupIds, 'productIds:', productIds);
                    
                    if (idsMatch && backup.products_and_services_full?.length > 0) {
                      productsFull = backup.products_and_services_full;
                      console.log('[Perfil] ✅ Productos recuperados de localStorage:', productsFull.length);
                    } else if (backup.products_and_services_full?.length > 0) {
                      // Usar backup aunque los IDs no coincidan exactamente
                      productsFull = backup.products_and_services_full;
                      console.log('[Perfil] ⚠️ Usando backup aunque IDs no coinciden:', productsFull.length);
                    }
                  }
                } catch (backupError) {
                  console.warn('[Perfil] Error recuperando backup:', backupError);
                }
              }
              
              // Si aún no hay productos, intentar cargar de localStorage sin verificar IDs
              if (productsFull.length === 0) {
                try {
                  const backupKey = `products_backup_${res.id}`;
                  const backupData = localStorage.getItem(backupKey);
                  if (backupData) {
                    const backup = JSON.parse(backupData);
                    if (backup.products_and_services_full?.length > 0) {
                      productsFull = backup.products_and_services_full;
                      console.log('[Perfil] 🔄 Usando backup como último recurso:', productsFull.length);
                    }
                  }
                } catch (e) {
                  // Ignorar
                }
              }
              
              res.products_and_services_full = productsFull;
            }
          } catch (e) {
            console.error('[Perfil] ❌ Error cargando businessman profile:', e);
            // Continuar sin el perfil de businessman si falla
          }
        }

        if (!isMounted) {
          if (timeoutId) clearTimeout(timeoutId);
          return;
        }

        if (!res || !res.id) {
          throw new Error("No se recibieron datos válidos del usuario");
        }

        console.log('[Perfil] ✅ Datos finales del usuario:', {
          id: res.id,
          role: res.role,
          hasSpecialistProfile: !!res.specialist_profile,
          hasBusinessmanProfile: !!res.businessman_profile,
          work_images_full: res.work_images_full?.length,
          products_and_services_full: res.products_and_services_full?.length,
          specialist_work_images_full: res.specialist_profile?.work_images_full?.length,
          businessman_products: res.businessman_profile?.products_and_services_full?.length,
        });

        setUser(res);
        setForm(res);
      } catch (err) {
        if (isMounted) {
          const errorMessage = err.message || err.body?.detail || err.body?.error || "No se pudo cargar el perfil";
          setError(errorMessage);
          setLoading(false);
        }
      } finally {
        fetchInProgressRef.current = false;
        if (timeoutId) clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Debounce para prevenir múltiples ejecuciones rápidas
    debounceTimer = setTimeout(() => {
      fetchProfile();
    }, 150);

    return () => {
      isMounted = false;
      if (debounceTimer) clearTimeout(debounceTimer);
      if (timeoutId) clearTimeout(timeoutId);
      fetchInProgressRef.current = false;
    };
  }, [pathname, search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Manejar propiedades anidadas como "businessman_profile.field_name"
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Guardar información personal (bio, teléfono, ubicación)
  const handleSavePersonal = async () => {
    try {
      const token = normalizeStoredToken(localStorage.getItem("token"));
      
      const updateData = {
        bio: form.bio,
        phone_number: form.phone_number,
      };
      
      // Si es businessman y tiene coordenadas, incluirlas
      if ((form.role || "").toString().toLowerCase() === "businessman") {
        if (form.latitude) updateData.latitude = form.latitude;
        if (form.longitude) updateData.longitude = form.longitude;
      }
      
      await authAPIEndpoint.updateUser(user.id, updateData, token);
      setUser(form);
    } catch (error) {
      console.error("Error al guardar información personal:", error);
      alert("Error al guardar los cambios personales");
    }
  };

  // Guardar información del negocio (solo para businessman)
  const handleSaveBusiness = async () => {
    try {
      const token = normalizeStoredToken(localStorage.getItem("token"));
      
      // Solo guardar si hay un perfil de businessman con campos requeridos
      if (form.businessman_profile && 
          form.businessman_profile.business_name && 
          form.businessman_profile.descriptions) {
        
        const businessData = {
          business_name: form.businessman_profile.business_name,
          descriptions: form.businessman_profile.descriptions,
        };
        
        // Agregar campos opcionales si existen
        if (form.businessman_profile.user_display) {
          businessData.user_display = form.businessman_profile.user_display;
        }
        if (form.businessman_profile.business_type) {
          businessData.business_type = form.businessman_profile.business_type;
        }
        if (form.businessman_profile.offers_local_products !== undefined) {
          businessData.offers_local_products = form.businessman_profile.offers_local_products;
        }
        
        console.log('[Perfil] Guardando datos del negocio:', businessData);
        await profilesAPI.patchBusinessmanByUser(user.id, businessData, token);
        setUser(form);
      } else {
        console.log('[Perfil] No hay datos suficientes del negocio para guardar');
      }
    } catch (error) {
      console.error("Error al guardar información del negocio:", error);
      alert("Error al guardar los cambios del negocio: " + (error.message || "Error desconocido"));
    }
  };

  // Handler que decide qué guardar según la sección
  const handleSave = async (section = 'personal') => {
    console.log('[Perfil] handleSave llamado con sección:', section);
    
    if (section === 'personal') {
      await handleSavePersonal();
    } else if (section === 'business') {
      await handleSaveBusiness();
    }
    // Ya no hay opción 'all' - cada sección se guarda independientemente
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Cargando perfil...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        gap={2}
        px={2}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => {
            setError("");
            setLoading(true);
            window.location.reload();
          }}
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  if (!user || !user.id) {
    if (loading) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
          gap={2}
        >
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Cargando perfil...
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Alert severity="warning">No se pudo cargar la información del usuario</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f0f2f5",
        py: { xs: 2, sm: 3 },
        px: { xs: 1, sm: 2 },
      }}
    >
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
        }}
      >
        {/* Header Card */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            mb: 3,
            bgcolor: "white",
          }}
        >
          <PerfilHeader
            user={user}
            isOwnProfile={isOwnProfile}
          />
        </Paper>

        {/* Content Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "400px 1fr" },
            gap: 3,
          }}
        >
          {/* Columna izquierda - Información personal y profesional */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <PerfilForm
              form={form}
              onChange={handleChange}
              onSave={handleSave}
              isOwnProfile={isOwnProfile}
            />
          </Box>

          {/* Columna derecha - Documentos de verificación, Servicios, Catálogo o Historial */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Sección de documentos de verificación solo para especialistas - ARRIBA del portafolio */}
            {(user.role || "").toString().toLowerCase() === "specialist" && isOwnProfile && (
              <VerificationDocumentsSection
                specialistProfile={user.specialist_profile || {}}
                userId={user.id}
                isOwnProfile={isOwnProfile}
                onUpdate={(updatedProfile) => {
                  setUser((prev) => {
                    const updated = {
                      ...prev,
                      specialist_profile: {
                        ...prev.specialist_profile,
                        ...updatedProfile,
                      },
                    };
                    return updated;
                  });
                }}
              />
            )}

            {(user.role || "").toString().toLowerCase() === "consumer" ? (
              <PerfilContactHistory contactHistory={user.contact_history || []} />
            ) : (
              <>
                {(user.role || "").toString().toLowerCase() === "specialist" && (() => {
                  // Priorizar work_images_full del perfil del especialista, luego del usuario directamente
                  const portfolioData = user.specialist_profile?.work_images_full || user.work_images_full || [];
                  return (
                    <PortfolioSection
                      editing={isOwnProfile} // SIEMPRE editable si es mi perfil, sin importar el modo edición general
                      portfolio={portfolioData}
                      userRole={user.role}
                      userId={user.id}
                      isOwnProfile={isOwnProfile}
                      onUpdate={(updatedPortfolio) => {
                        setUser((prev) => {
                          const updated = {
                            ...prev,
                            work_images_full: updatedPortfolio,
                          };
                          if (prev.specialist_profile) {
                            updated.specialist_profile = {
                              ...prev.specialist_profile,
                              work_images_full: updatedPortfolio,
                            };
                          } else {
                            // Si no existe specialist_profile, crearlo con el portfolio
                            updated.specialist_profile = {
                              work_images_full: updatedPortfolio,
                            };
                          }
                          return updated;
                        });
                      }}
                    />
                  );
                })()}
                {(user.role || "").toString().toLowerCase() === "businessman" && (
                  <>
                    {/* Sección de Servicios para businessman */}
                    <PortfolioSection
                      editing={isOwnProfile}
                      portfolio={user.work_images_full || []}
                      userRole={user.role}
                      userId={user.id}
                      isOwnProfile={isOwnProfile}
                      onUpdate={(updatedPortfolio) => {
                        setUser((prev) => ({
                          ...prev,
                          work_images_full: updatedPortfolio,
                        }));
                      }}
                    />
                    {/* ProductCatalog para productos del negocio */}
                    <ProductCatalog
                      editing={isOwnProfile}
                      products={user.products_and_services_full || user.businessman_profile?.products_and_services_full || []}
                      userRole={user.role}
                      userId={user.id}
                      isOwnProfile={isOwnProfile}
                      userLocation={{
                        latitude: user.latitude || user.businessman_profile?.latitude,
                        longitude: user.longitude || user.businessman_profile?.longitude,
                        location_name: user.location_description || user.businessman_profile?.business_name || "",
                      }}
                      onUpdate={(updatedProducts) => {
                        setUser((prev) => ({
                          ...prev,
                          products_and_services_full: updatedProducts,
                          businessman_profile: {
                            ...prev.businessman_profile,
                            products_and_services_full: updatedProducts,
                          },
                        }));
                      }}
                    />
                  </>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Perfil;
