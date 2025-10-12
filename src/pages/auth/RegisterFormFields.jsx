import React from "react";
import { TextField } from "@mui/material";

const RegisterFormFields = ({ form, handleChange }) => (
  <div
    style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
  >
    <div
      style={{
        margin: "16px 0",
        textAlign: "left",
        width: "100%",
        maxWidth: 400,
      }}
    >
      <label style={{ fontWeight: "bold", display: "block", marginBottom: 4 }}>
        Foto de perfil
      </label>
      <input
        type="file"
        name="profile_picture"
        accept="image/*"
        onChange={handleChange}
        style={{ display: "block" }}
      />
      {form.profile_picture && typeof form.profile_picture === "object" && (
        <img
          src={URL.createObjectURL(form.profile_picture)}
          alt="Vista previa"
          style={{
            marginTop: 8,
            maxWidth: 120,
            borderRadius: 8,
          }}
        />
      )}
    </div>
    <div style={{ width: "100%", maxWidth: 400 }}>
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
        SelectProps={{
          native: true,
        }}
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
  </div>
);

export default RegisterFormFields;
