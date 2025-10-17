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
    let fetchHeaders = { ...headers };
    // Añadir Authorization si hay token en localStorage y no fue pasada en headers
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token && !fetchHeaders.Authorization && !fetchHeaders.authorization) {
        fetchHeaders.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignorar acceso a localStorage en entornos no-browser
    }
    if (rest.body instanceof FormData) {
      delete fetchHeaders["Content-Type"];
    } else {
      fetchHeaders["Content-Type"] = "application/json";
    }
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: fetchHeaders,
      ...rest,
    });

    let text = await res.text().catch(() => "");
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { raw: text };
    }

    if (!res.ok) {
      console.error("❌ API error:", {
        status: res.status,
        statusText: res.statusText,
        body: data,
        endpoint: `${BASE_URL}${endpoint}`,
      });
      const message = data.detail || data.error || data.message || `HTTP ${res.status} ${res.statusText}`;
      throw new Error(message);
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
    request("/auth/users/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};


const httpClient = (endpoint, options = {}) => {
  const opts = { ...options };
  if (
    opts.body &&
    typeof opts.body === "object" &&
    !(opts.body instanceof FormData)
  ) {
    opts.body = JSON.stringify(opts.body);
  }
  // Si es FormData, no modificar
  return request(endpoint, opts);
};

export default httpClient;
