import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import VoiceControls from "../../molecules/voice/VoiceControls";
import { audioAnalysisService } from "../../../services/voice/audioAnalysisService";
import { voiceChatService } from "../../../services/voice/voiceChatService";
import "./VoiceAgent.css";

const VoiceAgent = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [error, setError] = useState(null);
  
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const hasSpokenInitialRef = useRef(false);
  const smoothedAudioRef = useRef(0);

  // Framer motion spring physics values for smooth, zero-stutter animation
  const rawScale = useMotionValue(1.0);
  const rawBrightness = useMotionValue(1.0);
  const rawGlow = useMotionValue(0.35);

  const scale = useSpring(rawScale, { stiffness: 180, damping: 22, mass: 0.5 });
  const brightness = useSpring(rawBrightness, { stiffness: 180, damping: 22, mass: 0.5 });
  const glowOpacity = useSpring(rawGlow, { stiffness: 180, damping: 22, mass: 0.5 });

  const filterStyle = useTransform(
    brightness,
    (b) => `brightness(${b}) drop-shadow(0 0 35px rgba(11, 209, 194, 0.45))`
  );
  const ringOpacityStyle = useTransform(glowOpacity, (g) => g * 0.65);

  // Configurar listeners del servicio al montar
  useEffect(() => {
    voiceChatService.on("onTranscript", (transcript) => {
      console.log("👤 Usuario dijo:", transcript);
      setTranscript(transcript);
    });

    voiceChatService.on("onResponse", (response) => {
      console.log("🤖 IA respondió:", response);
      setAiResponse(response);
    });

    voiceChatService.on("onError", (error) => {
      console.error("❌ Error:", error);
      setError(`Error: ${error}`);
    });

    voiceChatService.on("onStartListening", () => {
      setIsListening(true);
      setError(null);
    });

    voiceChatService.on("onStopListening", () => {
      setIsListening(false);
    });

    voiceChatService.on("onStartSpeaking", () => {
      setIsSpeaking(true);
      analyserRef.current = voiceChatService.getAnalyser();
    });

    voiceChatService.on("onStopSpeaking", () => {
      setIsSpeaking(false);
      analyserRef.current = null;
    });

    // Mensaje inicial de bienvenida
    const welcomeMessage = async () => {
      if (!hasSpokenInitialRef.current) {
        hasSpokenInitialRef.current = true;
        try {
          const agentPresentation = import.meta.env.VITE_AGENT_PRESENTATION || 
            "Hola hackathones Nicaragua, soy AVAS, tu Asistente Agropecuario Virtual, estoy aquí para revolucionar la salud animal, y que nunca más un productor, agricultor o dueño de animales quede sin una respuesta inmediata, ayudando a salvar millones de vidas animales";
          await voiceChatService.speak(`${agentPresentation}. Presiona el micrófono para comenzar.`);
        } catch (err) {
          console.warn("No se pudo reproducir mensaje inicial:", err);
        }
      }
    };

    const timer = setTimeout(welcomeMessage, 500);

    return () => {
      clearTimeout(timer);
      voiceChatService.cleanup();
    };
  }, []);

  // Audio analysis loop with exponential LERP smoothing & zero React state re-render overhead
  useEffect(() => {
    let animationFrameId;

    const analyzeAudio = () => {
      let targetAudio = 0;
      if (analyserRef.current) {
        targetAudio = audioAnalysisService.getAudioLevel(analyserRef.current);
      }

      // Exponential LERP smoothing factor (0.16 for soft fluid transitions)
      const lerpSpeed = 0.16;
      smoothedAudioRef.current += (targetAudio - smoothedAudioRef.current) * lerpSpeed;
      const smoothed = smoothedAudioRef.current;

      // Non-linear power scaling for a natural audio response
      const audioBoost = Math.min(Math.pow(smoothed * 3.2, 0.82), 1.0);

      if (isListening || isSpeaking) {
        rawScale.set(1.0 + audioBoost * 0.28);
        rawBrightness.set(1.0 + audioBoost * 0.45);
        rawGlow.set(0.45 + audioBoost * 0.55);
      } else {
        rawScale.set(1.0);
        rawBrightness.set(1.0);
        rawGlow.set(0.35);
      }

      animationFrameId = requestAnimationFrame(analyzeAudio);
    };

    animationFrameId = requestAnimationFrame(analyzeAudio);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isListening, isSpeaking, rawScale, rawBrightness, rawGlow]);

  // Configurar análisis de audio del micrófono cuando se inicia la grabación
  useEffect(() => {
    if (isListening) {
      audioAnalysisService.setupMicrophoneAnalysis()
        .then((analyser) => {
          analyserRef.current = analyser;
        })
        .catch((err) => {
          console.warn("No se pudo configurar análisis de audio:", err);
        });
    } else if (!isSpeaking) {
      analyserRef.current = null;
      audioAnalysisService.cleanup();
    }
  }, [isListening, isSpeaking]);

  const toggleMic = async () => {
    try {
      if (isSpeaking) {
        setError("Espera a que termine de hablar");
        return;
      }

      if (isListening) {
        voiceChatService.stopListening();
        setIsListening(false);
        analyserRef.current = null;
        smoothedAudioRef.current = 0;
        rawScale.set(1.0);
        rawBrightness.set(1.0);
        rawGlow.set(0.35);
        audioAnalysisService.cleanup();
        setTranscript("");
        setAiResponse("");
        setError(null);
      } else {
        setError(null);
        setTranscript("");
        setAiResponse("");
        
        try {
          voiceChatService.startListening();
        } catch (err) {
          console.error("Error iniciando reconocimiento:", err);
          setError(`Error al iniciar el micrófono: ${err.message}`);
          setIsListening(false);
        }
      }
    } catch (err) {
      console.error("Error en toggleMic:", err);
      setError(`Error: ${err.message}`);
      setIsListening(false);
      analyserRef.current = null;
      smoothedAudioRef.current = 0;
      rawScale.set(1.0);
      rawBrightness.set(1.0);
      rawGlow.set(0.35);
      audioAnalysisService.cleanup();
    }
  };

  const getStatusText = () => {
    if (error) return "Error";
    if (isSpeaking) return "IA hablando...";
    if (isListening) return "Escuchando...";
    return "Presiona el micrófono para comenzar";
  };

  return (
    <Box className="voice-agent-container">
      {/* Orbe de voz con levitación orgánica y aura fluida */}
      <Box className="orb-container">
        <motion.div
          className="orb-wrapper"
          animate={{
            y: isSpeaking ? [0, -12, 0] : isListening ? [0, -8, 0] : [0, -16, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            y: {
              duration: isSpeaking ? 2.2 : isListening ? 1.8 : 4.0,
              repeat: Infinity,
              ease: "easeInOut",
            },
            scale: {
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          {/* Aura brillante de fondo */}
          <motion.div
            className={`orb-glow-aura ${isSpeaking ? 'speaking' : isListening ? 'listening' : error ? 'error' : ''}`}
            style={{
              scale: scale,
              opacity: glowOpacity,
            }}
          />

          {/* Anillo de pulso secundario */}
          <motion.div
            className="orb-glow-ring"
            style={{
              scale: scale,
              opacity: ringOpacityStyle,
            }}
          />

          {/* GIF del Orbe con escalado ultra fluido via Spring Physics */}
          <motion.img
            src="https://i.imgur.com/pESjsss.gif"
            alt="AI Orb"
            className="orb-image"
            style={{
              scale: scale,
              filter: filterStyle,
            }}
          />
        </motion.div>
      </Box>

      {/* Controles */}
      <Box className="controls-container">
        <VoiceControls
          isListening={isListening}
          isSpeaking={isSpeaking}
          error={error}
          transcript={transcript || aiResponse}
          onToggleMic={toggleMic}
          statusText={getStatusText()}
        />
      </Box>
    </Box>
  );
};

export default VoiceAgent;

