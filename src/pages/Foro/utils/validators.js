export function validatePost({ title, content }) {
  const errors = {};
  if (!title || title.trim().length < 3) errors.title = 'El título debe tener al menos 3 caracteres.';
  if (!content || content.trim().length < 10) errors.content = 'El contenido debe tener al menos 10 caracteres.';
  return errors;
}

export function validateMedia(file, { maxMB = 20 } = {}) {
  if (!file) return null;
  const allowed = ['image/jpeg', 'image/png', 'video/mp4'];
  if (!allowed.includes(file.type)) return { type: 'Tipo de archivo no permitido.' };
  if (file.size > maxMB * 1024 * 1024) return { size: `Peso del archivo excede ${maxMB}MB.` };
  return null;
}
