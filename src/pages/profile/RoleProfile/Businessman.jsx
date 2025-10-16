import React, { useState } from "react";
import { Box, Grid, TextField, Button, Typography } from "@mui/material";

const BusinessmanProfile = () => {
  const [values, setValues] = useState({
    business_name: "",
    description: "",
    contact: "",
    business_email: "",
  });

  const fields = [
    { name: "business_name", label: "Nombre del negocio" },
    { name: "description", label: "Descripción del negocio" },
    { name: "contact", label: "Contacto" },
    { name: "business_email", label: "Email del negocio" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes enviar `values` al servidor o al contexto/global store
    console.log("Guardar perfil de negocio:", values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Perfil de Empresario
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Aquí puedes gestionar la información específica relacionada con tu rol
        como empresario.
      </Typography>

      <Grid container spacing={2}>
        {fields.map((f) => (
          <Grid
            item
            xs={12}
            sm={f.name === "description" ? 12 : 6}
            key={f.name}
          >
            <TextField
              fullWidth
              label={f.label}
              name={f.name}
              value={values[f.name]}
              onChange={handleChange}
              multiline={f.name === "description"}
              minRows={f.name === "description" ? 3 : 1}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Button type="submit" variant="contained">
          Guardar
        </Button>
      </Box>
    </Box>
  );
};

export default BusinessmanProfile;
