import React from "react";
import { Button, CircularProgress } from "@mui/material";

const RegisterButton = ({ loading }) => (
  <Button
    type="submit"
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
  >
    {loading ? (
      <CircularProgress size={24} sx={{ color: "#fff" }} />
    ) : (
      "Registrarme"
    )}
  </Button>
);

export default RegisterButton;
