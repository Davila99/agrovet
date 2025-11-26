import { useState, useEffect } from 'react';
import foroService from '../../services/endpoints/foro';

export function usePosts(params = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    foroService.getPosts(params)
      .then(res => {
        if (!mounted) return;
        setData(res.results || res);
        setLoading(false);
      })
      .catch(err => { 
        if (mounted) { 
          // Silenciar errores 500 del servidor - usamos posts de ejemplo
          if (err?.status >= 500) {
            console.warn('[usePosts] Servidor de foro no disponible, usando posts de ejemplo');
            setData([]); // Retornar array vacío para que use los posts de ejemplo
          } else {
            setError(err);
          }
          setLoading(false); 
        }
      });
    return () => { mounted = false; };
  }, [JSON.stringify(params)]);

  return { data, isLoading, error };
}

export function usePost(id) {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    foroService.getPostDetail(id).then(res => {
      if (!mounted) return;
      setData(res);
      setLoading(false);
    }).catch(err => { if (mounted) { setError(err); setLoading(false); } });
    return () => { mounted = false; };
  }, [id]);

  return { data, isLoading, error };
}

export function useCreatePost() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function mutateAsync(body) {
    setLoading(true); setError(null);
    try {
      const res = await foroService.createPost(body);
      setLoading(false);
      return res;
    } catch (e) {
      setError(e); setLoading(false); throw e;
    }
  }

  return { mutateAsync, isLoading, error };
}

export function useCreateComment() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function mutateAsync(body) {
    setLoading(true); setError(null);
    try {
      const res = await foroService.createComment(body);
      setLoading(false);
      return res;
    } catch (e) {
      setError(e); setLoading(false); throw e;
    }
  }

  return { mutateAsync, isLoading, error };
}

export function useReact() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function mutateAsync(body) {
    setLoading(true); setError(null);
    try {
      const res = await foroService.createReaction(body);
      setLoading(false);
      return res;
    } catch (e) {
      setError(e); setLoading(false); throw e;
    }
  }

  return { mutateAsync, isLoading, error };
}

export function useCommunities() {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    foroService.getCommunities().then(res => { if (!mounted) return; setData(res); setLoading(false); }).catch(err => { if (mounted) { setError(err); setLoading(false); } });
    return () => { mounted = false; };
  }, []);

  return { data, isLoading, error };
}

export function useUploadMedia() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function mutateAsync(file) {
    setLoading(true); setError(null);
    try {
      const fd = new FormData();
      // Backend expects field 'image' (MediaViewSet looks for 'image')
      fd.append('image', file);
      const res = await foroService.uploadMedia(fd);
      // log for debugging in dev
      try { console.debug('[useUploadMedia] upload response', res); } catch (e) { }
      setLoading(false);
      return res;
    } catch (e) {
      setError(e); setLoading(false); throw e;
    }
  }

  return { mutateAsync, isLoading, error };
}

export function useDeletePost() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function mutateAsync(id) {
    setLoading(true); setError(null);
    try {
      const res = await foroService.deletePost(id);
      setLoading(false);
      return res;
    } catch (e) { setError(e); setLoading(false); throw e; }
  }

  return { mutateAsync, isLoading, error };
}
