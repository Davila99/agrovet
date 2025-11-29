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
  const [editing, setEditing] = useState(false);
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
            const businessmanProfile = await profilesAPI.getBusinessmanByUser(res.id, token);
            if (businessmanProfile) {
              res.businessman_profile = businessmanProfile;
              res.products_and_services_full = businessmanProfile.products_and_services_full || [];
            }
          } catch (e) {
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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = normalizeStoredToken(localStorage.getItem("token"));
      // Si es businessman y tiene coordenadas, actualizar también la ubicación
      if ((form.role || "").toString().toLowerCase() === "businessman" && (form.latitude || form.longitude)) {
        await authAPIEndpoint.updateUser(user.id, {
          latitude: form.latitude || null,
          longitude: form.longitude || null,
        }, token);
      }
      setUser(form);
      setEditing(false);
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      alert("Error al guardar los cambios");
    }
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
            editing={editing}
            setEditing={setEditing}
            form={form}
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
              editing={editing && isOwnProfile}
              form={user}
              onChange={handleChange}
              onSave={handleSave}
            />
          </Box>

          {/* Columna derecha - Documentos de verificación, Portafolio, Catálogo o Historial */}
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
                    <ProductCatalog
                      editing={isOwnProfile}
                      products={user.products_and_services_full || user.businessman_profile?.products_and_services_full || []}
                      userRole={user.role}
                      userId={user.id}
                      isOwnProfile={isOwnProfile}
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
