import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../../services/endpoints";
import showSweetAlert from "../../../utils/alert";
import CountryPicker, { COUNTRY_CODES } from "../../atoms/auth/CountryPicker";
import { FormContainer } from "../../atoms/form";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phone_number: "",
    password: "",
  });
  const [countryCode, setCountryCode] = useState("+591"); // Default Bolivia

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Auto-detect country on mount
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country_code) {
          const found = COUNTRY_CODES.find(c => c.code === data.country_code);
          if (found) {
            setCountryCode(found.dial);
          }
        }
      })
      .catch(err => {
        console.warn('Failed to detect country:', err);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.phone_number || !form.password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    try {
      // Combine country code with phone number
      const fullPhoneNumber = `${countryCode} ${form.phone_number}`;
      const sanitizedPhone = String(fullPhoneNumber).replace(/\D/g, "");
      const res = await authAPI.login({
        phone_number: sanitizedPhone,
        password: form.password,
      });

      // Guardamos token
      localStorage.setItem("token", res.token);

      if (res.user && res.user.id) {
        localStorage.setItem("userId", res.user.id);
        console.log("ID del usuario guardado:", res.user.id);
        console.log("Respuesta del login:", res);

        // Auto-join communities based on role (best effort, don't block login)
        if (res.user.role) {
          try {
            const { autoJoinCommunitiesByRole } = await import('../../../utils/Foro/autoJoinCommunities');
            // Run in background, don't wait for it
            autoJoinCommunitiesByRole(res.user.role).catch(err => {
              console.warn('Failed to auto-join communities:', err);
            });
          } catch (err) {
            console.warn('Failed to load auto-join utility:', err);
            // Don't block login if this fails
          }
        }
      } else {
        console.warn(
          "No se recibió el ID del usuario en la respuesta del login"
        );
      }

      navigate("/dashboard", { replace: true }); // Redirigimos al dashboard
    } catch (err) {
      // Si es un error de servidor (5xx) o el servicio fue marcado como caído, mostrar alerta especial
      const status = err && err.status ? err.status : null;

      // Manejar errores de timeout/abort
      if (err && (err.name === 'AbortError' || err.isTimeout)) {
        const errorMsg = err.message || "El servidor no está respondiendo. Verifica que el servicio de autenticación esté corriendo en http://127.0.0.1:8002";
        setError(errorMsg);
        await showSweetAlert(
          "Error de conexión",
          errorMsg
        );
        return;
      }

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
        p: { xs: 2, sm: 3 },
      }}
    >
      <FormContainer title="Iniciar Sesión" variant="compact">
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <CountryPicker
            value={countryCode}
            onChange={setCountryCode}
          />

          <TextField
            fullWidth
            label="Número de teléfono"
            margin="normal"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography variant="body2" color="text.secondary">
                    {countryCode}
                  </Typography>
                </InputAdornment>
              ),
            }}
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
              py: 1.5,
              bgcolor: "#103E68",
              "&:hover": { bgcolor: "#0d3254" },
              borderRadius: 2,
              fontWeight: 600,
              fontSize: "1rem",
              textTransform: "none",
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

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2">
            <Link
              to="/auth/reset-phone"
              style={{ color: "#103E68", fontWeight: 600 }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Typography>

          <Typography variant="body2" sx={{ mt: 1.5 }}>
            ¿No tienes cuenta?{" "}
            <Link to="/register" style={{ color: "#103E68", fontWeight: 600 }}>
              Regístrate
            </Link>
          </Typography>
        </Box>
      </FormContainer>
    </Box>
  );
};

export default LoginPage;
