import React from "react";
import { Button, CircularProgress } from "@mui/material";

// Botón flexible: acepta label, loading, type y onClick opcional
const RegisterButton = ({
  label = "Enviar",
  loading = false,
  type = "button",
  onClick,
}) => (
  <Button
    type={type}
    fullWidth
    variant="contained"
    sx={{
      mt: 3,
      bgcolor: "#103E68",
      "&:hover": { bgcolor: "#35722b" },
      borderRadius: 3,
      fontWeight: "bold",
    }}
    disabled={loading}
    onClick={onClick}
  >
    {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : label}
  </Button>
);

export default RegisterButton;
