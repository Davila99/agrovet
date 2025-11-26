import React from "react";
import { Box, Avatar, Typography, Button, Rating } from "@mui/material";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const PerfilHeader = ({ user, editing, setEditing, isOwnProfile = true }) => {
  const handleEditToggle = () => setEditing && setEditing((prev) => !prev);

  const buildMapLinkForBusiness = () => {
    const profile = (user && user.businessman_profile) || {};
    // las coords las tiene el cliente (user)
    const lat = user?.latitude ?? null;
    const lon = user?.longitude ?? null;
    const q =
      profile.location_description ||
      profile.business_name ||
      user?.location_description ||
      user?.address ||
      "";
    if (
      lat !== null &&
      lon !== null &&
      lat !== undefined &&
      lon !== undefined &&
      lat !== "" &&
      lon !== ""
    ) {
      return `/comunidad/mapa?lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lon)}`;
    }
    return `/comunidad/mapa?q=${encodeURIComponent(q)}`;
  };

  const navigate = useNavigate();

  const handleEditClick = () => {
    const target = `/perfil/editar/${
      user?.id || localStorage.getItem("userId")
    }`;
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        // No token: redirigir al login (evita 403 al abrir editor sin credenciales)
        // También podemos mostrar una alerta breve
        try {
          window.alert("Debes iniciar sesión para editar el perfil.");
        } catch (e) {}
        navigate("/auth/login");
        return;
      }
    } catch (e) {
      // Si falla el acceso a localStorage, prevenir navegación insegura
      navigate("/auth/login");
      return;
    }
    navigate(target);
  };

  const role = (user?.role || "").toString().toLowerCase();
  
  // Gradientes según el rol
  const getGradient = () => {
    if (role === "specialist") {
      return "linear-gradient(135deg, #00c6a7 0%, #9EF01A 100%)";
    } else if (role === "businessman") {
      return "linear-gradient(135deg, #2AABEE 0%, #1a94d9 100%)";
    }
    return "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)";
  };

  return (
    <Box sx={{ position: "relative" }}>
      {/* Fondo con gradiente */}
      <Box
        sx={{
          height: { xs: 140, sm: 180 },
          background: getGradient(),
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          },
        }}
      />

      {/* Contenido del header */}
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          mt: { xs: -7, sm: -8 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "center", sm: "flex-end" },
          gap: 3,
        }}
      >
        <Avatar
          src={user?.profile_picture}
          alt={user?.full_name}
          sx={{
            width: { xs: 100, sm: 120 },
            height: { xs: 100, sm: 120 },
            border: "4px solid white",
            fontSize: { xs: 36, sm: 48 },
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          }}
        >
          {!user?.profile_picture &&
            `${user?.full_name?.[0] || ""}${user?.last_name?.[0] || ""}`}
        </Avatar>

        <Box sx={{ flexGrow: 1, textAlign: { xs: "center", sm: "left" } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              justifyContent: { xs: "center", sm: "flex-start" },
              flexWrap: "wrap",
              mb: 0.5,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: "#1A202C",
                fontSize: { xs: "1.5rem", sm: "1.75rem" },
              }}
            >
              {user?.full_name} {user?.last_name}
            </Typography>
            {/* Mostrar puntuación como estrellas para profesionales (specialist) */}
            {role === "specialist" && (
              <Rating
                name="read-only-rating"
                value={Number(user?.specialist_profile?.puntuations || 0)}
                precision={0.5}
                size="small"
                readOnly
                sx={{
                  "& .MuiRating-iconFilled": {
                    color: "#FFD700",
                  },
                }}
              />
            )}
          </Box>

          <Typography
            sx={{
              color: "#718096",
              fontWeight: 500,
              fontSize: "0.95rem",
            }}
          >
            {role === "specialist" && "Especialista"}
            {role === "businessman" && "Negocio"}
            {role === "consumer" && "Consumidor"}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            alignItems: "center",
            flexDirection: { xs: "row", sm: "row" },
          }}
        >
          {role === "businessman" && (
            <Button
              component={RouterLink}
              to={buildMapLinkForBusiness()}
              variant="outlined"
              startIcon={<MapOutlinedIcon />}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                borderColor: "#2AABEE",
                color: "#2AABEE",
                fontWeight: 600,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                "&:hover": {
                  borderColor: "#1a94d9",
                  bgcolor: "#2AABEE10",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                },
              }}
            >
              Ir al mapa
            </Button>
          )}

          {isOwnProfile && (
            <Button
              onClick={handleEditToggle}
              variant="contained"
              color="primary"
              sx={{
                textTransform: "none",
                borderRadius: 2,
                fontWeight: 600,
                px: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s",
              }}
            >
              Editar usuario
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PerfilHeader;
