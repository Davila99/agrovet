/**
 * Servicio de análisis de audio
 * Sigue arquitectura de microservicios
 */
class AudioAnalysisService {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.stream = null;
  }

  /**
   * Configurar análisis de audio desde stream de micrófono
   */
  async setupMicrophoneAnalysis() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.source = this.audioContext.createMediaStreamSource(this.stream);

      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      this.source.connect(this.analyser);
      
      return this.analyser;
    } catch (error) {
      console.error("Error setting up microphone analysis:", error);
      throw error;
    }
  }

  /**
   * Configurar análisis de audio desde elemento HTML Audio
   */
  setupAudioElementAnalysis(audioElement) {
    if (!audioElement) return null;

    try {
      let ctx = this.audioContext;
      if (!ctx || ctx.state === 'closed') {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.audioContext = ctx;
      }
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const source = ctx.createMediaElementSource(audioElement);
      const analyser = ctx.createAnalyser();
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      source.connect(analyser);
      analyser.connect(ctx.destination);
      
      return analyser;
    } catch (error) {
      console.error("Error setting up audio element analysis:", error);
      // Intentar crear contexto nuevo
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const source = ctx.createMediaElementSource(audioElement);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyser.connect(ctx.destination);
        return analyser;
      } catch (e) {
        console.error("Failed to create fallback analyser:", e);
        return null;
      }
    }
  }

  /**
   * Obtener nivel de audio (0-1)
   */
  getAudioLevel(analyser) {
    if (!analyser) return 0;

    const buffer = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(buffer);
    const avg = buffer.reduce((s, v) => s + v, 0) / (buffer.length * 255);
    return avg;
  }

  /**
   * Limpiar recursos
   */
  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.source = null;
  }
}

// Exportar instancia singleton del servicio
export const audioAnalysisService = new AudioAnalysisService();



