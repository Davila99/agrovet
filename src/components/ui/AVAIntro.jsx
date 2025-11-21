import React, { useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  Button,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import ImgOne from "../../assets/image/banner2.webp";
import ChatBot from "../page/HomePage/ChatBot";

// subtle float animation for the inner circle
const float = {
  animate: { y: [0, -8, 0] },
  transition: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
};

// slow pulse for the outer liquid halo
const pulse = {
  animate: { scale: [1, 1.16, 1], opacity: [0.95, 0.5, 0.95] },
  transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
};

const AVAIntro = () => {
  const [open, setOpen] = useState(false);
  const [inChat, setInChat] = useState(false);

  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [recChunks, setRecChunks] = useState([]);
  const [recUrl, setRecUrl] = useState(null);
  const [liveMode, setLiveMode] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const handleOpen = () => {
    setOpen(true);
    setInChat(false);
  };
  const handleClose = () => setOpen(false);
  const handleStartChat = () => setInChat(true);

  // start/stop basic MediaRecorder (if available)
  const toggleRecording = async () => {
    if (recording) {
      // stop
      if (mediaRecorder) mediaRecorder.stop();
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecChunks(chunks);
        setRecUrl(url);
        // stop tracks
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setMediaRecorder(mr);
      setRecording(true);
    } catch (err) {
      console.warn("No se pudo acceder al micrófono:", err);
    }
  };

  const enterLive = () => {
    setLiveMode(true);
  };

  const exitLive = () => {
    setLiveMode(false);
  };

  return (
    <Box
      id="ava-hero"
      sx={{
        width: "100%",
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* background image (carousel image) */}
      <Box
        component="img"
        src={ImgOne}
        alt="fondo"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.44) saturate(0.95)",
          zIndex: 0,
        }}
      />

      {/* decorative soft blurred blobs for a liquid feel */}
      <Box sx={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
        <motion.div
          style={{
            position: "absolute",
            width: 420,
            height: 300,
            left: "10%",
            top: "8%",
            borderRadius: "40%",
            filter: "blur(36px)",
            background:
              "radial-gradient(circle at 30% 30%, rgba(90,200,160,0.18), rgba(50,110,220,0.06))",
            mixBlendMode: "screen",
            transform: "translateZ(0)",
          }}
          {...pulse}
        />
        <motion.div
          style={{
            position: "absolute",
            width: 360,
            height: 260,
            right: "8%",
            bottom: "6%",
            borderRadius: "40%",
            filter: "blur(42px)",
            background:
              "radial-gradient(circle at 70% 70%, rgba(200,150,255,0.14), rgba(30,160,120,0.04))",
            mixBlendMode: "screen",
            transform: "translateZ(0)",
          }}
          {...pulse}
        />
      </Box>

      {/* top search pill */}
      <Box
        sx={{
          position: "absolute",
          top: 28,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            bgcolor: "rgba(255,255,255,0.06)",
            px: 3,
            py: 1.1,
            borderRadius: 99,
            minWidth: 360,
            boxShadow: "0 10px 40px rgba(2,6,23,0.45)",
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "#fff",
              opacity: 0.12,
            }}
          />
          <Typography sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
            Pregunta cualquier cosa
          </Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.06)", color: "#fff" }}
          >
            <MicIcon />
          </IconButton>
        </Box>
      </Box>

      {/* central input with write / record / live actions */}
      <Box sx={{ position: "relative", zIndex: 4, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ width: ["92%","72%","48%"], mx: 2 }}>
          <TextField
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe tu pregunta o presiona grabar..."
            variant="filled"
            InputProps={{
              sx: { bgcolor: "rgba(255,255,255,0.06)", color: "#fff", borderRadius: 3, px: 2 },
              startAdornment: (
                <InputAdornment position="start">
                  <Box sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Escribir</Box>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <IconButton onClick={toggleRecording} sx={{ color: recording ? "#ff6b6b" : "#fff", bgcolor: recording ? "rgba(255,107,107,0.12)" : "transparent" }}>
                      <MicIcon />
                    </IconButton>
                    <Button variant="contained" color="secondary" onClick={enterLive} sx={{ ml: 1 }}>
                      Live
                    </Button>
                  </Box>
                </InputAdornment>
              ),
            }}
          />
          {recording && (
            <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1, color: "#ff6b6b" }}>
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#ff6b6b", boxShadow: "0 0 8px rgba(255,107,107,0.6)" }} />
              <Typography variant="body2">Grabando... presiona mic para detener</Typography>
            </Box>
          )}
          {recUrl && (
            <Box sx={{ mt: 1 }}>
              <audio controls src={recUrl} />
            </Box>
          )}
        </Box>
      </Box>

      {/* Modal AVA LIVE */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        {inChat ? (
          <DialogContent sx={{ height: "70vh", p: 0 }}>
            <ChatBot />
          </DialogContent>
        ) : (
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
              py: 4,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {greeting()}, Jasson
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", textAlign: "center" }}
            >
              ¿En qué puedo ayudarte hoy?
            </Typography>
            <Box sx={{ width: "100%", mt: 1 }}>
              <Box
                sx={{
                  bgcolor: "#f6f7fb",
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                  boxShadow: "inset 0 1px 0 rgba(0,0,0,0.03)",
                }}
              >
                <Typography sx={{ color: "text.secondary" }}>
                  Escribe tu pregunta aquí...
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleStartChat}
              >
                Comenzar
              </Button>
              <Button variant="outlined" onClick={handleClose}>
                Cerrar
              </Button>
            </Box>
          </DialogContent>
        )}
      </Dialog>

      {/* Fullscreen live sphere overlay */}
      {liveMode && (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)" }}>
          <Box sx={{ position: "absolute", top: 24, right: 24 }}>
            <Button variant="contained" color="inherit" onClick={exitLive}>Salir</Button>
          </Box>
          <motion.div
            initial={{ scale: 0.2, rotateY: 0 }}
            animate={{ scale: [1, 1.02, 1], rotate: 360 }}
            transition={{ duration: 6, loop: Infinity, ease: "linear" }}
            style={{
              width: 340,
              height: 340,
              borderRadius: "50%",
              background: "radial-gradient(circle at 30% 30%, #4fe3b9, #1b6b53 60%)",
              boxShadow: "0 30px 80px rgba(8,20,44,0.6), inset 0 -10px 40px rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              perspective: 1000,
            }}
          >
            {/* inner glossy core */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 220,
                height: 220,
                borderRadius: "50%",
                background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), rgba(255,255,255,0.02)), linear-gradient(135deg,#7ef3d0 0%, #077a5c 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#002",
                fontWeight: 800,
                fontSize: 16,
                transformStyle: "preserve-3d",
                boxShadow: "0 12px 40px rgba(2,6,23,0.5), inset 0 6px 30px rgba(255,255,255,0.08)",
              }}
            >
              <Box sx={{ color: "#fff", fontWeight: 800 }}>AVA LIVE</Box>
            </motion.div>
          </motion.div>
        </Box>
      )}
    </Box>
  );
};

export default AVAIntro;
