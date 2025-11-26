import React from "react";
import { Box, Typography, Paper, IconButton, Alert } from "@mui/material";
import MicButton from "../../atoms/voice/MicButton";

/**
 * Molecule: Controles de voz
 * Combinación de componentes básicos
 */
const VoiceControls = ({
  isListening,
  isSpeaking,
  error,
  transcript,
  onToggleMic,
  statusText,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        backgroundColor: "#000000",
        minWidth: 200,
        maxWidth: 280,
        border: "none",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600, 
            color: "#ffffff",
            fontSize: "0.75rem",
            mb: 0.5,
            textAlign: "center"
          }}
        >
          {import.meta.env.VITE_AGENT_NAME || "AVAS"}
        </Typography>
        
        {/* Mensajes de error */}
        {error && (
          <Alert severity="error" sx={{ width: "100%", fontSize: "0.7rem", py: 0.5 }}>
            {error}
          </Alert>
        )}
        
        <MicButton
          isListening={isListening}
          onClick={onToggleMic}
          disabled={isSpeaking}
        />

        <Typography 
          variant="caption" 
          sx={{ 
            color: "#ffffff", 
            textAlign: "center",
            fontSize: "0.7rem",
            fontWeight: 500
          }}
        >
          {statusText}
        </Typography>
      </Box>
    </Paper>
  );
};

export default VoiceControls;


