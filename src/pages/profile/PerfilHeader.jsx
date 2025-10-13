import React from "react";
import { Box, Avatar, Typography, IconButton } from "@mui/material";
import { Edit, Cancel } from "@mui/icons-material";

const PerfilHeader = ({ user, editing, setEditing }) => {
  const handleEditToggle = () => setEditing((prev) => !prev);

  return (
    <>
      {/* Portada */}
      <Box
        sx={{
          height: { xs: 120, sm: 160 },
          backgroundImage: `
            linear-gradient(120deg, #E8F5E9 0%, #C8E6C9 100%),
            repeating-radial-gradient(
              circle at 20% 20%,
              rgba(102,187,106,0.2),
              rgba(56,142,60,0.2) 40px,
              transparent 40px,
              transparent 80px
            )
          `,
          backgroundBlendMode: "multiply",
          backgroundSize: "160px 160px",
          backgroundPosition: "0 0, 80px 80px",
          position: "relative",
        }}
      />

      {/* Info principal */}
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          mt: { xs: -7, sm: -8 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "center", sm: "flex-end" },
          gap: 2,
        }}
      >
        <Avatar
          src={user.profile_picture}
          alt={user.full_name}
          sx={{
            width: { xs: 90, sm: 120 },
            height: { xs: 90, sm: 120 },
            border: "4px solid white",
            fontSize: 40,
          }}
        >
          {!user.profile_picture &&
            `${user.full_name?.[0] || ""}${user.last_name?.[0] || ""}`}
        </Avatar>

        <Box sx={{ flexGrow: 1, textAlign: { xs: "center", sm: "left" } }}>
          <Typography variant="h6" fontWeight="bold" color="#103E68">
            {user.full_name} {user.last_name}
          </Typography>
          <Typography color="text.secondary">
            {user.role === "Specialist" && "Especialista Veterinario"}
            {user.role === "businessman" && "Negocio Agropecuario"}
            {user.role === "consumer" && "Consumidor"}
          </Typography>
        </Box>

        <IconButton color="primary" onClick={handleEditToggle}>
          {editing ? <Cancel /> : <Edit />}
        </IconButton>
      </Box>
    </>
  );
};

export default PerfilHeader;
