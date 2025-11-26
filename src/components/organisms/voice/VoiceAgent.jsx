import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
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
  const [audioLevel, setAudioLevel] = useState(0);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const hasSpokenInitialRef = useRef(false);

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
      // Usar el analizador del servicio para visualización
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

    // Esperar un momento antes del mensaje inicial
    const timer = setTimeout(welcomeMessage, 500);

    return () => {
      clearTimeout(timer);
      voiceChatService.cleanup();
    };
  }, []);

  // Loop de análisis de audio en tiempo real
  useEffect(() => {
    const analyzeAudio = () => {
      if (analyserRef.current) {
        const level = audioAnalysisService.getAudioLevel(analyserRef.current);
        setAudioLevel(level);
      } else {
        setAudioLevel(0);
      }
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    };

    if (isListening || isSpeaking) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    } else {
      setAudioLevel(0);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening, isSpeaking]);

  // Configurar análisis de audio del micrófono cuando se inicia la grabación
  useEffect(() => {
    if (isListening) {
      // Configurar análisis de audio del micrófono para el pulso visual
      audioAnalysisService.setupMicrophoneAnalysis()
        .then((analyser) => {
          analyserRef.current = analyser;
        })
        .catch((err) => {
          console.warn("No se pudo configurar análisis de audio:", err);
        });
    } else {
      analyserRef.current = null;
      audioAnalysisService.cleanup();
    }
  }, [isListening]);

  const toggleMic = async () => {
    try {
      // No permitir iniciar si estamos hablando
      if (isSpeaking) {
        setError("Espera a que termine de hablar");
        return;
      }

      if (isListening) {
        // Detener grabación
        voiceChatService.stopListening();
        setIsListening(false);
        analyserRef.current = null;
        setAudioLevel(0);
        audioAnalysisService.cleanup();
        setTranscript("");
        setAiResponse("");
        setError(null);
      } else {
        // Limpiar cualquier error previo
        setError(null);
        setTranscript("");
        setAiResponse("");
        
        // Iniciar grabación de audio
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
      setAudioLevel(0);
      audioAnalysisService.cleanup();
    }
  };

  const getStatusText = () => {
    if (error) return "Error";
    if (isSpeaking) return "IA hablando...";
    if (isListening) return "Escuchando...";
    return "Presiona el micrófono para comenzar";
  };

  // Calcular escala basada en el nivel de audio
  const minScale = 1.0;
  const maxScale = 1.3;
  const currentScale = isListening || isSpeaking 
    ? minScale + (audioLevel * (maxScale - minScale))
    : minScale;

  // Calcular brillo basado en el nivel de audio
  const minBrightness = 0.9;
  const maxBrightness = 1.4;
  const currentBrightness = isListening || isSpeaking
    ? minBrightness + (audioLevel * (maxBrightness - minBrightness))
    : minBrightness;

  return (
    <Box className="voice-agent-container">
      {/* Orbe de voz - GIF flotando sobre el micrófono */}
      <Box className="orb-container">
        <motion.img
          src="https://i.imgur.com/pESjsss.gif"
          alt="AI Orb"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          animate={{
            scale: currentScale,
            filter: `brightness(${currentBrightness})`,
          }}
          transition={{
            duration: 0.1,
            ease: "linear"
          }}
        />
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
