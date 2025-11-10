import React, { useState } from "react";
import { Box, Typography, TextField, IconButton, Button } from "@mui/material";
import Orb from "../atoms/Orb/Orb";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CancelIcon from "@mui/icons-material/Cancel";

const AVAChat = () => {
  const [liveActive, setLiveActive] = useState(false);
  const [micMuted, setMicMuted] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <Box
      position="relative"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="center"
      minHeight="93vh"
      sx={{ background: "linear-gradient(180deg,#070816 0%, #06102a 60%)" }}
      p={4}
    >
      {/*media luna */}

      {/* Hero text */}
      <Box zIndex={1} textAlign="center" maxWidth={920} mt={6}>
        <Typography
          variant="h3"
          sx={{ color: "#ffffff", fontWeight: 700, mb: 1 }}
        >
          {getGreeting()}, soy AVA, tu asistente virtual de AgroVets.
        </Typography>
        <Typography sx={{ color: "#cbd5e1", mb: 3 }}>
          Estoy aquí para ayudarte con información sobre salud animal y
          productividad. ¡Pregúntame lo que quieras!
        </Typography>
      </Box>

      {/* Chat panel (translucent) */}
      <Box
        zIndex={1}
        width="100%"
        maxWidth={960}
        sx={{
          mt: 20,
          backdropFilter: "blur(8px)",
          background: "rgba(9,14,25,0.45)",
          borderRadius: 5,
          boxShadow: "0 8px 40px rgba(2,6,23,0.6)",
          padding: 3,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "rgba(255, 255, 255, 0.1)",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            placeholder="Ask anything..."
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: 5,
              input: { color: "#fff" },
              background: "rgba(255,255,255,0.03)",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
          />
          <IconButton
            onClick={() => setLiveActive(true)}
            sx={{
              ml: 1,
              bgcolor: "linear-gradient(135deg, #6a11cb, #2575fc)",
              color: "#fff",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            <MicIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Orb central */}
      {liveActive && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={4}
          mt={4}
        >
          {/* Usamos el nuevo componente Orb */}
          <Orb size={120} />

          {/* Botones circulares debajo */}
          <Box display="flex" gap={3}>
            <IconButton
              onClick={() => setMicMuted((prev) => !prev)}
              sx={{
                width: 56,
                height: 56,
                bgcolor: micMuted ? "#ff4b4b" : "#4ade80",
                "&:hover": { transform: "scale(1.1)" },
              }}
            >
              {micMuted ? (
                <MicOffIcon sx={{ color: "#fff" }} />
              ) : (
                <MicIcon sx={{ color: "#fff" }} />
              )}
            </IconButton>
            <IconButton
              onClick={() => setLiveActive(false)}
              sx={{
                width: 56,
                height: 56,
                bgcolor: "#ff4b4b",
                "&:hover": { transform: "scale(1.1)" },
              }}
            >
              <CancelIcon sx={{ color: "#fff" }} />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AVAChat;
