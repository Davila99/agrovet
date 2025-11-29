/**
 * Servicio de reconocimiento de voz
 * Sigue arquitectura de microservicios
 */
class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.isSupported = false;
    this.isListening = false;
    this.listeners = {
      onResult: null,
      onError: null,
      onStart: null,
      onEnd: null,
    };
    
    this.initialize();
  }

  /**
   * Inicializar el servicio de reconocimiento
   */
  initialize() {
    if (typeof window !== "undefined") {
      this.isSupported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
      
      if (this.isSupported) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = "es-ES";

        this.setupEventHandlers();
      }
    }
  }

  /**
   * Configurar manejadores de eventos
   */
  setupEventHandlers() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.listeners.onStart) {
        this.listeners.onStart();
      }
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      const newTranscript = finalTranscript || interimTranscript;
      if (newTranscript && newTranscript.trim().length > 0 && this.listeners.onResult) {
        this.listeners.onResult(newTranscript.trim());
      }
    };

    this.recognition.onerror = (event) => {
      // Ignorar "no-speech" ya que es normal
      if (event.error === "no-speech") {
        return;
      }

      this.isListening = false;
      
      if (this.listeners.onError) {
        this.listeners.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      
      // Reiniciar si aún debería estar escuchando
      if (this.shouldBeListening) {
        try {
          this.recognition.start();
        } catch (e) {
          if (e.name !== "InvalidStateError") {
            console.error("Error restarting recognition:", e);
          }
        }
      }
      
      if (this.listeners.onEnd) {
        this.listeners.onEnd();
      }
    };
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
   * Iniciar reconocimiento
   */
  start() {
    if (!this.isSupported || !this.recognition) {
      throw new Error("Reconocimiento de voz no soportado en este navegador");
    }

    if (this.isListening) {
      return;
    }

    try {
      this.shouldBeListening = true;
      this.recognition.start();
    } catch (e) {
      if (e.name !== "InvalidStateError") {
        console.error("Error starting recognition:", e);
        throw e;
      }
    }
  }

  /**
   * Detener reconocimiento
   */
  stop() {
    if (!this.recognition) return;

    this.shouldBeListening = false;
    try {
      this.recognition.stop();
    } catch (e) {
      // Ignorar errores al detener
    }
    this.isListening = false;
  }

  /**
   * Verificar si está soportado
   */
  getSupported() {
    return this.isSupported;
  }

  /**
   * Verificar si está escuchando
   */
  getListening() {
    return this.isListening;
  }
}

// Exportar instancia singleton del servicio
export const speechRecognitionService = new SpeechRecognitionService();








