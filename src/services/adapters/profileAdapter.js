// Adapter to normalize Profile/Specialist objects
import { normalizeMedia } from './mediaAdapter';

export function normalizeProfile(raw) {
    if (!raw) return raw;
    const id = raw.id || raw.user_id || raw.pk;
    const name = raw.name || raw.full_name || (raw.user && raw.user.full_name);
    const bio = raw.bio || raw.description || '';
    const avatar = raw.avatar ? normalizeMedia(raw.avatar) : (raw.profile_picture ? { url: raw.profile_picture } : null);
    const role = raw.role || (raw.user && raw.user.role) || 'user';

    // Preservar todos los campos del perfil de especialista
    return {
        ...raw, // Preservar todos los campos originales primero
        id,
        name,
        bio,
        avatar,
        role,
        // Asegurar que los campos del perfil de especialista se preserven
        user_display: raw.user_display,
        profession: raw.profession,
        experience_years: raw.experience_years,
        about_us: raw.about_us,
        can_give_consultations: raw.can_give_consultations,
        can_offer_online_services: raw.can_offer_online_services,
        work_images: raw.work_images,
        work_images_full: raw.work_images_full,
        puntuations: raw.puntuations,
        point: raw.point,
    };
}

export default { normalizeProfile };
