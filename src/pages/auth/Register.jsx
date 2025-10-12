import React, { useState } from "react";
import { Box, Typography, Paper, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import RegisterFormFields from "./RegisterFormFields";
import RegisterButton from "./RegisterButton";

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

  const handleChange = (e) => {
    if (e.target.type === "file") {
      setForm({ ...form, [e.target.name]: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validación básica
    if (
      !form.full_name ||
      !form.last_name ||
      !form.phone_number ||
      !form.password ||
      !form.role ||
      !form.bio ||
      !form.profile_picture
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }

    // DEBUG: Mostrar el contenido del FormData antes de enviar
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, value);
    });
    for (let pair of formData.entries()) {
      console.log(pair[0] + ":", pair[1]);
    }

    setLoading(true);
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
          Crear Cuenta
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <RegisterFormFields form={form} handleChange={handleChange} />
          <RegisterButton loading={loading} />
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
