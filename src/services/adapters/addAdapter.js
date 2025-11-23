// Adapter to normalize Add objects from adds-service
import { normalizeMedia } from './mediaAdapter';

export function normalizeAdd(raw) {
    if (!raw) return raw;
    const id = raw.id || raw.pk || raw.add_id;
    const title = raw.title || raw.name;
    const description = raw.description || raw.desc || '';
    const price = raw.price || 0;
    const currency = raw.currency || 'USD';
    const category = raw.category || null; // could be object or id
    const user = raw.user || raw.author || raw.seller || null;
    const created_at = raw.created_at || raw.created || raw.timestamp;

    // Normalize images if present
    let images = [];
    if (Array.isArray(raw.images)) {
        images = raw.images.map(img => {
            if (typeof img === 'string') return { url: img };
            return normalizeMedia(img);
        });
    }

    return {
        ...raw,
        id,
        title,
        description,
        price,
        currency,
        category,
        user,
        created_at,
        images,
    };
}

export default { normalizeAdd };
