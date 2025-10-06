const BASE_URL = "https://agrovet.pythonanywhere.com/api";

/**
 * Realiza una petición HTTP a la API.
 * @param {string} endpoint - Ruta del endpoint.
 * @param {object} options - Opciones de la petición fetch.
 * @returns {Promise<any>} - Respuesta en formato JSON.
 */
async function request(endpoint, options = {}) {
  const { headers, ...rest } = options;
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...rest,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || "Error en la petición");
    }
    return data;
  } catch (err) {
    console.error("❌ API error:", err.message);
    throw err;
  }
}

export const api = {
  register: (data) =>
    request("/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data) =>
    request("/auth/login/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProfile: (token) =>
    request("/auth/profile/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};


//Cliente HTTP genérico.

const httpClient = (endpoint, options = {}) => {
  const opts = { ...options };
  if (
    opts.body &&
    typeof opts.body === "object" &&
    !(opts.body instanceof FormData)
  ) {
    opts.body = JSON.stringify(opts.body);
  }
  return request(endpoint, opts);
};

export default httpClient;
