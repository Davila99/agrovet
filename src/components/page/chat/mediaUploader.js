// XHR-based uploader so we can report progress.
// Note: the backend router is included at /api/media/ and the DefaultRouter
// registers the 'media' prefix, so the full list/create endpoint is
// POST /api/media/media/ — frontend should post there.
export function uploadMediaFile(file, onProgress, meta = {}) {
  return new Promise((resolve, reject) => {
    try {
      // Resolve API base: prefer runtime override, otherwise default to backend host
      let apiOrigin = null;
      if (typeof window !== 'undefined' && window.__AGROVET_API_BASE) {
        try {
          apiOrigin = new URL(String(window.__AGROVET_API_BASE)).origin;
        } catch (e) {
          apiOrigin = String(window.__AGROVET_API_BASE).replace(/\/$/, '');
        }
      }
      if (!apiOrigin && typeof window !== 'undefined') {
        // default to local backend at port 8000 (matches httpClient BASE_URL)
        apiOrigin = `${location.protocol}//127.0.0.1:8000`;
      }
  const url = `${apiOrigin}/api/media/media/`;
  try { console.debug('[uploadMediaFile] starting upload', { url, name: file.name, size: file.size, type: file.type }); } catch (e) {}
      const xhr = new XMLHttpRequest();
      const form = new FormData();
      form.append('image', file, file.name);
      // Attach optional metadata (e.g., spectrum) so backend can persist it in Media.description
      try {
        if (meta && meta.description) {
          form.append('description', typeof meta.description === 'string' ? meta.description : JSON.stringify(meta.description));
        }
      } catch (e) {}
      try {
        // Log form entries (file will be shown as File object with name/size/type)
        const entries = [];
        for (const e of form.entries()) {
          const [k, v] = e;
          if (v && v instanceof File) entries.push({ key: k, filename: v.name, size: v.size, type: v.type });
          else entries.push({ key: k, value: String(v) });
        }
        try { console.debug('[uploadMediaFile] form entries:', entries); } catch (e) {}
      } catch (e) {}

      xhr.open('POST', url, true);

      // Attach authorization header if token present and log masked token
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (raw) {
          const token = String(raw).replace(/^Token\s*/i, '').replace(/^Bearer\s*/i, '');
          try { console.debug('[uploadMediaFile] setting Authorization header (masked):', String(token).slice(0,6) + '...'); } catch (e) {}
          xhr.setRequestHeader('Authorization', `Token ${token}`);
        } else {
          try { console.debug('[uploadMediaFile] no token found in localStorage'); } catch(e){}
        }
      } catch (e) {
        try { console.warn('[uploadMediaFile] failed reading token for header', e); } catch (err) {}
      }

      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable && typeof onProgress === 'function') {
          const pct = Math.round((ev.loaded / ev.total) * 100);
          onProgress(pct, ev.loaded, ev.total);
        }
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        const status = xhr.status;
        let data = null;
        try {
          data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        } catch (e) {
          data = { raw: xhr.responseText };
        }
        if (status >= 200 && status < 300) {
          try { console.debug('[uploadMediaFile] upload success', data); } catch (e) {}
          resolve(data);
        } else {
          // Attach response body to error and log for debugging
          try { console.error('[uploadMediaFile] upload failed', status, data); } catch (e) {}
          // Also log raw responseText to ensure we capture non-JSON errors
          try { console.error('[uploadMediaFile] raw responseText:', xhr.responseText); } catch (e) {}
          const err = new Error(data && (data.detail || data.error || data.message) ? (data.detail || data.error || data.message) : `HTTP ${status}`);
          err.status = status;
          err.body = data;
          reject(err);
        }
      };

      xhr.onerror = (e) => reject(new Error('Network error'));
      xhr.send(form);
    } catch (e) {
      reject(e);
    }
  });
}

export function guessMediaTypeFromUrl(url) {
  if (!url) return null;
  const lower = String(url).toLowerCase();
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)) return "image";
  if (lower.match(/\.(mp4|webm|mov|mkv|ogg)$/)) return "video";
  if (lower.match(/\.(mp3|wav|m4a|aac|oga|ogg)$/)) return "audio";
  return null;
}

export default { uploadMediaFile, guessMediaTypeFromUrl };
