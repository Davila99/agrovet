import httpClient from "../httpClient";
import env from "../env";
import mediaAdapter from "../adapters/mediaAdapter";
import authClient from "../authClient";
import { authHeaders } from "./utils";

// Upload a file (FormData) to the media-service. Returns normalized media.
export async function uploadMedia(formData, token) {
  // Build absolute URL to media-service upload endpoint. Common path: /media/ or /media/uploads/
  const url = env.buildUrl('MEDIA', '/media/');
  const localToken = token || (typeof window !== "undefined" ? authClient.getAccessToken() : null);
  const headers = authHeaders(localToken);

  console.log("📤 [uploadMedia] Iniciando subida a:", url);
  console.log("📤 [uploadMedia] Token disponible:", !!localToken);
  
  try {
    const res = await httpClient(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    // Log detallado de la respuesta
    console.log("=".repeat(50));
    console.log("📥 [uploadMedia] RESPUESTA DEL SERVIDOR:");
    console.log("📥 [uploadMedia] Respuesta completa:", JSON.stringify(res, null, 2));
    console.log("📥 [uploadMedia] Tipo:", typeof res);
    console.log("📥 [uploadMedia] Es null?:", res === null);
    console.log("📥 [uploadMedia] Es undefined?:", res === undefined);
    if (res) {
      console.log("📥 [uploadMedia] Keys:", Object.keys(res));
      console.log("📥 [uploadMedia] ID:", res.id);
      console.log("📥 [uploadMedia] URL:", res.url);
      console.log("📥 [uploadMedia] Name:", res.name);
      console.log("📥 [uploadMedia] Description:", res.description);
    }
    console.log("=".repeat(50));

    // Normalize response to { id, url, name }
    let normalized;
    try {
      normalized = mediaAdapter.normalizeMedia(res);
      console.log("✅ [uploadMedia] Media normalizado:", JSON.stringify(normalized, null, 2));
      console.log("✅ [uploadMedia] Normalized ID:", normalized.id);
      console.log("✅ [uploadMedia] Normalized URL:", normalized.url);
    } catch (e) {
      console.error("❌ [uploadMedia] Error al normalizar:", e);
      normalized = res;
    }
    
    return normalized;
  } catch (error) {
    console.error("❌ [uploadMedia] Error en httpClient:", error);
    console.error("❌ [uploadMedia] Error details:", {
      message: error.message,
      status: error.status,
      body: error.body,
      url: url
    });
    throw error;
  }
}

export async function getMedia(id) {
  const url = env.buildUrl('MEDIA', `/media/${id}/`);
  const res = await httpClient(url, { method: 'GET' });
  return mediaAdapter.normalizeMedia(res);
}

export default {
  uploadMedia,
  getMedia,
};
