import React from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { Link } from "react-router-dom";

const LoginPage = () => {
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
          maxWidth: 400,
          width: "100%",
          borderRadius: 3,
          textAlign: "center",
        }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="#103E68">
          Iniciar Sesión
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Bienvenido de nuevo a <strong>AgroVets</strong>
        </Typography>

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
          Ingresar
        </Button>

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
