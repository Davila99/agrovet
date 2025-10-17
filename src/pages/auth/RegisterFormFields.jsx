import React from "react";
import {
  TextField,
  Avatar,
  Button,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";

const renderPasswordRequirement = (pwd, regex, text) => {
  const ok = pwd && regex.test(pwd);
  return (
    <Box key={text} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {ok ? (
        <CheckCircleIcon sx={{ color: "success.main", fontSize: 18 }} />
      ) : (
        <CancelIcon sx={{ color: "error.main", fontSize: 18 }} />
      )}
      <Typography
        variant="body2"
        sx={{ color: ok ? "text.primary" : "text.secondary" }}
      >
        {text}
      </Typography>
    </Box>
  );
};

const RegisterFormFields = ({ form, handleChange, step = 1 }) => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {step === 1 && (
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ margin: "16px 0", textAlign: "left" }}>
            <label
              style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}
            >
              Foto de perfil
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar
                src={
                  form.profile_picture &&
                  typeof form.profile_picture === "object"
                    ? URL.createObjectURL(form.profile_picture)
                    : undefined
                }
                alt={form.full_name || "Perfil"}
                sx={{ width: 80, height: 80, bgcolor: "#e0e0e0" }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  accept="image/*"
                  id="profile-picture"
                  type="file"
                  name="profile_picture"
                  onChange={handleChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="profile-picture">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<PhotoCamera />}
                    sx={{ textTransform: "none" }}
                  >
                    {form.profile_picture ? "Cambiar foto" : "Agregar foto"}
                  </Button>
                </label>

                {form.profile_picture && (
                  <IconButton
                    aria-label="Eliminar foto"
                    color="error"
                    onClick={() =>
                      handleChange({
                        target: {
                          type: "file",
                          name: "profile_picture",
                          files: [],
                        },
                      })
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </div>
            </div>
          </div>

          <TextField
            fullWidth
            label="Nombre"
            margin="normal"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Apellido"
            margin="normal"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Número de teléfono"
            margin="normal"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
          />
        </div>
      )}

      {step === 2 && (
        <div style={{ width: "100%", maxWidth: 400 }}>
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            margin="normal"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Confirmar contraseña"
            type="password"
            margin="normal"
            name="confirm_password"
            value={form.confirm_password || ""}
            onChange={handleChange}
            error={
              form.confirm_password && form.password !== form.confirm_password
            }
            helperText={
              form.confirm_password && form.password !== form.confirm_password
                ? "Las contraseñas no coinciden"
                : ""
            }
          />
          {/* Feedback de requisitos de contraseña */}
          <Box sx={{ textAlign: "left", mt: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Requisitos de la contraseña:
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {renderPasswordRequirement(
                form.password,
                /.{8,}/,
                "Al menos 8 caracteres"
              )}
              {renderPasswordRequirement(
                form.password,
                /[A-Z]/,
                "Una letra mayúscula"
              )}
              {renderPasswordRequirement(
                form.password,
                /[a-z]/,
                "Una letra minúscula"
              )}
            </Box>
          </Box>
          <TextField
            select
            fullWidth
            label="Perfil"
            name="role"
            value={form.role}
            onChange={handleChange}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="Specialist">Especialista</option>
            <option value="businessman">Negocio</option>
            <option value="consumer">Consumidor</option>
          </TextField>
          <TextField
            fullWidth
            label="Sobre Mi"
            name="bio"
            value={form.bio}
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
};

export default RegisterFormFields;
