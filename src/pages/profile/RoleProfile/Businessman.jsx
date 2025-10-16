import React from "react";

import { Box } from "@mui/material";

const BusinessmanProfile = () => {
  const fields = [
    { name: "business_name", label: "Nombre del negocio" },
    { name: "description", label: "Descripción del negocio" },
    { name: "contact", label: "Contacto" },
    { name: "business_email", label: "Email del negocio" },
  ];
  return (
    <Box>
      <h2>Perfil de Empresario</h2>
      <p>
        Aquí puedes gestionar la información específica relacionada con tu rol
        como empresario.
      </p>
      {/* Agrega más campos o componentes específicos para el rol de empresario */}
    </Box>
  );
};

export default BusinessmanProfile;
