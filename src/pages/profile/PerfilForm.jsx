import React from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import { Save } from "@mui/icons-material";
import BusinessmanProfile from "./RoleProfile/Businessman";
import SpecialistProfile from "./RoleProfile/Specialist";

const PerfilForm = ({ editing, form, onChange, onSave }) => {
  const fields = [
    { name: "bio", label: "Breve descripción" },
    { name: "phone_number", label: "Teléfono" },
  ];

  return (
    <Box sx={{ mt: 4 }}>
      <Box
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: 3,
          bgcolor: "white",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Stack spacing={2}>
          {fields.map((field, index) => (
            <Box key={field.name}>
              <Typography
                variant="subtitle2"
                sx={{ color: "text.secondary", mb: 0.5 }}
              >
                {field.label}
              </Typography>

              {editing ? (
                <TextField
                  fullWidth
                  size="small"
                  name={field.name}
                  value={form[field.name] || ""}
                  onChange={onChange}
                  multiline={field.name === "bio"}
                  rows={field.name === "bio" ? 3 : 1}
                />
              ) : (
                <Typography
                  variant={field.name === "bio" ? "body1" : "body2"}
                  sx={{
                    color: form[field.name] ? "text.primary" : "text.disabled",
                    whiteSpace: "pre-line",
                  }}
                >
                  {form[field.name] || "— Sin información —"}
                </Typography>
              )}

              {index < fields.length - 1 && (
                <Divider sx={{ my: 1.5, opacity: 0.3 }} />
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
                fontWeight: "bold",
              }}
              onClick={onSave}
            >
              Guardar cambios
            </Button>
          </Box>
        )}
      </Box>
      {!editing && (
        <Box sx={{ mt: 3 }}>
          {/* Comparaciones case-insensitive por si el backend devuelve 'Specialist' */}
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
