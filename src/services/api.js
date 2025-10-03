const BASE_URL = "http://127.0.0.1:8000/api";

// Función genérica
async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error en la petición");
    }

    return await res.json();
  } catch (err) {
    console.error("❌ API error:", err.message);
    throw err;
  }
}

// Métodos específicos
export const api = {
  // Hello (GET)
  getHello: () => request("/auth/hello/"),

  // Auth
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

  // CRUD genérico (ajusta a tu modelo/items real)
  getItems: () => request("/items/"),
  getItem: (id) => request(`/items/${id}/`),
  createItem: (data) =>
    request("/items/", { method: "POST", body: JSON.stringify(data) }),
  updateItem: (id, data) =>
    request(`/items/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
  deleteItem: (id) => request(`/items/${id}/`, { method: "DELETE" }),
};
