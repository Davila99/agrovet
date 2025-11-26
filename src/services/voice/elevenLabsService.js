import axios from "axios";

const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVEN_KEY;
const ELEVEN_LABS_API_URL = "https://api.elevenlabs.io/v1";

// Validar configuración al cargar el módulo
if (!ELEVEN_LABS_API_KEY) {
  console.warn("⚠️ VITE_ELEVEN_KEY no está configurada. El servicio de voz no funcionará.");
  console.warn("Crea un archivo .env.local en frontend/agrovet/ con: VITE_ELEVEN_KEY=tu_api_key");
  console.warn("IMPORTANTE: Reinicia el servidor de desarrollo después de crear/modificar .env.local");
} else {
  console.log("✅ VITE_ELEVEN_KEY cargada correctamente");
  const keyPreview = ELEVEN_LABS_API_KEY.substring(0, 10) + "..." + ELEVEN_LABS_API_KEY.substring(ELEVEN_LABS_API_KEY.length - 5);
  console.log(`   Key preview: ${keyPreview}`);
}

/**
 * Servicio de ElevenLabs para síntesis de voz
 * Sigue arquitectura de microservicios
 * Basado en la documentación oficial de ElevenLabs: https://elevenlabs.io/docs/api-reference/text-to-speech
 */
class ElevenLabsService {
  constructor() {
    // Limpiar espacios en blanco y asegurar formato correcto
    // Remover todos los espacios, saltos de línea, tabs, etc.
    this.apiKey = ELEVEN_LABS_API_KEY 
      ? ELEVEN_LABS_API_KEY.trim().replace(/[\s\r\n\t]+/g, '').replace(/['"]/g, '')
      : null;
    this.baseURL = ELEVEN_LABS_API_URL;
    
    // Validación adicional en desarrollo
    if (this.apiKey && import.meta.env.DEV) {
      // Verificar que no tenga caracteres invisibles o problemas comunes
      const hasInvalidChars = /[\r\n\t]/.test(this.apiKey);
      if (hasInvalidChars) {
        console.warn("⚠️ La API key contiene caracteres de control. Asegúrate de copiarla correctamente.");
      }
      
      // Verificar formato de ElevenLabs (debe comenzar con 'sk_')
      if (!this.apiKey.startsWith('sk_')) {
        console.warn("⚠️ La API key no comienza con 'sk_'. Verifica que sea una key válida de ElevenLabs.");
      }
      
      // Verificar longitud mínima (las keys de ElevenLabs suelen tener ~40+ caracteres)
      if (this.apiKey.length < 20) {
        console.warn(`⚠️ La API key parece muy corta (${this.apiKey.length} caracteres). Verifica que sea correcta.`);
      } else if (this.apiKey.length > 100) {
        console.warn(`⚠️ La API key parece muy larga (${this.apiKey.length} caracteres). Verifica que no tenga espacios o caracteres extra.`);
      }
      
      // Log de la key limpia para debugging
      console.log(`🔑 API Key procesada: ${this.apiKey.substring(0, 10)}...${this.apiKey.substring(this.apiKey.length - 5)} (${this.apiKey.length} chars)`);
    }
  }

  /**
   * Validar que la API key esté configurada
   */
  validateConfig() {
    if (!this.apiKey) {
      throw new Error("API Key de ElevenLabs no configurada. Agrega VITE_ELEVEN_KEY en tu archivo .env.local");
    }
    return true;
  }

  /**
   * Obtener lista de voces disponibles
   * @returns {Promise<Object>} Lista de voces disponibles
   */
  async getVoices() {
    this.validateConfig();
    
    // Debug: Verificar formato de la API key
    const keyLength = this.apiKey.length;
    const keyPrefix = this.apiKey.substring(0, 3);
    
    if (!this.apiKey.startsWith('sk_')) {
      console.warn("⚠️ La API key no comienza con 'sk_'. Verifica que sea correcta.");
    }
    
    try {
      const response = await axios.get(`${this.baseURL}/voices`, {
        headers: {
          "xi-api-key": this.apiKey.trim(),
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching voices:", error);
      
      if (error.response?.status === 401) {
        console.error("❌ Error 401: API Key rechazada por ElevenLabs");
        console.error(`   Key enviada (primeros 10 chars): ${this.apiKey.substring(0, 10)}...`);
        console.error(`   Key length: ${this.apiKey.length}`);
        console.error(`   Response status: ${error.response?.status}`);
        console.error(`   Response data:`, error.response?.data);
        
        throw new Error("API Key de ElevenLabs inválida o no autorizada. Verifica VITE_ELEVEN_KEY en tu archivo .env.local");
      }
      throw error;
    }
  }

  /**
   * Convertir texto a voz
   * Basado en la documentación oficial: https://elevenlabs.io/docs/api-reference/text-to-speech
   * 
   * @param {string} text - Texto a convertir a voz
   * @param {string} voiceId - ID de la voz (opcional, usa por defecto)
   * @param {object} options - Opciones adicionales
   * @param {string} options.modelId - Modelo a usar (default: "eleven_multilingual_v2")
   * @param {string} options.outputFormat - Formato de salida (default: "mp3_44100_128")
   * @param {number} options.stability - Estabilidad de la voz (0-1, default: 0.5)
   * @param {number} options.similarityBoost - Boost de similitud (0-1, default: 0.75)
   * @param {number} options.style - Estilo de la voz (0-1, default: 0.0)
   * @param {boolean} options.useSpeakerBoost - Usar boost de speaker (default: true)
   * @returns {Promise<ArrayBuffer>} Audio data como ArrayBuffer
   */
  async textToSpeech(text, voiceId = null, options = {}) {
    this.validateConfig();

    // Usar voiceId por defecto si no se proporciona
    const finalVoiceId = voiceId || "JBFqnCBsd6RMkjVDRZzb"; // Voz por defecto recomendada
    
    if (!finalVoiceId || finalVoiceId === "null" || finalVoiceId === "undefined") {
      throw new Error("VoiceId inválido");
    }
    
    // Configuración según documentación oficial
    const requestBody = {
      text,
      model_id: options.modelId || "eleven_multilingual_v2",
      voice_settings: {
        stability: options.stability !== undefined ? options.stability : 0.5,
        similarity_boost: options.similarityBoost !== undefined ? options.similarityBoost : 0.75,
        style: options.style !== undefined ? options.style : 0.0,
        use_speaker_boost: options.useSpeakerBoost !== false,
      },
    };

    // Agregar output_format si se especifica
    if (options.outputFormat) {
      requestBody.output_format = options.outputFormat;
    }
    
    // Limpiar y validar la API key antes de enviarla
    const cleanApiKey = this.apiKey ? this.apiKey.trim() : null;
    if (!cleanApiKey) {
      throw new Error("API Key de ElevenLabs no configurada");
    }
    
    // Debug: Verificar formato de la key antes de enviar
    if (!cleanApiKey.startsWith('sk_')) {
      console.warn("⚠️ La API key no comienza con 'sk_'. Verifica que sea correcta.");
    }
    
    try {
      const response = await axios.post(
        `${this.baseURL}/text-to-speech/${finalVoiceId}`,
        requestBody,
        {
          headers: {
            "xi-api-key": cleanApiKey,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in text-to-speech:", error);
      
      if (error.response) {
        if (error.response.status === 401) {
          // Log adicional para debugging
          console.error("❌ Error 401: API Key rechazada por ElevenLabs");
          console.error(`   Key enviada (primeros 15 chars): ${cleanApiKey ? cleanApiKey.substring(0, 15) : 'N/A'}...`);
          console.error(`   Key length: ${cleanApiKey ? cleanApiKey.length : 0}`);
          console.error(`   Response status: ${error.response?.status}`);
          
          // Intentar leer el mensaje de error de la respuesta (puede ser ArrayBuffer o JSON)
          let errorDetail = "API Key inválida o no autorizada";
          let errorMessage = "";
          try {
            if (error.response.data) {
              // Si es ArrayBuffer, convertirlo a texto
              if (error.response.data instanceof ArrayBuffer) {
                const decoder = new TextDecoder();
                const errorText = decoder.decode(error.response.data);
                console.error(`   Response message (ArrayBuffer): ${errorText}`);
                errorMessage = errorText;
              } else if (typeof error.response.data === 'string') {
                console.error(`   Response message (string): ${error.response.data}`);
                errorMessage = error.response.data;
              } else {
                const errorJson = JSON.stringify(error.response.data);
                console.error(`   Response message (JSON): ${errorJson}`);
                errorMessage = errorJson;
              }
              
              // Buscar mensajes específicos de ElevenLabs
              if (errorMessage.includes('Unauthorized') || errorMessage.includes('invalid') || errorMessage.includes('Invalid')) {
                errorDetail = "La API Key es inválida o ha expirado. Verifica tu clave en https://elevenlabs.io/app/settings/api-keys";
              } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
                errorDetail = "Has alcanzado el límite de tu plan de ElevenLabs. Verifica tu cuota en https://elevenlabs.io/app";
              } else if (errorMessage) {
                errorDetail = `Mensaje de ElevenLabs: ${errorMessage.substring(0, 200)}`;
              }
            }
          } catch (e) {
            console.error("   Error al parsear respuesta:", e);
          }
          
          throw new Error(`API Key de ElevenLabs inválida o no autorizada. ${errorDetail}. Verifica VITE_ELEVEN_KEY en tu archivo .env.local y reinicia el servidor de desarrollo.`);
        } else if (error.response.status === 404) {
          throw new Error(`Voz no encontrada (ID: ${finalVoiceId}). Verifica el voiceId.`);
        } else {
          const errorMessage = error.response.data?.detail?.message || error.response.data?.message || error.message;
          throw new Error(`Error de ElevenLabs (${error.response.status}): ${errorMessage}`);
        }
      }
      throw error;
    }
  }

  /**
   * Reproducir audio desde ArrayBuffer
   * @param {ArrayBuffer} audioData - Datos de audio
   * @returns {Promise<void>}
   */
  async playAudio(audioData) {
    return new Promise((resolve, reject) => {
      try {
        const blob = new Blob([audioData], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        
        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        
        audio.onerror = (error) => {
          URL.revokeObjectURL(url);
          reject(error);
        };
        
        audio.play();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Convertir texto a voz y reproducir con callback para análisis de audio
   * 
   * @param {string} text - Texto a convertir
   * @param {string} voiceId - ID de la voz (opcional)
   * @param {object} options - Opciones adicionales
   * @param {Function} onAudioReady - Callback cuando el audio está listo para análisis
   * @returns {Promise<void>}
   */
  async speak(text, voiceId = null, options = {}, onAudioReady) {
    try {
      // Usar configuración por defecto según documentación oficial
      const audioData = await this.textToSpeech(text, voiceId, {
        modelId: options.modelId || "eleven_multilingual_v2",
        outputFormat: options.outputFormat || "mp3_44100_128",
        stability: options.stability,
        similarityBoost: options.similarityBoost,
        style: options.style,
        useSpeakerBoost: options.useSpeakerBoost,
      });
      
      const blob = new Blob([audioData], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.crossOrigin = "anonymous";
      
      return new Promise((resolve, reject) => {
        let audioReadyCalled = false;
        
        const handleLoadedData = () => {
          if (onAudioReady && !audioReadyCalled) {
            audioReadyCalled = true;
            setTimeout(() => {
              onAudioReady(audio);
            }, 100);
          }
        };
        
        audio.addEventListener('loadeddata', handleLoadedData);
        audio.addEventListener('canplay', handleLoadedData);
        
        if (audio.readyState >= 2) {
          handleLoadedData();
        }
        
        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        
        audio.onerror = (error) => {
          console.error("Audio playback error:", error);
          URL.revokeObjectURL(url);
          reject(error);
        };
        
        audio.play().catch((err) => {
          console.error("Error playing audio:", err);
          if (err.name === 'NotAllowedError') {
            console.warn("Audio autoplay blocked. User interaction required.");
          }
          reject(err);
        });
      });
    } catch (error) {
      console.error("Error speaking:", error);
      throw error;
    }
  }
}

// Exportar instancia singleton del servicio
export const elevenLabsService = new ElevenLabsService();

// Exportar funciones de conveniencia para compatibilidad
export const getVoices = () => elevenLabsService.getVoices();
export const textToSpeech = (text, voiceId, options) => elevenLabsService.textToSpeech(text, voiceId, options);
export const speak = (text, voiceId, options, onAudioReady) => elevenLabsService.speak(text, voiceId, options, onAudioReady);
