// Adapter to normalize media responses from media-service
export function normalizeMedia(raw) {
  if (!raw) return raw;
  const id = raw.id || raw.media_id || raw.pk;
  const url = raw.url || raw.public_url || raw.path || (raw.data && raw.data.url) || null;
  const name = raw.name || raw.filename || null;
  return { ...raw, id, url, name };
}

export default { normalizeMedia };
