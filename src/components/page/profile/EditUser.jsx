import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { authAPI, profilesAPI } from "../../../services/endpoints";
import mediaAPI from "../../../services/endpoints/media";
import authClient from "../../../services/authClient";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = authClient.getAccessToken();
        const data = await authAPI.userById(id, token);
        setUser(data);
      } catch (e) {
        setError("No se pudo cargar el usuario");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // soportar campos anidados como specialist_profile.user_display
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setUser((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]:
            type === "checkbox"
              ? checked
              : type === "number"
              ? value === ""
                ? ""
                : Number(value)
              : value,
        },
      }));
    } else {
      setUser((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
            ? value === ""
              ? ""
              : Number(value)
            : value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setProfileFile(f);
      // preview opcional
      try {
        const url = URL.createObjectURL(f);
        setUser((prev) => ({ ...prev, profile_picture: url }));
      } catch (err) {}
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = authClient.getAccessToken();
      if (profileFile) {
        // First upload the image to media service using field name 'image'
        const mediaFd = new FormData();
        mediaFd.append('image', profileFile);
        const uploaded = await mediaAPI.uploadMedia(mediaFd, token);

        // Build JSON payload for user update (no multipart)
        const payload = {};
        [
          "full_name",
          "last_name",
          "user_display",
          "email",
          "phone_number",
          "role",
          "bio",
          "latitude",
          "longitude",
        ].forEach((k) => {
          if (user[k] !== undefined && user[k] !== null) payload[k] = user[k];
        });

        // Attach the profile picture as URL when available, otherwise fallback to id
        if (uploaded) {
          if (uploaded.url) payload.profile_picture = uploaded.url;
          else if (uploaded.id) payload.profile_picture = uploaded.id;
        }

        if (user.specialist_profile) payload.specialist_profile = user.specialist_profile;

        await authAPI.updateUser(id, payload, token);
        // Si hay specialist_profile, intentar actualizarlo por user id
        if (user.specialist_profile) {
          // Intentar usar el ID del perfil de especialista si está disponible, sino usar user_id
          const specialistProfileId = user.specialist_profile.id || user.specialist_profile.pk;
          const profileUserId = specialistProfileId ? Number(specialistProfileId) : Number(user.id || id);
          
          console.log('[EditUser] Specialist profile ID:', specialistProfileId, 'User ID:', user.id, 'Using:', profileUserId);
          
          // Construir specialistData solo con campos que tienen valores válidos
          const specialistData = {};
          
          // Solo incluir campos que existen y tienen valores válidos
          if (user.specialist_profile.user_display !== undefined && user.specialist_profile.user_display !== null) {
            const userDisplay = String(user.specialist_profile.user_display).trim();
            if (userDisplay !== '') {
              specialistData.user_display = userDisplay;
            }
          }
          
          if (user.specialist_profile.profession !== undefined && user.specialist_profile.profession !== null) {
            const profession = String(user.specialist_profile.profession).trim();
            if (profession !== '') {
              specialistData.profession = profession;
            }
          }
          
          if (user.specialist_profile.experience_years !== undefined && user.specialist_profile.experience_years !== null) {
            const expYears = Number(user.specialist_profile.experience_years);
            if (!isNaN(expYears) && expYears >= 0) {
              specialistData.experience_years = expYears;
            }
          }
          
          if (user.specialist_profile.about_us !== undefined && user.specialist_profile.about_us !== null) {
            const aboutUs = String(user.specialist_profile.about_us).trim();
            if (aboutUs !== '') {
              specialistData.about_us = aboutUs;
            }
          }
          
          // Los booleanos siempre se incluyen si están definidos
          if (user.specialist_profile.can_give_consultations !== undefined) {
            specialistData.can_give_consultations = Boolean(user.specialist_profile.can_give_consultations);
          }
          
          if (user.specialist_profile.can_offer_online_services !== undefined) {
            specialistData.can_offer_online_services = Boolean(user.specialist_profile.can_offer_online_services);
          }
          
          // Solo intentar actualizar si hay datos para enviar
          if (Object.keys(specialistData).length === 0) {
            console.warn('[EditUser] No specialist data to send, skipping update');
          } else {
            console.log('🔵 [EditUser] Sending specialist data (with file):', JSON.stringify(specialistData, null, 2));
            console.log('🔵 [EditUser] User ID to use:', profileUserId);
            
            // Intentar incluir el campo 'user' si el backend lo requiere
            // Algunos backends esperan el user_id en el payload, no solo en la URL
            const payloadWithUser = { ...specialistData };
            // Solo incluir 'user' si no está ya en specialistData y si tenemos el user_id
            if (!payloadWithUser.user && !payloadWithUser.user_id && profileUserId) {
              // Intentar con 'user' primero (formato común en Django REST)
              payloadWithUser.user = profileUserId;
              console.log('🔵 [EditUser] Added "user" field to payload:', profileUserId);
            } else {
              console.log('🔵 [EditUser] "user" field already exists or profileUserId is missing');
            }
            
            console.log('🔵 [EditUser] Final payload to send:', JSON.stringify(payloadWithUser, null, 2));
            
            try {
              await profilesAPI.patchSpecialistByUser(
                profileUserId,
                payloadWithUser,
                token
              );
            } catch (e) {
              console.error('[EditUser] Error updating specialist profile (PATCH):', {
                error: e.message,
                status: e.status,
                body: e.body,
                raw: e.raw
              });
              
              // Intentar extraer más información del error
              let errorDetails = '';
              if (e.body) {
                if (typeof e.body === 'object') {
                  errorDetails = JSON.stringify(e.body, null, 2);
                } else {
                  errorDetails = String(e.body);
                }
              }
              if (e.raw && typeof e.raw === 'string' && e.raw.length < 500) {
                console.error('[EditUser] Raw error response:', e.raw);
              }
              
              // fallback to PUT if PATCH is not supported for this endpoint
              try {
                await profilesAPI.putSpecialistByUser(
                  profileUserId,
                  payloadWithUser,
                  token
                );
              } catch (e2) {
                console.error('[EditUser] Error with PUT fallback:', {
                  error: e2.message,
                  status: e2.status,
                  body: e2.body,
                  raw: e2.raw
                });
                
                // Intentar extraer más información del error PUT
                if (e2.body) {
                  if (typeof e2.body === 'object') {
                    console.error('[EditUser] PUT error details:', JSON.stringify(e2.body, null, 2));
                  } else {
                    console.error('[EditUser] PUT error details:', String(e2.body));
                  }
                }
                
                // Si ambos fallan, puede que el perfil no exista, intentar crearlo
                if (e2.status === 404 || e.status === 404) {
                  try {
                    await profilesAPI.createSpecialist(specialistData, token);
                  } catch (e3) {
                    console.error('[EditUser] Error creating specialist profile:', {
                      error: e3.message,
                      status: e3.status,
                      body: e3.body
                    });
                    throw new Error('No se pudo actualizar el perfil de especialista');
                  }
                } else {
                  // Si es error 500, mostrar mensaje más descriptivo con detalles
                  const errorMsg = e2.body?.detail || e2.body?.error || e2.body?.message || 
                                 e.body?.detail || e.body?.error || e.body?.message || 
                                 e2.message || e.message || 
                                 'Error del servidor al actualizar el perfil. Verifica los logs del servidor.';
                  throw new Error(errorMsg);
                }
              }
            }
          }
        }
      } else {
        const payload = { ...user };
        // evitar enviar preview blob como profile_picture
        if (
          typeof payload.profile_picture === "string" &&
          payload.profile_picture.startsWith("blob:")
        ) {
          delete payload.profile_picture;
        }
        await authAPI.updateUser(id, payload, token);
        // actualizar specialist_profile por separado si existe
        if (user.specialist_profile) {
          // Intentar usar el ID del perfil de especialista si está disponible, sino usar user_id
          const specialistProfileId = user.specialist_profile.id || user.specialist_profile.pk;
          const profileUserId = specialistProfileId ? Number(specialistProfileId) : Number(user.id || id);
          
          console.log('🔵 [EditUser] Specialist profile ID:', specialistProfileId, 'User ID:', user.id, 'Using:', profileUserId);
          console.log('🔵 [EditUser] Full specialist_profile:', JSON.stringify(user.specialist_profile, null, 2));
          
          // Construir specialistData solo con campos que tienen valores válidos
          const specialistData = {};
          
          // Solo incluir campos que existen y tienen valores válidos
          if (user.specialist_profile.user_display !== undefined && user.specialist_profile.user_display !== null) {
            const userDisplay = String(user.specialist_profile.user_display).trim();
            if (userDisplay !== '') {
              specialistData.user_display = userDisplay;
            }
          }
          
          if (user.specialist_profile.profession !== undefined && user.specialist_profile.profession !== null) {
            const profession = String(user.specialist_profile.profession).trim();
            if (profession !== '') {
              specialistData.profession = profession;
            }
          }
          
          if (user.specialist_profile.experience_years !== undefined && user.specialist_profile.experience_years !== null) {
            const expYears = Number(user.specialist_profile.experience_years);
            if (!isNaN(expYears) && expYears >= 0) {
              specialistData.experience_years = expYears;
            }
          }
          
          if (user.specialist_profile.about_us !== undefined && user.specialist_profile.about_us !== null) {
            const aboutUs = String(user.specialist_profile.about_us).trim();
            if (aboutUs !== '') {
              specialistData.about_us = aboutUs;
            }
          }
          
          // Los booleanos siempre se incluyen si están definidos
          if (user.specialist_profile.can_give_consultations !== undefined) {
            specialistData.can_give_consultations = Boolean(user.specialist_profile.can_give_consultations);
          }
          
          if (user.specialist_profile.can_offer_online_services !== undefined) {
            specialistData.can_offer_online_services = Boolean(user.specialist_profile.can_offer_online_services);
          }
          
          // Solo intentar actualizar si hay datos para enviar
          if (Object.keys(specialistData).length === 0) {
            console.warn('[EditUser] No specialist data to send, skipping update');
          } else {
          console.log('🔵 [EditUser] Sending specialist data (no file):', JSON.stringify(specialistData, null, 2));
          console.log('🔵 [EditUser] User ID to use:', profileUserId);
          
          // Intentar incluir el campo 'user' si el backend lo requiere
          // Algunos backends esperan el user_id en el payload, no solo en la URL
          const payloadWithUser = { ...specialistData };
          // Solo incluir 'user' si no está ya en specialistData y si tenemos el user_id
          if (!payloadWithUser.user && !payloadWithUser.user_id && profileUserId) {
            // Intentar con 'user' primero (formato común en Django REST)
            payloadWithUser.user = profileUserId;
            console.log('🔵 [EditUser] Added "user" field to payload:', profileUserId);
          } else {
            console.log('🔵 [EditUser] "user" field already exists or profileUserId is missing');
          }
          
          console.log('🔵 [EditUser] Final payload to send:', JSON.stringify(payloadWithUser, null, 2));
          
          try {
            await profilesAPI.patchSpecialistByUser(
              profileUserId,
              payloadWithUser,
              token
            );
            } catch (e) {
              console.error('❌ [EditUser] Error updating specialist profile (PATCH):');
              console.error('   Error:', e.message);
              console.error('   Status:', e.status);
              
              // Intentar extraer más información del error HTML
              if (e.body && e.body.htmlError) {
                console.error('❌ [EditUser] HTML Error Details:');
                console.error('   Error Title:', e.body.error);
                console.error('   Detail:', e.body.detail);
                if (e.body.traceback) {
                  console.error('   Backend Traceback (last 15 lines):');
                  console.error(e.body.traceback);
                }
              } else if (e.body) {
                console.error('❌ [EditUser] Error body:');
                if (typeof e.body === 'object') {
                  console.error(JSON.stringify(e.body, null, 2));
                } else {
                  console.error(String(e.body));
                }
              }
              
            try {
              await profilesAPI.putSpecialistByUser(
                profileUserId,
                payloadWithUser,
                token
              );
              } catch (e2) {
                console.error('❌ [EditUser] Error with PUT fallback:');
                console.error('   Error:', e2.message);
                console.error('   Status:', e2.status);
                
                // Intentar extraer más información del error HTML
                if (e2.body && e2.body.htmlError) {
                  console.error('❌ [EditUser] PUT HTML Error Details:');
                  console.error('   Error Title:', e2.body.error);
                  console.error('   Detail:', e2.body.detail);
                  if (e2.body.traceback) {
                    console.error('   Backend Traceback (last 15 lines):');
                    console.error(e2.body.traceback);
                  }
                } else if (e2.body) {
                  console.error('❌ [EditUser] PUT Error body:');
                  if (typeof e2.body === 'object') {
                    console.error(JSON.stringify(e2.body, null, 2));
                  } else {
                    console.error(String(e2.body));
                  }
                }
                
                // Si ambos fallan, puede que el perfil no exista, intentar crearlo
                if (e2.status === 404 || e.status === 404) {
                  try {
                    await profilesAPI.createSpecialist(specialistData, token);
                  } catch (e3) {
                    console.error('[EditUser] Error creating specialist profile:', {
                      error: e3.message,
                      status: e3.status,
                      body: e3.body
                    });
                    throw new Error('No se pudo actualizar el perfil de especialista');
                  }
                } else {
                  // Si es error 500, mostrar mensaje más descriptivo con detalles
                  const errorMsg = e2.body?.detail || e2.body?.error || e2.body?.message || 
                                 e.body?.detail || e.body?.error || e.body?.message || 
                                 e2.message || e.message || 
                                 'Error del servidor al actualizar el perfil. Verifica los logs del servidor.';
                  throw new Error(errorMsg);
                }
              }
            }
          }
        }
      }
      // Recargar la página para mostrar los cambios actualizados
      console.log('[EditUser] ✅ Guardado exitoso, redirigiendo a /perfil');
      // Forzar recarga completa de la página con cache busting
      const timestamp = Date.now();
      console.log('[EditUser] 🔄 Redirigiendo a /perfil con timestamp:', timestamp);
      // Usar window.location.replace para evitar que se pueda volver atrás
      window.location.replace(`/perfil?refresh=${timestamp}&t=${timestamp}`);
    } catch (e) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="40vh"
      >
        <CircularProgress />
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  if (!user) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Editar usuario
      </Typography>
      <Box sx={{ display: "grid", gap: 2, maxWidth: 640 }}>
        <TextField
          label="Nombre"
          name="full_name"
          value={user.full_name || ""}
          onChange={handleChange}
        />
        <TextField
          label="Apellido"
          name="last_name"
          value={user.last_name || ""}
          onChange={handleChange}
        />
        <TextField
          label="Biografía"
          name="bio"
          value={user.bio || ""}
          onChange={handleChange}
        />

        <Box>
          <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
            Foto de perfil (subir archivo para reemplazar)
          </Typography>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </Box>

        {/* Campos específicos para especialistas */}
        {(user.role || "").toString().toLowerCase() === "specialist" && (
          <Box
            sx={{ mt: 1, p: 1, borderRadius: 1, bgcolor: "rgba(0,0,0,0.03)" }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
              Perfil especialista
            </Typography>
            <TextField
              label="Nombre público"
              name="specialist_profile.user_display"
              value={user.specialist_profile?.user_display || ""}
              onChange={handleChange}
            />
            <TextField
              label="Profesión"
              name="specialist_profile.profession"
              value={user.specialist_profile?.profession || ""}
              onChange={handleChange}
            />
            <TextField
              label="Años de experiencia"
              name="specialist_profile.experience_years"
              type="number"
              value={user.specialist_profile?.experience_years ?? ""}
              onChange={handleChange}
            />
            <TextField
              label="Sobre mí"
              name="specialist_profile.about_us"
              multiline
              minRows={2}
              value={user.specialist_profile?.about_us || ""}
              onChange={handleChange}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="specialist_profile.can_give_consultations"
                  checked={Boolean(
                    user.specialist_profile?.can_give_consultations
                  )}
                  onChange={handleChange}
                />
              }
              label="Puede dar consultorías"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="specialist_profile.can_offer_online_services"
                  checked={Boolean(
                    user.specialist_profile?.can_offer_online_services
                  )}
                  onChange={handleChange}
                />
              }
              label="Ofrece servicios online"
            />
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EditUser;
