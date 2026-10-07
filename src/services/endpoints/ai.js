/**
 * Servicio API frontend para conectar con el microservicio de IA (ai-service).
 * Mismo motor de Inteligencia Artificial y Triage Clínico utilizado en la app móvil.
 */

const getBaseUrl = () => {
  return (
    import.meta.env?.VITE_AI_SERVICE_URL ||
    import.meta.env?.VITE_GATEWAY_URL?.replace('/api', '') + '/api/ai' ||
    'http://localhost:8007/api/ai'
  );
};

const getAuthHeaders = (isJson = true) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    ...(isJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Enviar mensaje de texto al motor de IA / Triage Clínico.
 * @param {string} message - Texto de la consulta
 * @param {string} conversationId - Identificador de la sesión
 */
export async function sendChatMessage(message, conversationId) {
  const convId = conversationId || `web_session_${Date.now()}`;
  const res = await fetch(`${getBaseUrl()}/chat/completions`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify({
      conversation_id: convId,
      message,
      stream: false,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status} al consultar al motor de IA.`);
  }

  return res.json();
}

/**
 * Enviar audio de voz grabado al motor de IA (STT + LLM + TTS).
 * @param {Blob} audioBlob - Archivo de audio grabado en el navegador
 * @param {string} conversationId - Identificador de sesión
 */
export async function sendVoiceChat(audioBlob, conversationId) {
  const convId = conversationId || `web_session_${Date.now()}`;
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('conversation_id', convId);

  const res = await fetch(`${getBaseUrl()}/chat/voice`, {
    method: 'POST',
    headers: getAuthHeaders(false),
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status} al procesar voz.`);
  }

  return res.json();
}

/**
 * Obtener libros/manuales veterinarios indexados en la base de conocimientos RAG.
 */
export async function getIndexedBooks() {
  const res = await fetch(`${getBaseUrl()}/chat/books`, {
    headers: getAuthHeaders(true),
  });

  if (!res.ok) {
    return { books: [] };
  }

  return res.json();
}
