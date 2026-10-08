import { useState, useEffect } from 'react';

/**
 * Auth hook for Foro components.
 * Gets user data from localStorage and provides user information including role.
 */
export default function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const userData = JSON.parse(raw);
        // Normalize user data
        setUser({
          id: userData.id,
          name: userData.full_name || userData.name || userData.phone_number,
          full_name: userData.full_name,
          phone_number: userData.phone_number,
          role: userData.role,
          profile_picture: userData.profile_picture,
          bio: userData.bio,
          is_student: userData.is_student,
          is_titled: userData.is_titled,
          profession: userData.profession,
        });
      }
    } catch (e) {
      console.error('[useAuth] Error parsing user data:', e);
    }
  }, []);

  // Listen for storage changes (in case user logs in/out in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        try {
          if (e.newValue) {
            const userData = JSON.parse(e.newValue);
            setUser({
              id: userData.id,
              name: userData.full_name || userData.name || userData.phone_number,
              full_name: userData.full_name,
              phone_number: userData.phone_number,
              role: userData.role,
              profile_picture: userData.profile_picture,
              bio: userData.bio,
              is_student: userData.is_student,
              is_titled: userData.is_titled,
              profession: userData.profession,
            });
          } else {
            setUser(null);
          }
        } catch (e) {
          console.error('[useAuth] Error parsing user data on storage change:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { user };
}
