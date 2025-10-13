import React, { useEffect, useState } from "react";
import { Box, Paper, CircularProgress, Alert } from "@mui/material";
import { getProfile } from "../../services/endpoints";
import PerfilHeader from "./PerfilHeader";
import PerfilForm from "./PerfilForm";
import PerfilPortfolio from "./PerfilPortfolio";

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("No se encontró el ID del usuario");
        const res = await getProfile(userId, token);
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
        minHeight: "90vh",
        bgcolor: "#f0f2f5",
        p: { xs: 1, sm: 2, md: 4 },
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
          <PerfilPortfolio editing={editing} portfolio={user.portfolio || []} />
        </Box>
      </Paper>
    </Box>
  );
};

export default Perfil;
