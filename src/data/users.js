import httpClient from "../services/httpClient";

/**
 * fetchUsers
 * Hace GET a /auth/users/ y devuelve un array de usuarios.
 * Devuelve [] en caso de error.
 * Acepta token opcional (si no se pasa, httpClient intentará usar token guardado en localStorage).
 */
export async function fetchUsers(token = null) {
  try {
    const headers = token ? { Authorization: `Token ${token}` } : {};
    const data = await httpClient("/auth/users/", { method: "GET", headers });

    // Algunos backends devuelven paginación { results: [...] }
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    // fallback: intentar extraer de otras claves
    return [];
  } catch (err) {
    console.warn("fetchUsers error:", err && err.message ? err.message : err);
    return [];
  }
}

export default fetchUsers;
