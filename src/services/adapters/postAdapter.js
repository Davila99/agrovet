// Adapter to normalize post objects returned by forum/microservice
export function normalizePost(raw) {
  if (!raw) return raw;
  const id = raw.id || raw.pk || raw.post_id;
  const author = raw.author || raw.user || (raw.author_info && raw.author_info.user);
  const created_at = raw.created_at || raw.created || raw.timestamp;
  const media = raw.media || (raw.media_list && raw.media_list[0]) || null;
  return {
    ...raw,
    id,
    author,
    created_at,
    media,
  };
}

export default { normalizePost };
