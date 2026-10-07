import React from "react";
import { Box, Paper, CircularProgress, Alert, Typography, Button } from "@mui/material";
import { useLocation } from "react-router-dom";
import PerfilHeader from "./PerfilHeader";
import PerfilForm from "./PerfilForm";
import PerfilPortfolio from "./PerfilPortfolio";
import PerfilContactHistory from "./PerfilContactHistory";
import PortfolioSection from "./organisms/PortfolioSection";
import ProductCatalog from "./organisms/ProductCatalog";
import VerificationDocumentsSection from "./organisms/VerificationDocumentsSection";
import { useProfileData } from "./hooks/useProfileData";

const Perfil = () => {
  const {
    user, setUser,
    loading, setLoading,
    error, setError,
    form, setForm,
    isOwnProfile,
    handleChange,
    handleSave
  } = useProfileData();

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
