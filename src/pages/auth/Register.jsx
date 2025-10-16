import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import RegisterFormFields from "./RegisterFormFields";
import RegisterButton from "./RegisterButton";
import { authAPI } from "../../services/endpoints";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    phone_number: "",
    password: "",
    confirm_password: "",
    last_name: "",
    role: "",
    bio: "",
    profile_picture: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 o 2
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [locationAsked, setLocationAsked] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const isPasswordValid = (pwd) => {
    if (!pwd || typeof pwd !== "string") return false;
    const minLength = /.{8,}/;
    const upper = /[A-Z]/;
    const lower = /[a-z]/;
    const number = /[0-9]/;
    const special = /[!@#$%^&*(),.?":{}|<>]/;
    return (
      minLength.test(pwd) &&
      upper.test(pwd) &&
      lower.test(pwd) &&
      number.test(pwd) &&
      special.test(pwd)
    );
  };

  const handleChange = (e) => {
    if (e.target.type === "file") {
      const newForm = { ...form, [e.target.name]: e.target.files[0] };
      setForm(newForm);
      return;
    }

    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);

    // Limpia error si las contraseñas ahora coinciden y son válidas
    if (
      (e.target.name === "password" || e.target.name === "confirm_password") &&
      newForm.password &&
      newForm.confirm_password
    ) {
      if (
        newForm.password === newForm.confirm_password &&
        isPasswordValid(newForm.password)
      ) {
        setError("");
      }
    }
  };

  const submitForm = async () => {
    setError("");
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      // no enviar confirm_password
      if (key === "confirm_password") return;
      if (value !== null && value !== undefined) formData.append(key, value);
    });

    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      console.log("Registro exitoso:", res);
      navigate("/login");
    } catch (err) {
      console.error("Error al registrar:", err);
      setError(err.message || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (currentStep) => {
    // Validación simple por paso
    if (currentStep === 1) {
      if (
        !form.full_name ||
        !form.last_name ||
        !form.phone_number ||
        !form.profile_picture
      ) {
        setError(
          "Completa los campos básicos: nombre, apellido, teléfono y foto"
        );
        return false;
      }
    }
    if (currentStep === 2) {
      if (!form.password || !form.confirm_password || !form.role || !form.bio) {
        setError("Completa contraseña, confirmación, perfil y sobre mi");
        return false;
      }
      if (form.password !== form.confirm_password) {
        setError("Las contraseñas no coinciden");
        return false;
      }
      // Validación de contraseña mínima
      if (!isPasswordValid(form.password)) {
        setError(
          "La contraseña no cumple los requisitos: mínimo 8 caracteres, mayúscula, minúscula y número"
        );
        return false;
      }
    }
    setError("");
    return true;
  };

  const nextStep = (e) => {
    e && e.preventDefault();
    if (validateStep(1)) setStep(2);
  };

  const prevStep = (e) => {
    e && e.preventDefault();
    setError("");
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Validar todo antes de enviar
    if (!validateStep(1) || !validateStep(2)) return;

    // Si no hemos preguntado aún, mostrar diálogo para pedir permiso
    if (!locationAsked) {
      setShowLocationDialog(true);
      return;
    }

    // Si ya preguntamos (aceptó o rechazó), enviamos directamente
    await submitForm();
  };

  const handleAskLocationConfirm = () => {
    // Usuario eligió no guardar ubicación
    setLocationAsked(true);
    setShowLocationDialog(false);
    setLocationError("");
    // enviar sin ubicación
    submitForm();
  };

  const handleAskLocationSave = () => {
    // Intentar obtener geolocalización
    setLocationLoading(true);
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationLoading(false);
      setLocationError("Geolocalización no soportada en este navegador");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // añadir al form y enviar
        setForm((prev) => ({ ...prev, latitude, longitude }));
        setLocationLoading(false);
        setLocationAsked(true);
        setShowLocationDialog(false);
        submitForm();
      },
      (err) => {
        console.error("Error geolocalización:", err);
        setLocationLoading(false);
        setLocationError(err.message || "Error al obtener ubicación");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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
          maxWidth: 420,
          width: "100%",
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom color="#103E68">
          Crear Cuenta
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <RegisterFormFields
            form={form}
            handleChange={handleChange}
            step={step}
          />

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            {step === 2 && (
              <RegisterButton label="Atrás" type="button" onClick={prevStep} />
            )}

            {step === 1 ? (
              <RegisterButton
                label="Siguiente"
                type="button"
                onClick={nextStep}
              />
            ) : (
              <RegisterButton
                label="Registrarme"
                type="submit"
                loading={loading}
              />
            )}
          </Stack>
        </form>

        {/* Diálogo para preguntar si guardar ubicación */}
        <Dialog
          open={showLocationDialog}
          onClose={() => setShowLocationDialog(false)}
        >
          <DialogTitle>¿Deseas guardar tu ubicación?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Podemos guardar tu ubicación (latitud y longitud) para ofrecer una
              mejor experiencia (mapas, recomendaciones locales). ¿Deseas que
              guardemos tu ubicación?
            </DialogContentText>
            {locationError && (
              <DialogContentText sx={{ color: "error.main", mt: 1 }}>
                {locationError}
              </DialogContentText>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleAskLocationConfirm}
              disabled={locationLoading}
            >
              No guardar
            </Button>
            <Button
              onClick={handleAskLocationSave}
              variant="contained"
              startIcon={
                locationLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : null
              }
            >
              {locationLoading ? "Obteniendo..." : "Guardar ubicación"}
            </Button>
          </DialogActions>
        </Dialog>

        <Typography variant="body2" sx={{ mt: 2 }}>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" style={{ color: "#103E68", fontWeight: "bold" }}>
            Inicia sesión
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
