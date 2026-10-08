import { useState, useEffect, useRef } from "react";
import { getProfile, authAPI, profilesAPI } from "../../../../../services/endpoints";
import { authAPI as authAPIEndpoint } from "../../../../auth/services/authApi";
import { normalizeStoredToken } from "../../../../chat/components/page/chatUtils";
import { useLocation } from "react-router-dom";

export const useProfileData = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({});
  const location = useLocation();
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const fetchInProgressRef = useRef(false);

  // Memoizar los valores de location para evitar re-renders innecesarios
  const pathname = location.pathname;
  const search = location.search;

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;
    let debounceTimer = null;

    const fetchProfile = async () => {
      // Prevenir múltiples ejecuciones - verificar ANTES de establecer el flag
      if (fetchInProgressRef.current) {
        return;
      }

      fetchInProgressRef.current = true;

      if (!isMounted) {
        fetchInProgressRef.current = false;
        return;
      }

      setLoading(true);
      setError("");

      // Timeout de seguridad: si tarda más de 30 segundos, mostrar error
      timeoutId = setTimeout(() => {
        if (isMounted) {
          setError("La carga del perfil está tardando demasiado. Por favor recarga la página.");
          setLoading(false);
          fetchInProgressRef.current = false;
        }
      }, 30000);

      try {
        const token = normalizeStoredToken(localStorage.getItem("token"));

        if (!token) {
          throw new Error("No se encontró el token de autenticación. Por favor inicia sesión.");
        }
        // Comprobar si se pasó userId por query param para ver un perfil (visita)
        const params = new URLSearchParams(search);
        const requestedId = params.get("userId");

        let res;
        if (requestedId) {
          // Cargar perfil por id (visita). No asumir que es el propio.
          setIsOwnProfile(
            String(requestedId) === String(localStorage.getItem("userId"))
          );
          try {
            res = await authAPI.userById(requestedId, token);
          } catch (e) {
            // si falla, intentar usar getProfile como fallback
            res = await getProfile(token);
          }
        } else {
          const userId = localStorage.getItem("userId");
          if (!userId) throw new Error("No se encontró el ID del usuario");
          res = await getProfile(token);
          setIsOwnProfile(true);
        }

        // Obtener perfil específico según el rol
        const userRole = (res.role || '').toString().toLowerCase();
        
        if (userRole === "specialist") {
          try {
            const existingProfile = res.specialist_profile || {};
            const specialistProfile = await profilesAPI.getSpecialistByUser(res.id, token);
            
            if (specialistProfile) {
              res.specialist_profile = {
                ...existingProfile,
                ...specialistProfile,
                profession: specialistProfile.profession || existingProfile.profession || '',
              };
              
              let workImagesFull = specialistProfile.work_images_full || [];

              if (workImagesFull.length === 0 && specialistProfile.work_images_ids?.length > 0) {
                try {
                  const backupKey = `portfolio_backup_${res.id}`;
                  const backupData = localStorage.getItem(backupKey);
                  if (backupData) {
                    const backup = JSON.parse(backupData);
                    const backupIds = backup.work_images_ids || [];
                    const currentIds = specialistProfile.work_images_ids || [];
                    const idsMatch = backupIds.length === currentIds.length &&
                      backupIds.every((id, idx) => id === currentIds[idx]);

                    if (idsMatch && backup.work_images_full?.length > 0) {
                      workImagesFull = backup.work_images_full;
                      specialistProfile.work_images_full = workImagesFull;
                    }
                  }
                } catch (e) {}
              }

              res.work_images_full = workImagesFull;
            }
          } catch (e) {}
        } else if (userRole === "businessman") {
          try {
            const businessmanProfile = await profilesAPI.getBusinessmanByUser(res.id, token);
            
            if (businessmanProfile) {
              res.businessman_profile = businessmanProfile;
              let productsFull = businessmanProfile.products_and_services_full || [];
              
              const productIds = businessmanProfile.products_and_services_ids || [];
              if (productsFull.length === 0 && productIds.length > 0) {
                try {
                  const backupKey = `products_backup_${res.id}`;
                  const backupData = localStorage.getItem(backupKey);
                  if (backupData) {
                    const backup = JSON.parse(backupData);
                    const backupIds = backup.products_and_services_ids || [];
                    const idsMatch = backupIds.length === productIds.length &&
                      backupIds.every((id, idx) => String(id) === String(productIds[idx]));
                    
                    if (idsMatch && backup.products_and_services_full?.length > 0) {
                      productsFull = backup.products_and_services_full;
                    } else if (backup.products_and_services_full?.length > 0) {
                      productsFull = backup.products_and_services_full;
                    }
                  }
                } catch (backupError) {}
              }
              
              if (productsFull.length === 0) {
                try {
                  const backupKey = `products_backup_${res.id}`;
                  const backupData = localStorage.getItem(backupKey);
                  if (backupData) {
                    const backup = JSON.parse(backupData);
                    if (backup.products_and_services_full?.length > 0) {
                      productsFull = backup.products_and_services_full;
                    }
                  }
                } catch (e) {}
              }
              
              res.products_and_services_full = productsFull;
            }
          } catch (e) {}
        }

        if (!isMounted) {
          if (timeoutId) clearTimeout(timeoutId);
          return;
        }

        if (!res || !res.id) {
          throw new Error("No se recibieron datos válidos del usuario");
        }

        setUser(res);
        setForm(res);
      } catch (err) {
        if (isMounted) {
          const errorMessage = err.message || err.body?.detail || err.body?.error || "No se pudo cargar el perfil";
          setError(errorMessage);
          setLoading(false);
        }
      } finally {
        fetchInProgressRef.current = false;
        if (timeoutId) clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    debounceTimer = setTimeout(() => {
      fetchProfile();
    }, 150);

    return () => {
      isMounted = false;
      if (debounceTimer) clearTimeout(debounceTimer);
      if (timeoutId) clearTimeout(timeoutId);
      fetchInProgressRef.current = false;
    };
  }, [pathname, search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSavePersonal = async () => {
    try {
      const token = normalizeStoredToken(localStorage.getItem("token"));
      
      const updateData = {
        bio: form.bio,
        phone_number: form.phone_number,
      };
      
      if ((form.role || "").toString().toLowerCase() === "businessman") {
        if (form.latitude) updateData.latitude = form.latitude;
        if (form.longitude) updateData.longitude = form.longitude;
      }
      
      await authAPIEndpoint.updateUser(user.id, updateData, token);
      setUser(form);
    } catch (error) {
      console.error("Error al guardar información personal:", error);
      alert("Error al guardar los cambios personales");
    }
  };

  const handleSaveBusiness = async () => {
    try {
      const token = normalizeStoredToken(localStorage.getItem("token"));
      
      if (form.businessman_profile && 
          form.businessman_profile.business_name && 
          form.businessman_profile.descriptions) {
        
        const businessData = {
          business_name: form.businessman_profile.business_name,
          descriptions: form.businessman_profile.descriptions,
        };
        
        if (form.businessman_profile.user_display) {
          businessData.user_display = form.businessman_profile.user_display;
        }
        if (form.businessman_profile.business_type) {
          businessData.business_type = form.businessman_profile.business_type;
        }
        if (form.businessman_profile.offers_local_products !== undefined) {
          businessData.offers_local_products = form.businessman_profile.offers_local_products;
        }
        
        await profilesAPI.patchBusinessmanByUser(user.id, businessData, token);
        setUser(form);
      }
    } catch (error) {
      console.error("Error al guardar información del negocio:", error);
      alert("Error al guardar los cambios del negocio: " + (error.message || "Error desconocido"));
    }
  };

  const handleSave = async (section = 'personal') => {
    if (section === 'personal') {
      await handleSavePersonal();
    } else if (section === 'business') {
      await handleSaveBusiness();
    }
  };

  return {
    user, setUser,
    loading, setLoading,
    error, setError,
    form, setForm,
    isOwnProfile,
    handleChange,
    handleSave
  };
};
