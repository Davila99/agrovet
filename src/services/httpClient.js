  // Base URL is now configurable via Vite env vars. Fallback to previous default.
import env from './env';
import authClient from './authClient';

const DEFAULT_BASE = "https://agrovet.pythonanywhere.com/api";
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
        // Prefer authClient-managed token storage
        const token = authClient.getAccessToken && authClient.getAccessToken();
        if (token && !fetchHeaders.Authorization && !fetchHeaders.authorization) {
          fetchHeaders.Authorization = `Bearer ${token}`;
        }
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
        try { console.debug('[httpClient] request ->', { url, headers: fetchHeaders, body: rest && rest.body ? (typeof rest.body === 'string' ? rest.body : '[object]') : null }); } catch (e) {}
        const res = await fetch(url, {
          headers: fetchHeaders,
          signal,
          ...rest,
        }).finally(() => {
          if (timeout) clearTimeout(timeout);
        });
        try { console.debug('[httpClient] response', { url, status: res.status, statusText: res.statusText }); } catch (e) {}
        // continue with parsing below
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
        
        try { console.error('[httpClient] fetch exception', { url, error: fetchErr, name: fetchErr.name, message: fetchErr.message }); } catch (e) {}
        throw fetchErr;
      }

      let text = await __res.text().catch(() => "");
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        // Si no es JSON, intentar extraer información del HTML de error de Django
        if (text && typeof text === 'string' && text.includes('<!DOCTYPE html>')) {
          // Intentar extraer el mensaje de error de Django
          const errorMatch = text.match(/<h1[^>]*>(.*?)<\/h1>/i) || text.match(/<title[^>]*>(.*?)<\/title>/i);
          // Buscar el traceback o mensaje de error en <pre> o <li>
          const tracebackMatch = text.match(/<pre[^>]*class="python-tb"[^>]*>(.*?)<\/pre>/is) || 
                                 text.match(/<pre[^>]*>(.*?)<\/pre>/is);
          const detailMatch = text.match(/<li[^>]*>(.*?)<\/li>/is) || 
                             text.match(/<p[^>]*class="errormsg"[^>]*>(.*?)<\/p>/is) ||
                             text.match(/<div[^>]*class="errormsg"[^>]*>(.*?)<\/div>/is);
          
          // Extraer información del traceback si está disponible
          let errorDetail = '';
          if (tracebackMatch) {
            const traceback = tracebackMatch[1].replace(/<[^>]*>/g, '').trim();
            // Tomar las primeras líneas del traceback
            const lines = traceback.split('\n').slice(0, 10).join('\n');
            errorDetail = lines.substring(0, 1000);
          } else if (detailMatch) {
            errorDetail = detailMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 500);
          }
          
          data = {
            raw: text.substring(0, 2000), // Aumentar para ver más del HTML
            error: errorMatch ? errorMatch[1].replace(/<[^>]*>/g, '').trim() : 'Internal Server Error',
            detail: errorDetail || undefined,
            htmlError: true
          };
          
          // Log detallado del error HTML para debugging
          try {
            console.error('[httpClient] HTML Error Response:', {
              status: __res.status,
              errorTitle: data.error,
              detail: data.detail,
              url: url,
              htmlPreview: text.substring(0, 500)
            });
          } catch (logErr) {}
        } else {
          data = { raw: text };
        }
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
        try {
          // Extraer información más detallada del error
          let errorInfo = {
            status: __res.status,
            statusText: __res.statusText,
            body: data,
            endpoint: url,
          };
          
          // Si es un error HTML, intentar extraer más información
          if (data.htmlError && data.raw) {
            const htmlText = data.raw;
            // Buscar el traceback completo
            const tracebackMatch = htmlText.match(/<pre[^>]*class="python-tb"[^>]*>([\s\S]*?)<\/pre>/i) ||
                                   htmlText.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
            if (tracebackMatch) {
              const traceback = tracebackMatch[1].replace(/<[^>]*>/g, '').trim();
              // Tomar las últimas líneas del traceback (donde está el error real)
              const lines = traceback.split('\n');
              const lastLines = lines.slice(-15).join('\n');
              errorInfo.traceback = lastLines.substring(0, 2000);
              // También agregar el traceback al objeto data para que esté disponible en e.body
              data.traceback = lastLines.substring(0, 2000);
            }
            
            // Buscar mensajes de error específicos
            const errorMsgMatch = htmlText.match(/<li[^>]*>(.*?)<\/li>/gi);
            if (errorMsgMatch) {
              errorInfo.errorMessages = errorMsgMatch.slice(0, 5).map(m => m.replace(/<[^>]*>/g, '').trim());
            }
          }
          
          console.error('[httpClient] ❌ API error', errorInfo);
          
          // Log adicional para errores HTML - mostrar información directamente
          if (data.htmlError) {
            console.error('🔍 [httpClient] HTML Error Details:');
            console.error('   Error:', data.error);
            console.error('   Detail:', data.detail);
            if (errorInfo.traceback) {
              console.error('   Traceback:', errorInfo.traceback);
            }
            console.error('   HTML Preview:', text.substring(0, 1000));
          }
        } catch (e) {}

        const message = data.detail || data.error || data.message || `HTTP ${__res.status} ${__res.statusText}`;
        // Si es error de servidor (5xx) notificamos que el servicio está caído
        if (__res.status >= 500 && typeof window !== 'undefined') {
          try {
            window.__AGROVET_SERVICE_DOWN = true;
            window.dispatchEvent(new CustomEvent('agrovet:service-down'));
          } catch (e) {}
        }
        // Extra diagnostic for auth login 401 to help debug specialist login issues
        if (__res.status === 401 && String(url).includes('/auth/login')) {
          try {
            console.error('[httpClient][AUTH] 401 on login endpoint', { endpoint: url, requestBody: rest && rest.body, responseBody: data });
          } catch (e) {}
        }

        const err = new Error(message);
        err.status = __res.status;
        // Attach parsed response body for callers to inspect serializer errors
        err.body = data;
        // Also include raw text for deeper debugging
        err.raw = text;
        throw err;
      }
      
      // Log detallado para debugging de portfolio
      if (url.includes('/profiles/specialists/') && __res.ok) {
        console.log('='.repeat(80));
        console.log('[httpClient] 📥 RESPUESTA DEL BACKEND (PATCH/GET specialist):');
        console.log('[httpClient] URL:', url);
        console.log('[httpClient] Status:', __res.status);
        console.log('[httpClient] Response data:', JSON.stringify(data, null, 2));
        if (data.work_images_full) {
          console.log('[httpClient] ✅ work_images_full encontrado:', data.work_images_full);
          console.log('[httpClient] ✅ work_images_full length:', data.work_images_full?.length);
          if (Array.isArray(data.work_images_full)) {
            console.log('[httpClient] ✅ work_images_full items:', data.work_images_full.map(item => ({
              id: item?.id,
              name: item?.name,
              url: item?.url
            })));
          }
        } else {
          console.log('[httpClient] ⚠️ work_images_full NO encontrado en la respuesta');
        }
        console.log('='.repeat(80));
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

  // Helper function to create auth headers
  export function authHeaders(token) {
    if (!token) return {};
    // Remove 'Bearer ' prefix if present, then add it back
    const cleanToken = token.replace(/^Bearer\s*/i, '').trim();
    return {
      Authorization: `Bearer ${cleanToken}`
    };
  }

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
