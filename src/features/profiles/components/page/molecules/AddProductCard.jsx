import React from "react";
import { Box, Card, IconButton, Typography } from "@mui/material";
import { Add, CameraAlt } from "@mui/icons-material";

const AddProductCard = ({ onClick }) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 2,
        bgcolor: "transparent",
        border: "2px dashed #00c6a7",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.3s ease",
        height: "100%",
        minHeight: "140px",
        boxShadow: "none",
        "&:hover": {
          bgcolor: "rgba(0, 198, 167, 0.05)",
          borderColor: "#00c6a7",
          transform: "scale(1.02)",
        },
      }}
    >
      <IconButton
        size="small"
        sx={{
          bgcolor: "rgba(0, 198, 167, 0.1)",
          mb: 0.5,
          width: 36,
          height: 36,
          "&:hover": {
            bgcolor: "rgba(0, 198, 167, 0.2)",
          },
        }}
      >
        <CameraAlt sx={{ fontSize: 22, color: "#00c6a7" }} />
      </IconButton>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Add sx={{ fontSize: 14, color: "#00c6a7" }} />
        <Typography variant="caption" sx={{ color: "#00c6a7", fontWeight: 600, fontSize: "0.7rem" }}>
          Agregar
        </Typography>
      </Box>
    </Card>
  );
};

export default AddProductCard;

