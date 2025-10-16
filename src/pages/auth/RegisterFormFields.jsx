import React from "react";
import { TextField, Avatar, Button, IconButton } from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";

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
            <option value="businessman">Negocio Agropecuario</option>
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
