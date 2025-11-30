import React, { useState } from "react";
import {
  requestPasswordResetByPhone,
  verifyCodeAndResetPassword,
} from "../../../services/passwordReset";
import { Box, TextField, Button, Alert, Stack } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import showSweetAlert from "../../../utils/alert";
import { FormContainer } from "../../atoms/form";

export default function ResetByPhone() {
  const [step, setStep] = useState(1); // 1: solicitar, 2: verificar
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRequest(e) {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    
    const res = await requestPasswordResetByPhone(phone);
    setLoading(false);
    
    if (!res.ok) {
      setError(res.error || "Error al solicitar código");
      return;
    }
    setMsg(
      "Código enviado. Revisa el SMS (o la consola en dev). Si no llega, espera unos minutos."
    );
    setStep(2);
  }

  async function handleVerify(e) {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    
    const res = await verifyCodeAndResetPassword(phone, code, newPass);
    setLoading(false);
    
    if (!res.ok) {
      setError(res.error || "Error al verificar código");
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
    await showSweetAlert(
      "Éxito",
      "Contraseña actualizada correctamente",
      "success"
    );
    navigate("/login");
  }

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
      <FormContainer title="Recuperar Contraseña" variant="compact">
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {msg && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            {msg}
          </Alert>
        )}

        {step === 1 && (
          <Box
            component="form"
            onSubmit={handleRequest}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              fullWidth
              label="Teléfono (ej: +591 7XXXXXXX)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+591 70000000"
            />
            <Button 
              type="submit" 
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                bgcolor: "#103E68",
                "&:hover": { bgcolor: "#0d3254" },
                borderRadius: 2,
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              {loading ? "Enviando..." : "Enviar código"}
            </Button>
          </Box>
        )}

        {step === 2 && (
          <Box
            component="form"
            onSubmit={handleVerify}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              fullWidth
              label="Código (6 dígitos)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
            />
            <TextField
              fullWidth
              label="Nueva contraseña"
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
            <Stack direction="row" spacing={2}>
              <Button 
                variant="outlined" 
                onClick={() => setStep(1)}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                  borderColor: "#103E68",
                  color: "#103E68",
                }}
              >
                Volver
              </Button>
              <Button 
                variant="contained" 
                type="submit"
                disabled={loading}
                sx={{
                  flex: 1,
                  py: 1.5,
                  bgcolor: "#103E68",
                  "&:hover": { bgcolor: "#0d3254" },
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                {loading ? "Verificando..." : "Verificar"}
              </Button>
            </Stack>
          </Box>
        )}

        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Link to="/login" style={{ color: "#103E68", fontWeight: 600 }}>
            Volver al inicio de sesión
          </Link>
        </Box>
      </FormContainer>
    </Box>
  );
}
