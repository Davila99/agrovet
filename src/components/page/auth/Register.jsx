import React, { useState } from "react";
import {
  Box,
  Typography,
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
import { authAPI } from "../../../services/endpoints";
import { FormContainer } from "../../atoms/form";

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
    specialist_profile: {
      profession: "",
    },
    businessman_profile: {
      business_type: "",
    },
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

    // Manejar campos anidados como specialist_profile.profession
    if (e.target.name.includes('.')) {
      const [parent, child] = e.target.name.split('.');
      setForm((prevForm) => {
        const newForm = {
          ...prevForm,
          [parent]: {
            ...(prevForm[parent] || {}),
            [child]: e.target.value
          }
        };
        // Si se establece una profesión, asegurar que el role sea Specialist
        if (parent === "specialist_profile" && child === "profession" && e.target.value) {
          newForm.role = "Specialist";
        }
        return newForm;
      });
      return;
    }

    setForm((prevForm) => ({
      ...prevForm,
      [e.target.name]: e.target.value
    }));

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

      // Manejar specialist_profile como objeto anidado
      // Enviar profession como specialist_profile_profession para que el backend lo reconozca
      if (key === "specialist_profile" && value && typeof value === "object") {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (subValue !== null && subValue !== undefined && subValue !== "") {
            // El backend espera specialist_profile_profession en lugar de specialist_profile.profession
            if (subKey === "profession") {
              formData.append("specialist_profile_profession", subValue);
            } else {
              formData.append(`specialist_profile.${subKey}`, subValue);
            }
          }
        });
        return;
      }

      // Manejar businessman_profile como objeto anidado
      // Enviar business_type como businessman_profile_business_type para que el backend lo reconozca
      if (key === "businessman_profile" && value && typeof value === "object") {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (subValue !== null && subValue !== undefined && subValue !== "") {
            // El backend espera businessman_profile_business_type en lugar de businessman_profile.business_type
            if (subKey === "business_type") {
              formData.append("businessman_profile_business_type", subValue);
            } else {
              formData.append(`businessman_profile.${subKey}`, subValue);
            }
          }
        });
        return;
      }

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

    // Combine country code and phone number if both exist
    if (source.country_code && source.phone_number) {
      // Remove country_code from formData if it was added (optional, but cleaner)
      formData.delete("country_code");
      // Overwrite phone_number with combined value
      formData.set("phone_number", `${source.country_code} ${source.phone_number}`);
    }

    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      console.log("Registro exitoso:", res);

      // Auto-join communities based on role (best effort, don't block registration)
      if (res.user && res.user.role) {
        try {
          const { autoJoinCommunitiesByRole } = await import('../../../utils/Foro/autoJoinCommunities');
          await autoJoinCommunitiesByRole(res.user.role);
        } catch (err) {
          console.warn('Failed to auto-join communities:', err);
          // Don't block registration if this fails
        }
      }

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
      if (!form.full_name || !form.last_name || !form.phone_number) {
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
      // Validar que si es especialista (Veterinario, Agrónomo, Zootecnista), tenga profesión seleccionada
      const isSpecialistRole = form.role === "Specialist" ||
        form.specialist_profile?.profession === "Veterinario" ||
        form.specialist_profile?.profession === "Agrónomo" ||
        form.specialist_profile?.profession === "Zootecnista";
      if (isSpecialistRole && !form.specialist_profile?.profession) {
        setError("Debes seleccionar una profesión");
        return false;
      }

      // Validar que si es businessman (Agroveterinaria, Empresa Agropecuaria), tenga business_type seleccionado
      const isBusinessmanRole = form.role === "businessman" ||
        form.businessman_profile?.business_type === "Agroveterinaria" ||
        form.businessman_profile?.business_type === "Empresa Agropecuaria";
      if (isBusinessmanRole && !form.businessman_profile?.business_type) {
        setError("Debes seleccionar un tipo de negocio");
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
        p: { xs: 2, sm: 3 },
      }}
    >
      <FormContainer title="Crear Cuenta" variant="standard">
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <RegisterFormFields
            form={form}
            handleChange={handleChange}
            step={step}
          />

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
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
          onClose={handleAskLocationConfirm}
          PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
          <DialogTitle sx={{ color: "#103E68", fontWeight: 700 }}>
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
                style={{ color: "#103E68", fontWeight: 600 }}
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
                "&:hover": { bgcolor: "#0d3254" },
                textTransform: "none",
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              {locationLoading ? "Obteniendo..." : "Aceptar"}
            </Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" style={{ color: "#103E68", fontWeight: 600 }}>
              Inicia sesión
            </Link>
          </Typography>
        </Box>
      </FormContainer>
    </Box>
  );
};

export default RegisterPage;
