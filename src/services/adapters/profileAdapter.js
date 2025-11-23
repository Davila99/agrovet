// Adapter to normalize Profile/Specialist objects
import { normalizeMedia } from './mediaAdapter';

export function normalizeProfile(raw) {
    if (!raw) return raw;
    const id = raw.id || raw.user_id || raw.pk;
    const name = raw.name || raw.full_name || (raw.user && raw.user.full_name);
    const bio = raw.bio || raw.description || '';
    const avatar = raw.avatar ? normalizeMedia(raw.avatar) : (raw.profile_picture ? { url: raw.profile_picture } : null);
    const role = raw.role || (raw.user && raw.user.role) || 'user';

    return {
        ...raw,
        id,
        name,
        bio,
        avatar,
        role,
    };
}

export default { normalizeProfile };
