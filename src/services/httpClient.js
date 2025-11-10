  // Producción (sin espacio accidental)
// const BASE_URL = "https://agrovet.pythonanywhere.com/api";

const BASE_URL = "http://127.0.0.1:8000/api";
  // Allow runtime override (e.g. tests or embed) via window.__AGROVET_API_BASE

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
        const raw = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (raw && !fetchHeaders.Authorization && !fetchHeaders.authorization) {
          // stored token may include prefix 'Token ' or 'Bearer ' — normalize to raw key
          const token = raw.replace(/^Token\s*/i, '').replace(/^Bearer\s*/i, '');
          fetchHeaders.Authorization = `Token ${token}`;
        }
      } catch (e) {
        // Ignorar acceso a localStorage en entornos no-browser
      }
      if (rest.body instanceof FormData) {
        delete fetchHeaders["Content-Type"];
      } else {
        fetchHeaders["Content-Type"] = "application/json";
      }
      // Implementar timeout para fetch
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const signal = controller ? controller.signal : undefined;
      const timeoutMs = 15000; // 15s
      const timeout = controller
        ? setTimeout(() => controller.abort(), timeoutMs)
        : null;

      // Build a robust URL: ensure single slash between base and endpoint
      const p = String(endpoint || "").trim();
      const path = p.startsWith("/") ? p : "/" + p;
      const url = BASE_URL + path;
      

      const res = await fetch(url, {
        headers: fetchHeaders,
        signal,
        ...rest,
      }).finally(() => {
        if (timeout) clearTimeout(timeout);
      });

      let text = await res.text().catch(() => "");
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { raw: text };
      }

      

      if (!res.ok) {
        try {
          console.error('[httpClient] ❌ API error', {
            status: res.status,
            statusText: res.statusText,
            body: data,
            endpoint: url,
          });
        } catch (e) {}
        
          const message = data.detail || data.error || data.message || `HTTP ${res.status} ${res.statusText}`;
        // Si es error de servidor (5xx) notificamos que el servicio está caído
        if (res.status >= 500 && typeof window !== 'undefined') {
          try {
            window.__AGROVET_SERVICE_DOWN = true;
            window.dispatchEvent(new CustomEvent('agrovet:service-down'));
          } catch (e) {}
        }
        // Extra diagnostic for auth login 401 to help debug specialist login issues
        if (res.status === 401 && String(url).includes('/auth/login')) {
          try {
            console.error('[httpClient][AUTH] 401 on login endpoint', { endpoint: url, requestBody: rest && rest.body, responseBody: data });
          } catch (e) {}
        }

        const err = new Error(message);
        err.status = res.status;
        // Attach parsed response body for callers to inspect serializer errors
        err.body = data;
        // Also include raw text for deeper debugging
        err.raw = text;
        throw err;
      }
      return data;
    } catch (err) {
    try {
      console.error('[httpClient] ❌ API error (exception)', { message: err && err.message, error: err, body: err && err.body });
    } catch (e) {}
      
      const msg = err && (err.message || "") ;
      const isNetworkError = Boolean(
        err && (
          err.name === 'AbortError' ||
          err instanceof TypeError ||
          /failed to fetch/i.test(msg) ||
          /networkerror/i.test(msg) ||
          /network error/i.test(msg)
        )
      );
      if (isNetworkError && typeof window !== 'undefined') {
        try {
          window.__AGROVET_SERVICE_DOWN = true;
          window.dispatchEvent(new CustomEvent('agrovet:service-down'));
        } catch (e) {}
      }
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

  export function clearServiceDownFlag() {
    if (typeof window !== 'undefined') {
      window.__AGROVET_SERVICE_DOWN = false;
      window.dispatchEvent(new CustomEvent('agrovet:service-up'));
    }
  }

  // Comprobación rápida del servicio (intenta hacer fetch a la base URL)
  export async function checkService(timeoutMs = 5000) {
    if (typeof window === 'undefined') return true;
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const signal = controller ? controller.signal : undefined;
      const t = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
      await fetch(BASE_URL + "/", { method: "GET", signal });
      if (t) clearTimeout(t);
      // si llega aquí, servicio responde (aunque sea 404 o CORS opaque), limpiamos flag
      window.__AGROVET_SERVICE_DOWN = false;
      window.dispatchEvent(new CustomEvent('agrovet:service-up'));
      return true;
    } catch (e) {
      // network error / timeout
      try {
        window.__AGROVET_SERVICE_DOWN = true;
        window.dispatchEvent(new CustomEvent('agrovet:service-down'));
      } catch (err) {}
      return false;
    }
  }
