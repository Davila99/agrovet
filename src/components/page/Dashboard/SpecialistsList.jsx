import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSpecialists } from "./hooks/useSpecialists";
import { SpecialistCard } from "./components/SpecialistCard";

const SpecialistsList = ({ onSelectSpecialist, searchQuery, professionFilter = null }) => {
  const navigate = useNavigate();
  const currentId = localStorage.getItem("userId");
  
  const { loading, error, users, specialistsCount } = useSpecialists(professionFilter, searchQuery, currentId);

  const mainGreen = "#2E7D32";
  const background = "#F1F8F5";
  const textDark = "#1B1B1B";

  const handleConsult = (u) => {
    import("sweetalert2").then(({ default: Swal }) => {
      Swal.fire({
        title: "Atención",
        text: "Solo tienes derecho a 2 mensajes antes de que el especialista responda.",
        icon: "info",
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        position: "top-end"
      });
    });
    onSelectSpecialist ? onSelectSpecialist(u) : navigate(`/consult/${u.id}`);
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", marginTop: 80, display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: background, borderRight: "1px solid #c8e6c9", height: "100%" }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: "110%", p: 2, backgroundColor: background, borderRight: "1px solid #c8e6c9", height: "100%" }}>
        <Typography color="error">Error cargando especialistas: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", backgroundColor: background }}>
      <Box sx={{
        flex: 1, overflowY: "auto", overflowX: "hidden", p: { xs: 1, sm: 1.5 }, pb: 8, scrollBehavior: "smooth",
        width: "100%", minWidth: 0, maxWidth: "100%", boxSizing: "border-box",
        "&::-webkit-scrollbar": { width: "8px" },
        "&::-webkit-scrollbar-thumb": { backgroundColor: "#a5d6a7", borderRadius: "4px" },
        "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#81c784" },
      }}>
        {users.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
            <Typography variant="body2" sx={{ mb: 1 }}>No hay especialistas disponibles</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {professionFilter 
                ? `No se encontraron especialistas con profesión "${professionFilter}"`
                : specialistsCount > 0 
                ? "El único especialista encontrado eres tú" 
                : "No se encontraron usuarios con rol de especialista"}
            </Typography>
          </Box>
        ) : (
          users.map((u) => (
            <SpecialistCard
              key={u.id}
              specialist={u}
              onClick={() => navigate(`/perfil?userId=${u.id}`)}
              onConsult={() => handleConsult(u)}
              mainGreen={mainGreen}
              textDark={textDark}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default SpecialistsList;
