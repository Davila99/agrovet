import React, { useState } from "react";
import { Box, Typography, Paper, Alert, Stack } from "@mui/material";
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
    last_name: "",
    role: "",
    bio: "",
    profile_picture: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 o 2

  const handleChange = (e) => {
    if (e.target.type === "file") {
      setForm({ ...form, [e.target.name]: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
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
      if (!form.password || !form.role || !form.bio) {
        setError("Completa contraseña, perfil y sobre mi");
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

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
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
            {step === 2 ? (
              <RegisterButton label="Atrás" type="button" onClick={prevStep} />
            ) : (
              <RegisterButton label="" type="button" onClick={() => {}} />
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
