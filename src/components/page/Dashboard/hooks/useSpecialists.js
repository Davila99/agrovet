import { useState, useEffect } from "react";
import httpClient from "../../../../services/httpClient";
import { profilesAPI } from "../../../../services/endpoints";

export const useSpecialists = (professionFilter, searchQuery, currentId) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [specialistsCount, setSpecialistsCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchAllPages = async (url, acc = []) => {
      const data = await httpClient(url, { method: "GET" });
      const results = Array.isArray(data) ? data : data.results || [];
      const combined = [...acc, ...results];
      if (data.next) {
        return fetchAllPages(data.next, combined);
      }
      return combined;
    };

    const load = async () => {
      try {
        setLoading(true);
        const list = await fetchAllPages("/auth/users/");

        if (!mounted) return;

        const normalizeRole = (r) => String(r || "").toLowerCase();
        const isSpecialistUser = (u) => {
          const role = normalizeRole(u.role || u.user_role);
          const roleMatch = role && (role.includes("specialist") || role.includes("especialista") || role.includes("especialist"));
          const flag = u.is_specialist === true;
          const hasProfile = Boolean(u.specialist_profile);
          return roleMatch || flag || hasProfile;
        };

        const specialists = list.filter((u) => isSpecialistUser(u));

        const filtered = specialists.filter((u) => {
          return String(u.id) !== String(currentId);
        });

        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const enrichedSpecialists = await Promise.all(
          filtered.map(async (specialist) => {
            try {
              if (token && specialist.id) {
                const specialistProfile = await profilesAPI.getSpecialistByUser(specialist.id, token);
                if (specialistProfile) {
                  return { ...specialist, specialist_profile: specialistProfile };
                }
              }
            } catch (err) {
              console.log(`Error or 403 loading profile ${specialist.id}`);
            }
            
            const profile = specialist.specialist_profile || {};
            if (profile.verification_status) {
              return { ...specialist, specialist_profile: profile };
            }
            
            const hasTitle = !!profile.verification_title_id;
            const hasStudentCard = !!profile.verification_student_card_id;
            const hasGraduationLetter = !!profile.verification_graduation_letter_id;
            
            let verificationStatus = null;
            let verificationType = null;
            
            if (hasStudentCard) {
              verificationStatus = 'verified_student';
              verificationType = 'Estudiante';
            } else if (hasTitle || hasGraduationLetter) {
              verificationStatus = 'verified_professional';
              verificationType = 'Médico Titulado';
            }
            
            return {
              ...specialist,
              specialist_profile: {
                ...profile,
                verification_status: verificationStatus,
                verification_type: verificationType,
              }
            };
          })
        );

        let filteredSpecialists = enrichedSpecialists;
        if (professionFilter) {
          filteredSpecialists = enrichedSpecialists.filter(s => {
            const profession = s.specialist_profile?.profession || '';
            return profession === professionFilter;
          });
        }
        
        setSpecialistsCount(filteredSpecialists.length);
        setUsers(filteredSpecialists);
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [professionFilter, currentId]);

  const getFilteredUsers = () => {
    let filtered = users;
    const q = String(searchQuery || "").trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((u) => {
        const name = (u.full_name || u.username || "").toLowerCase();
        const prof = (u.specialist_profile?.profession || "").toLowerCase();
        return name.includes(q) || prof.includes(q);
      });
    }
    return filtered;
  };

  return { loading, error, users: getFilteredUsers(), specialistsCount };
};
