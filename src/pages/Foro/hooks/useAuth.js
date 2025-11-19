import { useState, useEffect } from 'react';

/**
 * Simple auth hook used by Foro components.
 * TODO: integrate with global auth/state if present in the app.
 */
export default function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {}
  }, []);

  return { user };
}
