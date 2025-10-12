import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { getProfile } from "../services/endpoints";

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!userId) {
          throw new Error("No se encontró el ID del usuario");
        }

        const res = await getProfile(userId, token);
        console.log("Perfil cargado:", res);
        setUser(res);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
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
  }

  if (error) {
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
  }

  if (!user) return null;

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
      bgcolor="#f5f7fa"
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          maxWidth: 400,
          width: "100%",
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Avatar
            src={user?.profile_picture || undefined}
            alt={user?.full_name}
            sx={{ width: 100, height: 100, fontSize: 32 }}
          >
            {!user?.profile_picture && (
              <>
                {user?.full_name?.[0]?.toUpperCase() || ""}
                {user?.last_name?.[0]?.toUpperCase() || ""}
              </>
            )}
          </Avatar>
        </Box>
        <Typography variant="h5" fontWeight="bold" color="#103E68" gutterBottom>
          {user.full_name} {user.last_name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {user.role === "Specialist" && "Especialista"}
          {user.role === "businessman" && "Negocio Agropecuario"}
          {user.role === "consumer" && "Consumidor"}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <b>Teléfono:</b> {user.phone_number}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <b>Sobre mí:</b> {user.bio}
        </Typography>
        <Button
          variant="contained"
          sx={{ bgcolor: "#103E68", borderRadius: 3, fontWeight: "bold" }}
        >
          Editar Perfil
        </Button>
      </Paper>
    </Box>
  );
};

export default Perfil;
