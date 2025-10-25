import React, { useState } from "react";
import {
  requestPasswordResetByPhone,
  verifyCodeAndResetPassword,
} from "../../../services/passwordReset";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import showSweetAlert from "../../../utils/alert";

export default function ResetByPhone() {
  const [step, setStep] = useState(1); // 1: solicitar, 2: verificar
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleRequest(e) {
    e.preventDefault();
    setMsg("Enviando...");
    setError("");
    const res = await requestPasswordResetByPhone(phone);
    if (!res.ok) {
      setError(res.error || "Error al solicitar código");
      setMsg("");
      return;
    }
    setMsg(
      "Código enviado. Revisa el SMS (o la consola en dev). Si no llega, espera unos minutos."
    );
    setStep(2);
  }

  async function handleVerify(e) {
    e.preventDefault();
    setMsg("Verificando...");
    setError("");
    const res = await verifyCodeAndResetPassword(phone, code, newPass);
    if (!res.ok) {
      setError(res.error || "Error al verificar código");
      setMsg("");
      await showSweetAlert(
        "Error",
        res.error || "Error al verificar código",
        "error"
      );
      return;
    }
    setMsg("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
    setStep(1);
    setPhone("");
    setCode("");
    setNewPass("");
    // mostrar sweet alert y redirigir a login
    await showSweetAlert(
      "Éxito",
      "Contraseña actualizada correctamente",
      "success"
    );
    navigate("/login");
  }

  return (
    <Box sx={{ maxWidth: 480, mx: "auto", p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Recuperar contraseña por teléfono
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {msg && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {msg}
        </Alert>
      )}

      {step === 1 && (
        <Box
          component="form"
          onSubmit={handleRequest}
          sx={{ display: "grid", gap: 2 }}
        >
          <TextField
            label="Teléfono (ej: +505 9XXXX-XXXX)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button type="submit" variant="contained">
            Enviar código
          </Button>
        </Box>
      )}

      {step === 2 && (
        <Box
          component="form"
          onSubmit={handleVerify}
          sx={{ display: "grid", gap: 2 }}
        >
          <TextField
            label="Código (6 dígitos)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <TextField
            label="Nueva contraseña"
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" type="submit">
              Verificar y cambiar
            </Button>
            <Button variant="outlined" onClick={() => setStep(1)}>
              Volver
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
