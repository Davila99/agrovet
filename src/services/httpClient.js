  // Base URL is now configurable via Vite env vars. Fallback to previous default.
import env from './env';
import authClient from './authClient';

const DEFAULT_BASE = "http://127.0.0.1:8000/api";
const BASE_URL = (import.meta && import.meta.env && import.meta.env.VITE_GATEWAY_URL) || DEFAULT_BASE;
// Allow runtime override via window.__AGROVET_API_BASE to support tests or embedding

  /**
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
        // Use authClient helper to attach auth header when available.
        // This centralizes token lookup (supports `agrovet_token` and legacy `token`).
        try {
          fetchHeaders = authClient.attachAuthHeader
            ? authClient.attachAuthHeader(fetchHeaders)
            : { ...fetchHeaders };
        } catch (e) {
          // fallback to manual attach (defensive)
          try {
            const maybeToken = authClient.getAccessToken ? authClient.getAccessToken() : null;
            if (maybeToken && !fetchHeaders.Authorization && !fetchHeaders.authorization) {
              fetchHeaders.Authorization = `Bearer ${maybeToken}`;
            }
          } catch (err) {}
        }

        // No-op here: avoid noisy logs. Auth diagnostics are logged only on auth failures.
      } catch (e) {
        // ignore in non-browser
      }
      if (rest.body instanceof FormData) {
        delete fetchHeaders["Content-Type"];
      } else {
        fetchHeaders["Content-Type"] = "application/json";
      }
      // Implementar timeout para fetch (aumentado a 30s para dar más tiempo)
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const signal = controller ? controller.signal : undefined;
      const timeoutMs = 30000; // 30s (aumentado de 15s)
      const timeout = controller
        ? setTimeout(() => {
            try { console.warn('[httpClient] Request timeout after', timeoutMs, 'ms:', url); } catch (e) {}
            controller.abort();
          }, timeoutMs)
        : null;

      // Build a robust URL: support absolute URLs passed through, or service-specific paths
      const p = String(endpoint || "").trim();
      // If endpoint is an absolute URL, use it directly
      const isAbsolute = /^https?:\/\//i.test(p);
      // Route known top-level paths to their specific services instead of the gateway
      let url;
      if (isAbsolute) {
        url = p;
      } else {
        // Decide service key by inspecting path prefix (common top-level APIs)
        const pathLower = p.toLowerCase();
        let serviceKey = 'GATEWAY';
        if (pathLower.startsWith('/auth') || pathLower.startsWith('auth/')) serviceKey = 'AUTH';
        else if (pathLower.startsWith('/media') || pathLower.startsWith('media/')) serviceKey = 'MEDIA';
        else if (pathLower.startsWith('/adds') || pathLower.startsWith('adds/')) serviceKey = 'ADDS';
        else if (pathLower.startsWith('/profiles') || pathLower.startsWith('profiles/')) serviceKey = 'PROFILES';
        else if (pathLower.startsWith('/foro') || pathLower.startsWith('foro/')) serviceKey = 'FORUM';
        url = env.buildUrl(serviceKey, p);
      }
      

      try {
        const res = await fetch(url, {
          headers: fetchHeaders,
          signal,
          ...rest,
        }).finally(() => {
          if (timeout) clearTimeout(timeout);
        });
        var __res = res; // alias for following code
      } catch (fetchErr) {
        // network/fetch error
        // Limpiar timeout si aún está activo
        if (timeout) clearTimeout(timeout);
        
        // Mejorar mensaje de error para AbortError
        if (fetchErr.name === 'AbortError' || fetchErr.message?.includes('aborted')) {
          // Si el mensaje es "signal is aborted without reason", es un timeout
          const isTimeout = fetchErr.message?.includes('timeout') || 
                           fetchErr.message?.includes('without reason') ||
                           !fetchErr.message?.includes('reason');
          const errorMsg = isTimeout 
            ? `Timeout: El servidor no respondió en ${timeoutMs/1000} segundos. Verifica que el servicio esté corriendo en ${url}. Si el servidor está corriendo, puede estar muy lento o hay un problema de red.`
            : fetchErr.message;
          const abortError = new Error(errorMsg);
          abortError.name = 'AbortError';
          abortError.status = 0;
          abortError.isTimeout = isTimeout;
          abortError.url = url;
          abortError.originalError = fetchErr;
          try { 
            console.error('[httpClient] Request aborted', { 
              url, 
              isTimeout,
              timeoutMs,
              error: abortError.message,
              originalMessage: fetchErr.message
            }); 
          } catch (e) {}
          throw abortError;
        }
        
        // suppress fetch exception logs to keep console clean
        throw fetchErr;
      }

      let text = await __res.text().catch(() => "");
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { raw: text };
      }

      

      if (!__res.ok) {
        // If 401, attempt a single refresh+retry (unless we're on auth endpoints)
        const isAuthEndpoint = String(url).includes('/auth/login') || String(url).includes('/auth/refresh') || String(url).includes('/auth/token/refresh') || String(url).includes('/auth/refresh-token');
        if (__res.status === 401 && !isAuthEndpoint) {
          try {
            const refreshed = await authClient.refreshToken();
            if (refreshed && refreshed.access) {
              // Retry the original request once with refreshed token
              const retryController = typeof AbortController !== 'undefined' ? new AbortController() : null;
              const retrySignal = retryController ? retryController.signal : undefined;
              const retryTimeout = retryController ? setTimeout(() => retryController.abort(), timeoutMs) : null;
              const retriedHeaders = { ...fetchHeaders };
              // attach new token
              retriedHeaders.Authorization = `Bearer ${refreshed.access}`;
              const retried = await fetch(url, {
                headers: retriedHeaders,
                signal: retrySignal,
                ...rest,
              }).finally(() => {
                if (retryTimeout) clearTimeout(retryTimeout);
              });

              let retryText = await retried.text().catch(() => '');
              let retryData = {};
              try { retryData = retryText ? JSON.parse(retryText) : {}; } catch (e) { retryData = { raw: retryText }; }
              if (retried.ok) return retryData;
              // if retry failed, fallthrough to original error path and throw below
            }
          } catch (e) {
            // refresh failed — proceed to throw original 401 error below
          }
        }
        // Suppress generic API error log. Provide focused auth diagnostic only when relevant below.

        const message = data.detail || data.error || data.message || `HTTP ${__res.status} ${__res.statusText}`;
        // Si es error de servidor (5xx) notificamos que el servicio está caído
        if (__res.status >= 500 && typeof window !== 'undefined') {
          try {
            window.__AGROVET_SERVICE_DOWN = true;
            window.dispatchEvent(new CustomEvent('agrovet:service-down'));
          } catch (e) {}
        }
        // Focused auth diagnostics: if 401 (unauthorized), log minimal masked info
        if (__res.status === 401) {
          try {
            // Helper to mask sensitive fields
            const mask = (obj) => {
              try {
                if (!obj) return obj;
                const clone = JSON.parse(JSON.stringify(obj));
                const scrub = (o) => {
                  if (o && typeof o === 'object') {
                    for (const k of Object.keys(o)) {
                      try {
                        if (/pass|pwd|token|auth/i.test(k)) o[k] = '<<masked>>';
                        else if (typeof o[k] === 'object') scrub(o[k]);
                        else if (typeof o[k] === 'string' && o[k].length > 200) o[k] = o[k].slice(0,200) + '...';
                      } catch (e) {}
                    }
                  }
                };
                scrub(clone);
                return clone;
              } catch (e) { return '<<unserializable>>'; }
            };

            const maskedHeaders = { ...(fetchHeaders || {}) };
            if (maskedHeaders.Authorization) maskedHeaders.Authorization = '<<masked>>';
            if (maskedHeaders.authorization) maskedHeaders.authorization = '<<masked>>';

            let bodyForLog = rest && rest.body ? rest.body : null;
            try {
              if (typeof bodyForLog === 'string') bodyForLog = JSON.parse(bodyForLog);
            } catch (e) {}
            const maskedBody = mask(bodyForLog);

            // Log a single focused message to help debug auth issues (includes BASE_URL and computed URL)
            console.error('[httpClient][AUTH_FAILURE]', {
              baseUrl: BASE_URL,
              endpoint: url,
              method: (rest && rest.method) || 'GET',
              requestHeaders: maskedHeaders,
              requestBody: maskedBody,
              responseBody: data,
              status: __res.status,
            });
          } catch (e) {
            // ignore logging errors
          }
        }

        const err = new Error(message);
        err.status = __res.status;
        // Attach parsed response body for callers to inspect serializer errors
        err.body = data;
        // Also include raw text for deeper debugging
        err.raw = text;
        throw err;
      }
      return data;
    } catch (err) {
    // Suppress additional logging here to keep console clean.
      
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
      
      // Mejorar mensaje de error para AbortError/timeout
      if (err && err.name === 'AbortError' && err.isTimeout) {
        err.message = err.message || `Timeout: El servidor no respondió en ${timeoutMs/1000} segundos. Verifica que el servicio esté corriendo.`;
      }
      
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
    // Convenience methods maintained for backwards compatibility.
    register: (data) =>
      request("/auth/register/", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    login: (data) =>
      request("/auth/login/", {
        method: "POST",
        body: JSON.stringify(data),
      }).then((res) => {
        try {
          // If response contains tokens, persist them via authClient
          if (res && (res.access || res.token || res.refresh || res.access_token)) {
            const tokens = {};
            if (res.access) tokens.access = res.access;
            if (res.refresh) tokens.refresh = res.refresh;
            if (res.token) tokens.access = tokens.access || res.token;
            if (res.access_token) tokens.access = tokens.access || res.access_token;
            authClient.saveTokens(tokens);
          }
        } catch (e) {}
        return res;
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
