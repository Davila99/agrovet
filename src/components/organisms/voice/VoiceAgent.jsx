import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import VoiceControls from "../../molecules/voice/VoiceControls";
import { speechRecognitionService } from "../../../services/voice/speechRecognitionService";
import { elevenLabsService } from "../../../services/voice/elevenLabsService";
import { audioAnalysisService } from "../../../services/voice/audioAnalysisService";
import "./VoiceAgent.css";

const VoiceAgent = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

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

  useEffect(() => {
    // Configurar listeners del servicio de reconocimiento
    speechRecognitionService.on("onResult", (text) => {
      // Solo procesar si no estamos hablando y hay texto válido
      if (!isSpeaking && text && text.trim().length > 0) {
        setTranscript(text);
        // Procesar el texto y generar una respuesta con ElevenLabs
        handleAIResponse(text);
      }
    });

    speechRecognitionService.on("onError", (err) => {
      if (err !== "no-speech") {
        setError(`Error de reconocimiento: ${err}`);
      }
    });

    speechRecognitionService.on("onStart", () => {
      // Solo iniciar escucha si no estamos hablando
      if (!isSpeaking) {
        setIsListening(true);
        setError(null);
      }
    });

    speechRecognitionService.on("onEnd", () => {
      // Solo detener si no estamos hablando
      if (!isSpeaking) {
        setIsListening(false);
      }
    });

    return () => {
      // Limpiar al desmontar
      if (isListening) {
        speechRecognitionService.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioAnalysisService.cleanup();
    };
  }, [isSpeaking]);

  const handleAIResponse = async (userText) => {
    // Evitar procesar si ya estamos hablando
    if (isSpeaking) {
      return;
    }

    try {
      setIsSpeaking(true);
      setTranscript(""); // Limpiar transcript para no mostrar lo que dijo el usuario
      
      // Detener el reconocimiento mientras hablamos para evitar bucles
      if (isListening) {
        speechRecognitionService.stop();
        setIsListening(false);
      }
      
      // Generar respuesta de IA (por ahora una respuesta simple, pero puedes integrar con tu API de IA)
      // TODO: Integrar con servicio de IA real para generar respuestas contextuales
      let aiResponse = "";
      
      // Respuestas básicas según el contexto
      const lowerText = userText.toLowerCase().trim();
      
      if (lowerText.includes("hola") || lowerText.includes("buenos días") || lowerText.includes("buenas tardes")) {
        aiResponse = "Hola, ¿en qué puedo ayudarte hoy?";
      } else if (lowerText.includes("adiós") || lowerText.includes("hasta luego") || lowerText.includes("chao")) {
        aiResponse = "Hasta luego, que tengas un buen día.";
      } else if (lowerText.includes("gracias")) {
        aiResponse = "De nada, estoy aquí para ayudarte.";
      } else if (lowerText.includes("ayuda") || lowerText.includes("ayúdame")) {
        aiResponse = "Claro, puedo ayudarte con información sobre productos agrícolas, veterinarios y servicios relacionados con el agro. ¿Qué necesitas?";
      } else {
        // Respuesta genérica sin repetir lo que dijo el usuario
        aiResponse = "Entendido. ¿Hay algo más en lo que pueda ayudarte?";
      }
      
      // Generar audio con ElevenLabs
      await elevenLabsService.speak(aiResponse, null, {}, (audioElement) => {
        audioRef.current = audioElement;
        
        // Esperar a que el audio esté listo antes de configurar el análisis
        const setupAnalysis = () => {
          try {
            const analyser = audioAnalysisService.setupAudioElementAnalysis(audioElement);
            if (analyser) {
              analyserRef.current = analyser;
            }
          } catch (err) {
            console.warn("No se pudo configurar análisis de audio:", err);
          }
        };

        // Intentar configurar cuando el audio esté listo
        if (audioElement.readyState >= 2) {
          // Pequeño delay para asegurar que el audio esté conectado
          setTimeout(setupAnalysis, 100);
        } else {
          audioElement.addEventListener('loadeddata', () => {
            setTimeout(setupAnalysis, 100);
          }, { once: true });
          audioElement.addEventListener('canplay', () => {
            setTimeout(setupAnalysis, 100);
          }, { once: true });
        }
        
        audioElement.onended = () => {
          setIsSpeaking(false);
          analyserRef.current = null;
          audioRef.current = null;
          setAudioLevel(0);
          // Reiniciar el reconocimiento después de que termine de hablar
          // pero solo si el usuario no lo detuvo manualmente
          setTimeout(() => {
            if (!isListening && !isSpeaking) {
              // No reiniciar automáticamente, esperar a que el usuario presione el micrófono
            }
          }, 500);
        };
      });
    } catch (err) {
      console.error("Error en respuesta de IA:", err);
      setError(`Error al generar respuesta: ${err.message}`);
      setIsSpeaking(false);
      analyserRef.current = null;
      setAudioLevel(0);
    }
  };

  const toggleMic = async () => {
    try {
      // No permitir iniciar si estamos hablando
      if (isSpeaking) {
        setError("Espera a que termine de hablar");
        return;
      }

      if (isListening) {
        speechRecognitionService.stop();
        setIsListening(false);
        analyserRef.current = null;
        setAudioLevel(0);
        audioAnalysisService.cleanup();
        setTranscript(""); // Limpiar transcript al detener
      } else {
        // Limpiar cualquier error previo
        setError(null);
        setTranscript(""); // Limpiar transcript al iniciar
        
        // Configurar análisis de audio del micrófono para el pulso
        const analyser = await audioAnalysisService.setupMicrophoneAnalysis();
        analyserRef.current = analyser;
        
        speechRecognitionService.start();
      }
    } catch (err) {
      setError(`Error al ${isListening ? "detener" : "iniciar"} el micrófono: ${err.message}`);
      setIsListening(false);
      analyserRef.current = null;
      setAudioLevel(0);
    }
  };

  const getStatusText = () => {
    if (error) return "Error";
    if (isSpeaking) return "IA hablando...";
    if (isListening) return "Escuchando...";
    return "Presiona el micrófono para comenzar";
  };

  // Calcular escala basada en el nivel de audio
  // Mapear audioLevel (0-1) a escala (minScale - maxScale)
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
          transcript={transcript}
          onToggleMic={toggleMic}
          statusText={getStatusText()}
        />
      </Box>
    </Box>
  );
};

export default VoiceAgent;
