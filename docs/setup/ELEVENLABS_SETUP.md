# Configuración de ElevenLabs API

## ✅ API Key Configurada

La API key ha sido configurada en el archivo `.env.local`:
```
VITE_ELEVEN_KEY=sk_7461aeac13a650c40bd61f9a2438ced37e3db82f0c5e7415
```

## 📚 Documentación de Referencia

Esta implementación sigue la documentación oficial de ElevenLabs:
- [API Reference](https://elevenlabs.io/docs/api-reference/text-to-speech)
- [SDK Documentation](https://elevenlabs.io/docs)

## 🏗️ Arquitectura

### Microservicios
- **Servicio**: `src/services/voice/elevenLabsService.js`
- **Patrón**: Singleton class
- **Responsabilidad**: Comunicación con la API de ElevenLabs

### Atomic Design
- **Atom**: `src/components/atoms/voice/MicButton.jsx`
- **Molecule**: `src/components/molecules/voice/VoiceControls.jsx`
- **Organism**: `src/components/organisms/voice/VoiceAgent.jsx`
- **Page**: `src/components/page/AIAgent/AIAgentPage.jsx`

## 🔧 Uso del Servicio

### Ejemplo básico:
```javascript
import { elevenLabsService } from '@/services/voice/elevenLabsService';

// Obtener voces disponibles
const voices = await elevenLabsService.getVoices();

// Convertir texto a voz
const audioData = await elevenLabsService.textToSpeech(
  "Hola, ¿cómo estás?",
  "JBFqnCBsd6RMkjVDRZzb", // Voice ID
  {
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
    stability: 0.5,
    similarityBoost: 0.75,
  }
);

// Reproducir audio
await elevenLabsService.playAudio(audioData);

// O usar el método combinado con callback para análisis
await elevenLabsService.speak(
  "Texto a convertir",
  "JBFqnCBsd6RMkjVDRZzb",
  {
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
  },
  (audioElement) => {
    // Callback cuando el audio está listo para análisis
    console.log("Audio listo:", audioElement);
  }
);
```

## ⚙️ Configuración

### Variables de Entorno
- **Archivo**: `frontend/agrovet/.env.local`
- **Variable**: `VITE_ELEVEN_KEY`
- **Formato**: `sk_...`

### Parámetros por Defecto
- **Voice ID**: `JBFqnCBsd6RMkjVDRZzb` (voz recomendada)
- **Model**: `eleven_multilingual_v2`
- **Output Format**: `mp3_44100_128`
- **Stability**: `0.5`
- **Similarity Boost**: `0.75`

## 🚀 Reiniciar Servidor

**IMPORTANTE**: Después de crear o modificar `.env.local`, debes reiniciar el servidor de desarrollo:

```powershell
# Detener el servidor (Ctrl+C)
# Luego reiniciar:
cd frontend\agrovet
npm run dev
```

## ✅ Verificación

Después de reiniciar, deberías ver en la consola:
```
✅ VITE_ELEVEN_KEY cargada correctamente
   Key preview: sk_7461aea...e7415
```

## 🐛 Troubleshooting

### Error 401 (Unauthorized)
- Verifica que la API key esté correcta en `.env.local`
- Asegúrate de haber reiniciado el servidor
- Verifica que la API key no haya expirado

### Error "no-speech"
- Este error es normal cuando no hay audio detectado
- No afecta el funcionamiento del reconocimiento de voz

### Audio no se reproduce
- Verifica los permisos del navegador
- Asegúrate de que haya una interacción del usuario antes de reproducir
