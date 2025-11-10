import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Orb from "../atoms/Orb/Orb";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CancelIcon from "@mui/icons-material/Cancel";

const AVAChat = () => {
  const [liveActive, setLiveActive] = useState(false);
  const [micMuted, setMicMuted] = useState(false);

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const orbSize = isXs ? 160 : isSm ? 180 : 200;

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
        maxWidth={{ xs: 340, sm: 720, md: 960 }}
        sx={{
          mt: { xs: 8, md: 20 },
          backdropFilter: "blur(8px)",
          background: "rgba(9,14,25,0.45)",
          borderRadius: { xs: 2, md: 5 },
          boxShadow: "0 8px 40px rgba(2,6,23,0.6)",
          padding: { xs: 2, md: 3 },
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            placeholder="Ask anything..."
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: 2,
              input: { color: "#fff" },
              background: "rgba(255,255,255,0.03)",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "rgba(255, 255, 255, 0.08)",
              fontSize: { xs: "0.9rem", md: "1rem" },
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

      {/* Overlay con orb centrado cuando liveActive */}
      {liveActive && (
        <Box
          className="orb-overlay"
          onClick={() => {
            /* click fuera no cierra por ahora */
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={3}
            sx={{
              zIndex: 1500,
              position: "relative",
              pointerEvents: "auto",
            }}
          >
            <Orb
              size={orbSize}
              className="orb-center"
              style={{ pointerEvents: "none" }}
            />

            {/* Controls on top of orb */}
            <Box display="flex" gap={2} alignItems="center" sx={{ mt: 4 }}>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setMicMuted((p) => !p);
                }}
                sx={{
                  width: { xs: 48, md: 64 },
                  height: { xs: 48, md: 64 },
                  bgcolor: micMuted ? "#ff4b4b" : "#4ade80",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.45)",
                }}
              >
                {micMuted ? (
                  <MicOffIcon sx={{ color: "#fff" }} />
                ) : (
                  <MicIcon sx={{ color: "#fff" }} />
                )}
              </IconButton>

              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setLiveActive(false);
                }}
                sx={{
                  width: { xs: 48, md: 64 },
                  height: { xs: 48, md: 64 },
                  bgcolor: "#ff4b4b",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.45)",
                }}
              >
                <CancelIcon sx={{ color: "#fff" }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AVAChat;
