import React, { useState } from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  Typography,
  Divider,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Save, Edit, Close } from "@mui/icons-material";
import BusinessmanProfile from "./RoleProfile/Businessman";
import SpecialistProfile from "./RoleProfile/Specialist";

const PerfilForm = ({ form, onChange, onSave, isOwnProfile = false }) => {
  const [editingPersonal, setEditingPersonal] = useState(false);
  const isBusinessman = (form.role || "").toString().toLowerCase() === "businessman";
  
  // Campos editables
  const editableFields = [
    { name: "bio", label: "Breve descripción" },
  ];
  
  // Campos de solo lectura
  const readOnlyFields = [
    { name: "phone_number", label: "Teléfono" },
  ];
  
  // Agregar coordenadas como solo lectura para businessman
  if (isBusinessman) {
    readOnlyFields.push(
      { name: "latitude", label: "Latitud" },
      { name: "longitude", label: "Longitud" }
    );
  }

  const handleSavePersonal = async () => {
    // Llamar onSave con 'personal' para indicar que solo guardamos info personal
    await onSave('personal');
    setEditingPersonal(false);
  };

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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#103E68",
              fontSize: "1rem",
            }}
          >
            Información Personal
          </Typography>
          {isOwnProfile && !editingPersonal && (
            <Tooltip title="Editar información personal">
              <IconButton
                size="small"
                onClick={() => setEditingPersonal(true)}
                sx={{
                  color: "#1877F2",
                  bgcolor: "rgba(24, 119, 242, 0.08)",
                  "&:hover": {
                    bgcolor: "rgba(24, 119, 242, 0.15)",
                  },
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {editingPersonal && (
            <Tooltip title="Cancelar edición">
              <IconButton
                size="small"
                onClick={() => setEditingPersonal(false)}
                sx={{
                  color: "#666",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.08)",
                  },
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2.5}>
          {/* Campos editables */}
          {editableFields.map((field, index) => (
            <Box key={field.name}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "text.secondary",
                  mb: 0.75,
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                {field.label}
              </Typography>

              {editingPersonal ? (
                <TextField
                  fullWidth
                  size="small"
                  name={field.name}
                  type={field.type || "text"}
                  value={form[field.name] || ""}
                  onChange={onChange}
                  multiline={field.name === "bio"}
                  rows={field.name === "bio" ? 4 : 1}
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

              {index < editableFields.length - 1 && (
                <Divider sx={{ my: 2, opacity: 0.2 }} />
              )}
            </Box>
          ))}

          {/* Campos de solo lectura */}
          {readOnlyFields.length > 0 && <Divider sx={{ my: 2, opacity: 0.2 }} />}
          {readOnlyFields.map((field, index) => (
            <Box key={field.name}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "text.secondary",
                  mb: 0.75,
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                {field.label}
              </Typography>
              <Typography
                variant="body2"
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
              {index < readOnlyFields.length - 1 && (
                <Divider sx={{ my: 2, opacity: 0.2 }} />
              )}
            </Box>
          ))}
        </Stack>

        {editingPersonal && (
          <Box textAlign="right" mt={3}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<Save />}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.8rem",
                px: 2,
                py: 0.75,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                },
              }}
              onClick={handleSavePersonal}
            >
              Guardar cambios
            </Button>
          </Box>
        )}
      </Paper>

      {/* Card de Información Profesional/Negocio */}
      <Box>
        {(form.role || "").toString().toLowerCase() === "businessman" && (
          <BusinessmanProfile 
            user={form} 
            isOwnProfile={isOwnProfile}
            onChange={onChange}
            onSave={onSave}
          />
        )}
        {(form.role || "").toString().toLowerCase() === "specialist" && (
          <SpecialistProfile user={form} />
        )}
      </Box>
    </Box>
  );
};

export default PerfilForm;
