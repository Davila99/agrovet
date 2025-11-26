import React from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  Typography,
  Divider,
  Paper,
} from "@mui/material";
import { Save } from "@mui/icons-material";
import BusinessmanProfile from "./RoleProfile/Businessman";
import SpecialistProfile from "./RoleProfile/Specialist";

const PerfilForm = ({ editing, form, onChange, onSave }) => {
  const isBusinessman = (form.role || "").toString().toLowerCase() === "businessman";
  
  const fields = [
    { name: "bio", label: "Breve descripción" },
    { name: "phone_number", label: "Teléfono" },
  ];
  
  // Agregar campos de ubicación para businessman
  if (isBusinessman && editing) {
    fields.push(
      { name: "latitude", label: "Latitud", type: "number" },
      { name: "longitude", label: "Longitud", type: "number" }
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Card de Información Personal */}
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          bgcolor: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            transform: "translateY(-2px)",
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#103E68",
            mb: 2,
            fontSize: "1.25rem",
          }}
        >
          Información Personal
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2.5}>
          {fields.map((field, index) => (
            <Box key={field.name}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "text.secondary",
                  mb: 1,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                {field.label}
              </Typography>

              {editing ? (
                <TextField
                  fullWidth
                  size="small"
                  name={field.name}
                  type={field.type || "text"}
                  value={form[field.name] || ""}
                  onChange={onChange}
                  multiline={field.name === "bio"}
                  rows={field.name === "bio" ? 4 : 1}
                  inputProps={field.type === "number" ? { step: "any" } : {}}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              ) : (
                <Typography
                  variant={field.name === "bio" ? "body1" : "body2"}
                  sx={{
                    color: form[field.name] ? "text.primary" : "text.disabled",
                    whiteSpace: "pre-line",
                    lineHeight: 1.7,
                    p: form[field.name] ? 1.5 : 0,
                    bgcolor: form[field.name] ? "#f8f9fa" : "transparent",
                    borderRadius: 2,
                  }}
                >
                  {form[field.name] || "— Sin información —"}
                </Typography>
              )}

              {index < fields.length - 1 && (
                <Divider sx={{ my: 2, opacity: 0.2 }} />
              )}
            </Box>
          ))}
        </Stack>

        {editing && (
          <Box textAlign="right" mt={3}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                },
              }}
              onClick={onSave}
            >
              Guardar cambios
            </Button>
          </Box>
        )}
      </Paper>

      {/* Card de Información Profesional */}
      {!editing && (
        <Box>
          {(form.role || "").toString().toLowerCase() === "businessman" && (
            <BusinessmanProfile user={form} />
          )}
          {(form.role || "").toString().toLowerCase() === "specialist" && (
            <SpecialistProfile user={form} />
          )}
        </Box>
      )}
    </Box>
  );
};

export default PerfilForm;
