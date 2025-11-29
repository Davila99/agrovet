import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Avatar,
  Typography,
  CircularProgress,
  Rating,
  Button,
  Card,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import httpClient from "../../../services/httpClient";
import { profilesAPI } from "../../../services/endpoints";
import VerificationBadge from "../profile/molecules/VerificationBadge";

const SpecialistsList = ({ onSelectSpecialist, searchQuery, professionFilter = null }) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [specialistsCount, setSpecialistsCount] = useState(0);
  const navigate = useNavigate();

  const mainGreen = "#2E7D32";
  const background = "#F1F8F5";
  const textDark = "#1B1B1B";

  useEffect(() => {
    let mounted = true;

    const fetchAllPages = async (url, acc = []) => {
      // Maneja paginación automática del DRF
      const data = await httpClient(url, { method: "GET" });
      const results = Array.isArray(data) ? data : data.results || [];
      const combined = [...acc, ...results];
      if (data.next) {
        return fetchAllPages(data.next, combined);
      }
      return combined;
    };

    const load = async () => {
      try {
        setLoading(true);
        const list = await fetchAllPages("/auth/users/");

        if (!mounted) return;
        try {
          console.debug('[SpecialistsList] fetched users', { total: Array.isArray(list) ? list.length : (list && list.count), sample: (Array.isArray(list) ? list.slice(0,5) : (list.results||[]).slice(0,5)) });
        } catch (e) {}

        const currentId = localStorage.getItem("userId");

        // Helper: normalize role and decide if a user should be considered a specialist.
        const normalizeRole = (r) => String(r || "").toLowerCase();
        const isSpecialistUser = (u) => {
          const role = normalizeRole(u.role || u.user_role);
          // Accept English and Spanish labels commonly used in the project
          const roleMatch = role && (role.includes("specialist") || role.includes("especialista") || role.includes("especialist"));
          const flag = u.is_specialist === true;
          const hasProfile = Boolean(u.specialist_profile);
          
          // Debug logging
          if (roleMatch || flag || hasProfile) {
            console.debug('[SpecialistsList] User qualifies as specialist:', {
              id: u.id,
              name: u.full_name || u.username,
              role: u.role,
              roleMatch,
              flag,
              hasProfile
            });
          }
          
          return roleMatch || flag || hasProfile;
        };

        const specialists = list.filter((u) => isSpecialistUser(u));
        console.log("🧠 Especialistas candidatas:", specialists.length);
        
        // Debug: mostrar detalles COMPLETOS de los especialistas encontrados
        if (specialists.length > 0) {
          specialists.forEach(u => {
            const profile = u.specialist_profile || {};
            console.log(`📋 ESPECIALISTA COMPLETO ${u.full_name || u.username}:`, u);
            console.log(`📋 specialist_profile:`, u.specialist_profile);
            console.log(`📋 profile keys:`, Object.keys(profile));
            console.log(`📋 verification_status:`, profile.verification_status);
            console.log(`📋 verification_title_id:`, profile.verification_title_id);
            console.log(`📋 verification_student_card_id:`, profile.verification_student_card_id);
            console.log(`📋 verification_graduation_letter_id:`, profile.verification_graduation_letter_id);
          });
        }

        try {
          console.debug('[SpecialistsList] specialists after filter', { count: specialists.length, sample: specialists.slice(0,5) });
        } catch (e) {}

        // Identify excluded users (for debugging) and reasons
        try {
          const excluded = (Array.isArray(list) ? list : (list.results || [])).filter((u) => !isSpecialistUser(u));
          console.debug('[SpecialistsList] excluded sample (up to 10)', excluded.slice(0,10).map(u => ({ id: u.id, name: u.full_name || u.username, role: u.role, has_profile: !!u.specialist_profile, is_specialist: u.is_specialist })));
        } catch (e) {}

        const filtered = specialists.filter((u) => {
          const isNotCurrentUser = String(u.id) !== String(currentId);
          if (!isNotCurrentUser) {
            console.debug('[SpecialistsList] Filtrando usuario actual:', u.id);
          }
          return isNotCurrentUser;
        });

        // CARGAR perfiles completos de especialistas para obtener datos de verificación
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const enrichedSpecialists = await Promise.all(
          filtered.map(async (specialist) => {
            // PRIMERO: Intentar cargar perfil completo del especialista
            try {
              if (token && specialist.id) {
                const specialistProfile = await profilesAPI.getSpecialistByUser(specialist.id, token);
                if (specialistProfile) {
                  console.log(`✅ Perfil completo cargado para ${specialist.id}:`, {
                    verification_status: specialistProfile.verification_status,
                    verification_type: specialistProfile.verification_type
                  });
                  return {
                    ...specialist,
                    specialist_profile: specialistProfile
                  };
                }
              }
            } catch (err) {
              // Si es 403, intentar usar datos que vengan en /auth/users/
              if (err.status === 403 || err.message?.includes('403') || err.message?.includes('Forbidden')) {
                console.log(`⚠️ 403 para ${specialist.id}, verificando datos básicos...`);
              } else {
                console.error(`❌ Error cargando perfil ${specialist.id}:`, err);
              }
            }
            
            // SEGUNDO: Si no se pudo cargar, usar datos existentes y calcular basado en documentos
            const profile = specialist.specialist_profile || {};
            
            // Si ya tiene verification_status, usarlo
            if (profile.verification_status) {
              return {
                ...specialist,
                specialist_profile: profile
              };
            }
            
            // Si no tiene status, calcular basado en documentos (igual que el backend)
            const hasTitle = !!profile.verification_title_id;
            const hasStudentCard = !!profile.verification_student_card_id;
            const hasGraduationLetter = !!profile.verification_graduation_letter_id;
            
            let verificationStatus = null;
            let verificationType = null;
            
            // Misma lógica que el backend (serializers.py línea 172-196)
            if (hasStudentCard) {
              verificationStatus = 'verified_student';
              verificationType = 'Estudiante';
            } else if (hasTitle || hasGraduationLetter) {
              verificationStatus = 'verified_professional';
              verificationType = 'Médico Titulado';
            }
            
            console.log(`📊 ${specialist.full_name || specialist.username}:`, {
              hasTitle,
              hasStudentCard,
              hasGraduationLetter,
              verificationStatus,
              verificationType
            });
            
            return {
              ...specialist,
              specialist_profile: {
                ...profile,
                verification_status: verificationStatus,
                verification_type: verificationType,
              }
            };
          })
        );

        // Aplicar filtro de profesión si está activo
        let filteredSpecialists = enrichedSpecialists;
        if (professionFilter) {
          console.log(`[SpecialistsList] 🔍 Aplicando filtro de profesión: ${professionFilter}`);
          filteredSpecialists = enrichedSpecialists.filter(s => {
            const profession = s.specialist_profile?.profession || '';
            const matches = profession === professionFilter;
            console.log(`[SpecialistsList] ${s.full_name || s.username}: profession="${profession}", matches=${matches}`);
            return matches;
          });
          console.log(`[SpecialistsList] ✅ Filtrados ${filteredSpecialists.length} de ${enrichedSpecialists.length} especialistas`);
        } else {
          console.log(`[SpecialistsList] 🔍 Sin filtro de profesión, mostrando todos`);
        }
        
        setSpecialistsCount(filteredSpecialists.length);
        setUsers(filteredSpecialists);
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [professionFilter]); // Re-ejecutar cuando cambie el filtro

  // 🌀 Estado de carga
  if (loading)
    return (
      <Box
        sx={{
          width: "100%",
          marginTop: 80,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: background,
          borderRight: "1px solid #c8e6c9",
          height: "100%",
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );

  // ⚠️ Estado de error
  if (error)
    return (
      <Box
        sx={{
          width: "110%",
          p: 2,
          backgroundColor: background,
          borderRight: "1px solid #c8e6c9",
          height: "100%",
        }}
      >
        <Typography color="error">
          Error cargando especialistas: {error}
        </Typography>
      </Box>
    );

  // ✅ Listado con scroll
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: background,
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          p: { xs: 1, sm: 1.5 },
          pb: 8, // ✅ espacio extra al final para que el último card no se corte
          scrollBehavior: "smooth",
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          boxSizing: "border-box",
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#a5d6a7",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#81c784",
          },
        }}
      >
        {(() => {
          // Aplicar filtros: primero por profesión, luego por búsqueda
          let filtered = users;
          
          // Filtro por profesión
          if (professionFilter) {
            console.log(`[SpecialistsList] 🔍 Aplicando filtro de profesión: ${professionFilter}`);
            filtered = filtered.filter(s => {
              const profession = s.specialist_profile?.profession || '';
              const matches = profession === professionFilter;
              if (matches) {
                console.log(`[SpecialistsList] ✅ ${s.full_name || s.username}: profession="${profession}" MATCH`);
              }
              return matches;
            });
            console.log(`[SpecialistsList] ✅ Filtrados ${filtered.length} de ${users.length} especialistas`);
          }
          
          // Filtro por búsqueda
          const q = String(searchQuery || "").trim().toLowerCase();
          if (q) {
            filtered = filtered.filter((u) => {
              const name = (u.full_name || u.username || "").toLowerCase();
              const prof = (u.specialist_profile?.profession || "").toLowerCase();
              return name.includes(q) || prof.includes(q);
            });
          }
          
          return filtered;
        })().length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              No hay especialistas disponibles
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {professionFilter 
                ? `No se encontraron especialistas con profesión "${professionFilter}"`
                : specialistsCount > 0 
                ? "El único especialista encontrado eres tú" 
                : "No se encontraron usuarios con rol de especialista"}
            </Typography>
          </Box>
        ) : (
          (() => {
            // Aplicar filtros: primero por profesión, luego por búsqueda
            let filtered = users;
            
            // Filtro por profesión
            if (professionFilter) {
              filtered = filtered.filter(s => {
                const profession = s.specialist_profile?.profession || '';
                return profession === professionFilter;
              });
            }
            
            // Filtro por búsqueda
            const q = String(searchQuery || "").trim().toLowerCase();
            if (q) {
              filtered = filtered.filter((u) => {
                const name = (u.full_name || u.username || "").toLowerCase();
                const prof = (u.specialist_profile?.profession || "").toLowerCase();
                return name.includes(q) || prof.includes(q);
              });
            }
            
            return filtered;
          })().map((u) => {
            const rating = Number(u?.specialist_profile?.puntuations) || 0;
            const profession =
              u.specialist_profile?.profession || "Veterinario";

            return (
              <Card
                key={u.id}
                onClick={() => navigate(`/perfil?userId=${u.id}`)}
                sx={{
                  mb: 1.5,
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.2,
                  cursor: "pointer",
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                  boxShadow: "0 2px 8px rgba(46,125,50,0.1)",
                  transition: "all 0.2s ease-in-out",
                  gap: 1,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 5px 15px rgba(46,125,50,0.25)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    maxWidth: "calc(100% - 90px)", // Reservar espacio para el botón
                  }}
                >
                  <Avatar
                    src={u.profile_picture || u.profile_picture_url || ""}
                    alt={u.full_name || u.username}
                    sx={{
                      width: 44,
                      height: 44,
                      border: `2px solid ${mainGreen}`,
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden", pr: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: textDark,
                          fontSize: "0.9rem",
                        }}
                        noWrap
                      >
                        {u.full_name || u.username}
                      </Typography>
                      {/* Badge de verificación - FORZAR: mostrar siempre que sea especialista y tenga documentos */}
                      {(() => {
                        const profile = u.specialist_profile || {};
                        const hasTitle = !!(profile.verification_title_id || profile.verification_title);
                        const hasStudentCard = !!(profile.verification_student_card_id || profile.verification_student_card);
                        const hasGraduationLetter = !!(profile.verification_graduation_letter_id || profile.verification_graduation_letter);
                        const hasAnyDoc = hasTitle || hasStudentCard || hasGraduationLetter;
                        
                        // Usar verification_status si existe, sino determinar basado en documentos
                        let verificationStatus = profile.verification_status;
                        let verificationType = profile.verification_type;
                        
                        if (!verificationStatus && hasAnyDoc) {
                          if (hasTitle || hasGraduationLetter) {
                            verificationStatus = 'verified_professional';
                            verificationType = verificationType || 'Médico Titulado';
                          } else if (hasStudentCard) {
                            verificationStatus = 'verified_student';
                            verificationType = verificationType || 'Estudiante';
                          }
                        }
                        
                        // MOSTRAR BADGE si tiene status O si tiene documentos (inferir status)
                        if (verificationStatus) {
                          return (
                            <VerificationBadge
                              verificationStatus={verificationStatus}
                              verificationType={verificationType}
                              size="small"
                            />
                          );
                        }
                        
                        return null;
                      })()}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: mainGreen,
                        fontWeight: 500,
                        fontSize: "0.8rem",
                      }}
                      noWrap
                    >
                      {profession}
                    </Typography>
                    <Rating
                      name={`rating-${u.id}`}
                      value={rating}
                      precision={0.5}
                      readOnly
                      size="small"
                      sx={{ mt: 0.1, color: mainGreen }}
                    />
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    backgroundColor: mainGreen,
                    "&:hover": { backgroundColor: "#256628" },
                    fontSize: "0.7rem",
                    minWidth: 75,
                    maxWidth: 85,
                    width: "auto",
                    flexShrink: 0,
                    px: 1.2,
                    py: 0.6,
                    whiteSpace: "nowrap",
                    borderRadius: 1.5,
                  }}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSpecialist
                      ? onSelectSpecialist(u)
                      : navigate(`/consult/${u.id}`);
                  }}
                >
                  Consultar
                </Button>
              </Card>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default SpecialistsList;
