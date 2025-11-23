import React, { useEffect, useState } from "react";
import { Box, Paper, CircularProgress, Alert } from "@mui/material";
import { getProfile, authAPI, profilesAPI } from "../../../services/endpoints";
import { normalizeStoredToken } from "../chat/chatUtils";
import { useLocation } from "react-router-dom";
import PerfilHeader from "./PerfilHeader";
import PerfilForm from "./PerfilForm";
import PerfilPortfolio from "./PerfilPortfolio";
import PerfilContactHistory from "./PerfilContactHistory";
import authClient from "../../../services/authClient";

const Perfil = () => {
  console.log('🚀🚀🚀 [Perfil] 🎬 Componente Perfil RENDERIZADO 🚀🚀🚀');
  console.log('🚀🚀🚀 [Perfil] Stack trace:', new Error().stack);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const location = useLocation();
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  
  console.log('[Perfil] 🎬 Estado actual:', {
    user: user ? { id: user.id, role: user.role, hasSpecialistProfile: !!user.specialist_profile } : null,
    loading,
    error,
    location: location.pathname + location.search
  });

  useEffect(() => {
    console.log('🚀🚀🚀 [Perfil] 🔄 useEffect EJECUTADO 🚀🚀🚀');
    console.log('[Perfil] 🔄 location.pathname:', location.pathname);
    console.log('[Perfil] 🔄 location.search:', location.search);
    console.log('[Perfil] 🔄 window.location.href:', window.location.href);
    console.log('[Perfil] 🔄 Date.now():', Date.now());
    
    const fetchProfile = async () => {
      console.log('[Perfil] 📥 fetchProfile INICIADO');
      setLoading(true);
      try {
        const token = normalizeStoredToken(localStorage.getItem("token"));
        console.log('[Perfil] 🔑 Token obtenido:', !!token);
        // Comprobar si se pasó userId por query param para ver un perfil (visita)
        const params = new URLSearchParams(location.search);
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
        
        // SIEMPRE obtener el perfil de especialista desde Profiles Service si el usuario es especialista
        // Esto asegura que tenemos los datos más actualizados, incluso si Auth Service devuelve datos antiguos
        const userRole = (res.role || '').toString().toLowerCase();
        console.log('[Perfil] 🔍 Verificando role del usuario:', userRole, 'res.role original:', res.role);
        
        if (userRole === "specialist") {
          console.log('[Perfil] ⚠️ Usuario es especialista, obteniendo perfil desde Profiles Service...');
          console.log('[Perfil] User ID:', res.id, 'tipo:', typeof res.id);
          console.log('[Perfil] Token disponible:', !!token, 'token:', token ? token.substring(0, 20) + '...' : 'null');
          console.log('[Perfil] specialist_profile actual (si existe):', res.specialist_profile);
          
          // FORZAR la obtención del perfil, incluso si ya existe uno
          try {
            console.log('[Perfil] 📞 Llamando a profilesAPI.getSpecialistByUser con user_id:', res.id);
            console.log('[Perfil] 📞 URL que se construirá:', `http://127.0.0.1:8003/api/profiles/specialists/${res.id}/`);
            
            const specialistProfile = await profilesAPI.getSpecialistByUser(res.id, token);
            
            console.log('[Perfil] ✅ Perfil de especialista obtenido desde Profiles Service:', JSON.stringify(specialistProfile, null, 2));
            console.log('[Perfil] ✅ Tipo de specialistProfile:', typeof specialistProfile);
            console.log('[Perfil] ✅ Es null?', specialistProfile === null);
            console.log('[Perfil] ✅ Es undefined?', specialistProfile === undefined);
            console.log('[Perfil] ✅ Tiene keys?', specialistProfile ? Object.keys(specialistProfile) : 'N/A');
            
            if (specialistProfile) {
              // SOBRESCRIBIR el specialist_profile con los datos del Profiles Service
              res.specialist_profile = specialistProfile;
              console.log('[Perfil] ✅ Perfil de especialista asignado. res.specialist_profile ahora es:', JSON.stringify(res.specialist_profile, null, 2));
              console.log('[Perfil] ✅ profession después de asignar:', res.specialist_profile?.profession);
              console.log('[Perfil] ✅ experience_years después de asignar:', res.specialist_profile?.experience_years);
              console.log('[Perfil] ✅ about_us después de asignar:', res.specialist_profile?.about_us);
            } else {
              console.warn('[Perfil] ⚠️ getSpecialistByUser devolvió null/undefined');
            }
          } catch (e) {
            console.error("❌ [Perfil] Error al cargar el perfil de especialista:", e);
            console.error("❌ [Perfil] Error details:", {
              message: e.message,
              status: e.status,
              body: e.body,
              stack: e.stack,
              name: e.name
            });
            // Continuar sin el perfil de especialista si falla, pero mostrar un warning
            console.warn('[Perfil] ⚠️ Continuando sin perfil de especialista actualizado');
          }
        } else {
          console.log('[Perfil] Usuario no es especialista, role:', res.role, 'userRole:', userRole);
        }
        
        console.log('[Perfil] 📋 Datos finales antes de setUser:', JSON.stringify(res, null, 2));
        console.log('[Perfil] 📋 specialist_profile final:', JSON.stringify(res.specialist_profile, null, 2));
        console.log('[Perfil] 📋 profession final:', res.specialist_profile?.profession);
        console.log('[Perfil] 📋 experience_years final:', res.specialist_profile?.experience_years);
        console.log('[Perfil] 📋 about_us final:', res.specialist_profile?.about_us);
        
        setUser(res);
        setForm(res);
        console.log('[Perfil] ✅ Estado actualizado con setUser y setForm');
      } catch (err) {
        console.error('[Perfil] ❌ Error en fetchProfile:', err);
        console.error('[Perfil] ❌ Error stack:', err.stack);
        setError("No se pudo cargar el perfil");
      } finally {
        setLoading(false);
        console.log('[Perfil] ✅ fetchProfile completado, loading=false');
      }
    };
    console.log('[Perfil] 🔄 useEffect ejecutado, location:', location.pathname, location.search);
    fetchProfile();
  }, [location.pathname, location.search]); // Recargar cuando cambia la ruta o los query params

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setUser(form);
    setEditing(false);
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  if (!user) {
    console.log('[Perfil] ⚠️ No hay usuario, retornando null');
    return null;
  }

  console.log('[Perfil] 🎨 Renderizando componente con user:', {
    id: user.id,
    role: user.role,
    specialist_profile: user.specialist_profile ? {
      profession: user.specialist_profile.profession,
      experience_years: user.specialist_profile.experience_years,
      about_us: user.specialist_profile.about_us,
      can_give_consultations: user.specialist_profile.can_give_consultations
    } : null
  });

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",

        bgcolor: "#f0f2f5",
        p: 1,
      }}
    >
      <Paper
        elevation={5}
        sx={{
          width: "100%",
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <PerfilHeader
          user={user}
          editing={editing}
          setEditing={setEditing}
          form={form}
          isOwnProfile={isOwnProfile}
        />
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            bgcolor: "#f9f9f9",
          }}
        >
          <PerfilForm
            editing={editing}
            form={user}
            onChange={handleChange}
            onSave={handleSave}
          />
          {/* Mostrar portafolio para especialistas/empresarios; para consumer mostrar historial de contacto */}
          {(user.role || "").toString().toLowerCase() === "consumer" ? (
            <PerfilContactHistory contactHistory={user.contact_history || []} />
          ) : (
            <PerfilPortfolio
              editing={editing}
              portfolio={user.portfolio || []}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Perfil;
