import { useState, useEffect } from 'react';
import foroService from '../../../services/endpoints/foro';

// Lightweight fallback hooks that do not depend on React Query.
// Good for quick UI testing; swap back to React Query for production.

export function usePosts(params = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    foroService.getPosts(params).then(res => {
      if (!mounted) return;
      setData(res.results || res);
      setLoading(false);
    }).catch(err => { if (mounted) { setError(err); setLoading(false); } });
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
      const fd = new FormData(); fd.append('file', file);
      const res = await foroService.uploadMedia(fd);
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
