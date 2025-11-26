import { speechRecognitionService } from "./speechRecognitionService";
import { elevenLabsService } from "./elevenLabsService";

const ELEVEN_LABS_VOICE_ID = import.meta.env.VITE_ELEVEN_VOICE_ID || "IPgYtHTNLjC7Bq7IPHrm";

/**
 * Servicio de chat de voz
 * Integra reconocimiento de voz y síntesis de voz con ElevenLabs
 */
class VoiceChatService {
  constructor() {
    this.isListening = false;
    this.isSpeaking = false;
    this.listeners = {
      onTranscript: null,
      onResponse: null,
      onError: null,
      onStartListening: null,
      onStopListening: null,
      onStartSpeaking: null,
      onStopSpeaking: null,
    };
    this.audioContext = null;
    this.audioSource = null;
    this.analyser = null;
    
    this.setupSpeechRecognition();
  }

  /**
   * Configurar reconocimiento de voz
   */
  setupSpeechRecognition() {
    speechRecognitionService.on("onResult", (transcript) => {
      if (this.listeners.onTranscript) {
        this.listeners.onTranscript(transcript);
      }
      // Procesar la transcripción y generar respuesta
      this.processUserMessage(transcript);
    });

    speechRecognitionService.on("onError", (error) => {
      if (this.listeners.onError) {
        this.listeners.onError(error);
      }
    });

    speechRecognitionService.on("onStart", () => {
      this.isListening = true;
      if (this.listeners.onStartListening) {
        this.listeners.onStartListening();
      }
    });

    speechRecognitionService.on("onEnd", () => {
      this.isListening = false;
      if (this.listeners.onStopListening) {
        this.listeners.onStopListening();
      }
    });
  }

  /**
   * Registrar listeners
   */
  on(event, callback) {
    if (this.listeners.hasOwnProperty(event)) {
      this.listeners[event] = callback;
    }
  }

  /**
   * Procesar mensaje del usuario y generar respuesta
   */
  async processUserMessage(userMessage) {
    try {
      // Generar respuesta simple (puedes reemplazar esto con un servicio de IA más avanzado)
      const response = this.generateSimpleResponse(userMessage);
      
      if (this.listeners.onResponse) {
        this.listeners.onResponse(response);
      }

      // Convertir respuesta a voz
      await this.speak(response);
    } catch (error) {
      console.error("Error procesando mensaje:", error);
      if (this.listeners.onError) {
        this.listeners.onError(error);
      }
    }
  }

  /**
   * Generar respuesta simple (placeholder - puedes reemplazar con servicio de IA)
   */
  generateSimpleResponse(userMessage) {
    const message = userMessage.toLowerCase().trim();
    
    // Respuestas básicas según palabras clave
    if (message.includes("hola") || message.includes("buenos días") || message.includes("buenas tardes")) {
      return "Hola, ¿en qué puedo ayudarte hoy?";
    }
    
    if (message.includes("adiós") || message.includes("hasta luego") || message.includes("nos vemos")) {
      return "Hasta luego, que tengas un buen día.";
    }
    
    if (message.includes("gracias")) {
      return "De nada, estoy aquí para ayudarte.";
    }
    
    if (message.includes("cómo estás") || message.includes("qué tal")) {
      return "Estoy muy bien, gracias por preguntar. ¿En qué puedo asistirte?";
    }
    
    if (message.includes("ayuda") || message.includes("ayúdame")) {
      return "Por supuesto, estoy aquí para ayudarte. ¿Qué necesitas?";
    }
    
    // Respuesta por defecto
    return `Entiendo que dijiste: "${userMessage}". Estoy aquí para ayudarte con tus consultas sobre veterinaria y productos agropecuarios.`;
  }

  /**
   * Iniciar escucha
   */
  startListening() {
    if (!speechRecognitionService.getSupported()) {
      throw new Error("Reconocimiento de voz no soportado en este navegador");
    }

    if (this.isListening) {
      return;
    }

    try {
      speechRecognitionService.start();
    } catch (error) {
      console.error("Error iniciando reconocimiento:", error);
      throw error;
    }
  }

  /**
   * Detener escucha
   */
  stopListening() {
    speechRecognitionService.stop();
  }

  /**
   * Hablar texto usando ElevenLabs
   */
  async speak(text) {
    if (!text || text.trim().length === 0) {
      return;
    }

    try {
      this.isSpeaking = true;
      
      if (this.listeners.onStartSpeaking) {
        this.listeners.onStartSpeaking();
      }

      // Configurar análisis de audio para visualización
      const setupAudioAnalysis = (audioElement) => {
        try {
          if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          }

          if (!this.analyser) {
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
          }

          if (this.audioSource) {
            this.audioSource.disconnect();
          }

          this.audioSource = this.audioContext.createMediaElementSource(audioElement);
          this.audioSource.connect(this.analyser);
          this.analyser.connect(this.audioContext.destination);
        } catch (error) {
          console.warn("No se pudo configurar análisis de audio:", error);
        }
      };

      // Usar el voice ID de las variables de entorno
      await elevenLabsService.speak(text, ELEVEN_LABS_VOICE_ID, {
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
      }, setupAudioAnalysis);

      this.isSpeaking = false;
      
      if (this.listeners.onStopSpeaking) {
        this.listeners.onStopSpeaking();
      }
    } catch (error) {
      this.isSpeaking = false;
      console.error("Error hablando:", error);
      throw error;
    }
  }

  /**
   * Obtener analizador de audio para visualización
   */
  getAnalyser() {
    return this.analyser;
  }

  /**
   * Limpiar recursos
   */
  cleanup() {
    this.stopListening();
    
    if (this.audioContext) {
      this.audioContext.close().catch(console.error);
      this.audioContext = null;
    }
    
    this.audioSource = null;
    this.analyser = null;
  }

  /**
   * Verificar si está escuchando
   */
  getIsListening() {
    return this.isListening;
  }

  /**
   * Verificar si está hablando
   */
  getIsSpeaking() {
    return this.isSpeaking;
  }
}

// Exportar instancia singleton del servicio
export const voiceChatService = new VoiceChatService();

