import React from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f7fa",
        p: 2,
      }}>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          maxWidth: 450,
          width: "100%",
          borderRadius: 3,
          textAlign: "center",
        }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="#103E68">
          Crear Cuenta
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Únete a la comunidad <strong>AgroVets</strong>
        </Typography>

        <TextField fullWidth label="Nombre completo" margin="normal" />
        <TextField
          fullWidth
          label="Correo electrónico"
          type="email"
          margin="normal"
        />
        <TextField
          fullWidth
          label="Contraseña"
          type="password"
          margin="normal"
        />
        <TextField
          fullWidth
          label="Confirmar contraseña"
          type="password"
          margin="normal"
        />

        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            bgcolor: "#103E68",
            "&:hover": { bgcolor: "#35722b" },
            borderRadius: 3,
            fontWeight: "bold",
          }}>
          Registrarme
        </Button>

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
