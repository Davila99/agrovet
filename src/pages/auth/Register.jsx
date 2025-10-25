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
    return (
      minLength.test(pwd) &&
      upper.test(pwd) &&
      lower.test(pwd) & number.test(pwd)
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

  // Enviar formulario. Si se pasa formObj, usarlo (útil para enviar con lat/lon sin esperar setState)
  const submitForm = async (formObj = null) => {
    setError("");
    const source = formObj || form;
    const formData = new FormData();
    // Helper para formatear coordenadas y evitar demasiados dígitos
    const formatCoordinate = (num) => {
      if (num === null || num === undefined || Number.isNaN(Number(num)))
        return num;
      const v = Number(num);
      const abs = Math.abs(v);
      const intDigits = Math.floor(abs).toString().length;
      const maxDigits = 10;

      let allowedDecimals = Math.max(0, maxDigits - intDigits);
      if (allowedDecimals > 6) allowedDecimals = 6;
      // si intDigits ya excede maxDigits, truncar sin decimales
      if (intDigits > maxDigits) return v.toFixed(0);
      return v.toFixed(allowedDecimals);
    };

    Object.entries(source).forEach(([key, value]) => {
      // no enviar confirm_password
      if (key === "confirm_password") return;
      let toAppend = value;
      if (
        (key === "latitude" || key === "longitude") &&
        value !== null &&
        value !== undefined
      ) {
        toAppend = formatCoordinate(value);
      }
      if (toAppend !== null && toAppend !== undefined)
        formData.append(key, toAppend);
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
    // Intentar obtener geolocalización con
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
        // crear un objeto temporal con lat/lon y enviar inmediatamente
        const newForm = { ...form, latitude, longitude };
        setLocationLoading(false);
        setLocationAsked(true);
        setShowLocationDialog(false);
        // actualizar estado para consistencia visual
        setForm(newForm);
        submitForm(newForm);
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

        {/* Diálogo para preguntar si guardar ubicación (estilizado) */}
        <Dialog
          open={showLocationDialog}
          onClose={handleAskLocationConfirm}
          PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
          <DialogTitle sx={{ color: "#103E68", fontWeight: "bold" }}>
            ¿Deseas guardar tu ubicación?
          </DialogTitle>
          <DialogContent dividers>
            <DialogContentText sx={{ mb: 1, color: "text.secondary" }}>
              Podemos guardar tu ubicación (latitud y longitud) para ofrecer una
              mejor experiencia (mapas, recomendaciones locales). Si eliges
              guardar tu ubicación, ésta se almacenará junto con tu cuenta.
              Puedes revisar los{" "}
              <Link
                to="/terms"
                style={{ color: "#103E68", fontWeight: "bold" }}
              >
                Términos y Condiciones
              </Link>{" "}
              antes de continuar.
            </DialogContentText>
            {locationError && (
              <DialogContentText sx={{ color: "error.main", mt: 1 }}>
                {locationError}
              </DialogContentText>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleAskLocationSave}
              variant="contained"
              startIcon={
                locationLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : null
              }
              sx={{
                bgcolor: "#103E68",
                "&:hover": { bgcolor: "#35722b" },
                textTransform: "none",
                borderRadius: 3,
              }}
            >
              {locationLoading ? "Obteniendo..." : "Aceptar"}
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
