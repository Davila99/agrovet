import React from "react";
import { IconButton } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";

/**
 * Atom: Botón de micrófono
 * Componente básico reutilizable
 */
const MicButton = ({ isListening, onClick, disabled, ...props }) => {
  return (
    <IconButton
      onClick={onClick}
      disabled={disabled}
      sx={{
        width: 50,
        height: 50,
        backgroundColor: isListening ? "#f44336" : "#2E7D32",
        color: "white",
        borderRadius: "50%",
        "&:hover": {
          backgroundColor: isListening ? "#d32f2f" : "#1B5E20",
        },
        "&:disabled": {
          backgroundColor: "#9e9e9e",
        },
        transition: "all 0.3s ease",
        boxShadow: isListening
          ? "0 2px 8px rgba(244, 67, 54, 0.4)"
          : "0 2px 8px rgba(46, 125, 50, 0.3)",
        ...props.sx,
      }}
      {...props}
    >
      {isListening ? (
        <MicIcon sx={{ fontSize: 24 }} />
      ) : (
        <MicOffIcon sx={{ fontSize: 24 }} />
      )}
    </IconButton>
  );
};

export default MicButton;


