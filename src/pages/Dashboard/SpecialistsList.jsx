import React, { useEffect, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Grid,
  Rating,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import httpClient from "../../services/httpClient";

// Componente que muestra una lista de usuarios con role 'specialist'
const SpecialistsList = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // El httpClient ya añade la URL base y el token desde localStorage si aplica
        const data = await httpClient("/auth/users/", { method: "GET" });
        // La API puede devolver un array o un objeto con results
        let list = [];
        if (Array.isArray(data)) list = data;
        else if (data && Array.isArray(data.results)) list = data.results;

        // Filtrar especialistas por role (case-insensitive)
        const specialists = list.filter(
          (u) => (u.role || "").toString().toLowerCase() === "specialist"
        );
        if (mounted) setUsers(specialists);
      } catch (err) {
        console.error("Error cargando usuarios:", err);
        if (mounted) setError(err?.message || "Error al cargar usuarios");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );

  if (!users.length)
    return (
      <Box p={3}>
        <Typography>No se encontraron especialistas.</Typography>
      </Box>
    );

  return (
    <Box p={2}>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Especialistas
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <List>
          {users.map((u) => (
            <ListItem
              key={u.id}
              button
              onClick={() => navigate(`/perfil?userId=${u.id}`)}
              sx={{ cursor: "pointer" }}
            >
              <ListItemAvatar>
                <Avatar
                  src={u.profile_picture || u.profile_picture_url || ""}
                  alt={u.full_name || u.username}
                />
              </ListItemAvatar>
              <ListItemText
                primary={u.full_name || u.user_display || u.username}
                secondary={
                  <Grid container spacing={1} alignItems="center">
                    <Grid item>
                      <Typography variant="body2" color="text.secondary">
                        {u.email}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Chip
                        label={
                          (u.role || "").toString() === "Specialist"
                            ? "Especialista"
                            : u.role
                        }
                        size="small"
                        color="primary"
                      />
                    </Grid>
                    <Grid item sx={{ display: "flex", alignItems: "center" }}>
                      <Rating
                        name={`rating-${u.id}`}
                        value={Number(u?.specialist_profile?.puntuations) || 0}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {`${
                          Number(u?.specialist_profile?.puntuations) || 0
                        } ⭐ (${u?.specialist_profile?.point ?? 0} puntos)`}
                      </Typography>
                    </Grid>
                  </Grid>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default SpecialistsList;
