import React, { useEffect, useState } from "react";
import { Box, Paper, CircularProgress, Alert } from "@mui/material";
import { getProfile, authAPI } from "../../services/endpoints";
import { useLocation } from "react-router-dom";
import PerfilHeader from "./PerfilHeader";
import PerfilForm from "./PerfilForm";
import PerfilPortfolio from "./PerfilPortfolio";
import PerfilContactHistory from "./PerfilContactHistory";

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const location = useLocation();
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
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
            res = await getProfile(localStorage.getItem("userId"), token);
          }
        } else {
          const userId = localStorage.getItem("userId");
          if (!userId) throw new Error("No se encontró el ID del usuario");
          res = await getProfile(userId, token);
          setIsOwnProfile(true);
        }
        setUser(res);
        setForm(res);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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

  if (!user) return null;

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
            form={form}
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
