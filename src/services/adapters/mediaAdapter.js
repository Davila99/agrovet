// Adapter to normalize media responses from media-service
export function normalizeMedia(raw) {
  if (!raw) {
    console.warn("[mediaAdapter] normalizeMedia recibió raw null/undefined");
    return raw;
  }
  
  const id = raw.id || raw.media_id || raw.pk;
  
  // Intentar obtener la URL de múltiples campos posibles
  const url = raw.url || 
              raw.public_url || 
              raw.publicURL ||
              raw.path || 
              (raw.data && (raw.data.url || raw.data.public_url || raw.data.publicURL)) || 
              null;
  
  const name = raw.name || raw.filename || null;
  const description = raw.description || null;
  const created_at = raw.created_at || raw.createdAt || null;
  
  const normalized = { 
    ...raw, 
    id, 
    url, 
    name,
    description,
    created_at
  };
  
  console.log("[mediaAdapter] Media normalizado:", {
    id,
    url,
    name,
    description,
    created_at,
    rawKeys: Object.keys(raw)
  });
  
  return normalized;
}

export default { normalizeMedia };
