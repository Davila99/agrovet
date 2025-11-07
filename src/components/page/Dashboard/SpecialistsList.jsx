import React, { useEffect, useState } from "react";
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

const SpecialistsList = ({ onSelectSpecialist, searchQuery }) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
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
          return roleMatch || flag || hasProfile;
        };

        const specialists = list.filter((u) => isSpecialistUser(u));
        console.log("🧠 Especialistas candidatas:", specialists.length);

        try {
          console.debug('[SpecialistsList] specialists after filter', { count: specialists.length, sample: specialists.slice(0,5) });
        } catch (e) {}

        // Identify excluded users (for debugging) and reasons
        try {
          const excluded = (Array.isArray(list) ? list : (list.results || [])).filter((u) => !isSpecialistUser(u));
          console.debug('[SpecialistsList] excluded sample (up to 10)', excluded.slice(0,10).map(u => ({ id: u.id, name: u.full_name || u.username, role: u.role, has_profile: !!u.specialist_profile, is_specialist: u.is_specialist })));
        } catch (e) {}

        const filtered = specialists.filter((u) => String(u.id) !== String(currentId));

        setUsers(filtered);
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
  }, []);

  // 🌀 Estado de carga
  if (loading)
    return (
      <Box
        sx={{
          width: "100%",
          p: 2,
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
          width: "100%",
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
        borderRight: "1px solid #c8e6c9",
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          p: 1.5,
          pb: 8, // ✅ espacio extra al final para que el último card no se corte
          scrollBehavior: "smooth",
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
        {users
          .filter((u) => {
            const q = String(searchQuery || "").trim().toLowerCase();
            if (!q) return true;
            const name = (u.full_name || u.username || "").toLowerCase();
            const prof = (u.specialist_profile?.profession || "").toLowerCase();
            return name.includes(q) || prof.includes(q);
          })
          .map((u) => {
            const rating = Number(u?.specialist_profile?.puntuations) || 0;
            const profession =
              u.specialist_profile?.profession || "Veterinario";

            return (
              <Card
                key={u.id}
                onClick={() => navigate(`/profile/${u.id}`)}
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
                  boxShadow: "0 2px 8px rgba(46,125,50,0.1)",
                  transition: "all 0.2s ease-in-out",
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
                  <Box sx={{ flex: 1, minWidth: 0 }}>
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
                    minWidth: 70,
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
          })}
      </Box>
    </Box>
  );
};

export default SpecialistsList;
