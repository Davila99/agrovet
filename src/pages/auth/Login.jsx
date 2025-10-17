import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/endpoints";
import showSweetAlert from "../../utils/alert";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phone_number: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.phone_number || !form.password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login({
        phone_number: form.phone_number,
        password: form.password,
      });

      // Guardamos token
      localStorage.setItem("token", res.token);

      if (res.user && res.user.id) {
        localStorage.setItem("userId", res.user.id);
        console.log("ID del usuario guardado:", res.user.id);
        console.log("Respuesta del login:", res);
      } else {
        console.warn(
          "No se recibió el ID del usuario en la respuesta del login"
        );
      }

      navigate("/dashboard", { replace: true }); // Redirigimos al dashboard
    } catch (err) {
      // Si es un error de servidor (5xx) o el servicio fue marcado como caído, mostrar alerta especial
      const status = err && err.status ? err.status : null;
      if (status && status >= 500) {
        await showSweetAlert(
          "Sistema fuera de servicio",
          "Error del servidor (5xx). Intenta más tarde."
        );
      }
      if (typeof window !== "undefined" && window.__AGROVET_SERVICE_DOWN) {
        await showSweetAlert(
          "Sistema fuera de servicio",
          "No se puede conectar con el backend. Intenta más tarde."
        );
      }
      setError(err.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f7fa",
        p: 2,
      }}
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
        <Typography variant="h5" fontWeight="bold" gutterBottom color="#103E68">
          Iniciar Sesión
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Número de teléfono"
            margin="normal"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            margin="normal"
            name="password"
            value={form.password}
            onChange={handleChange}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              bgcolor: "#103E68",
              "&:hover": { bgcolor: "#35722b" },
              borderRadius: 3,
              fontWeight: "bold",
            }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Ingresar"
            )}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2 }}>
          ¿No tienes cuenta?{" "}
          <Link to="/register" style={{ color: "#103E68", fontWeight: "bold" }}>
            Regístrate
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginPage;
