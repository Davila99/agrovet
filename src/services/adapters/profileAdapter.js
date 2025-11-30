// Adapter to normalize Profile/Specialist objects
import { normalizeMedia } from './mediaAdapter';

// Normalizar un producto/servicio individual
function normalizeProduct(raw) {
    if (!raw) return raw;
    return {
        ...raw,
        id: raw.id || raw.pk || raw.media_id,
        title: raw.title || raw.name || 'Sin título',
        name: raw.name || raw.title || 'Sin título',
        description: raw.description || '',
        price: raw.price || null,
        // Buscar URL en múltiples campos posibles
        url: raw.url || raw.file_url || raw.public_url || raw.image || raw.image_url || raw.path || null,
        created_at: raw.created_at || raw.createdAt || null,
    };
}

export function normalizeProfile(raw) {
    if (!raw) return raw;
    const id = raw.id || raw.user_id || raw.pk;
    const name = raw.name || raw.full_name || (raw.user && raw.user.full_name);
    const bio = raw.bio || raw.description || '';
    const avatar = raw.avatar ? normalizeMedia(raw.avatar) : (raw.profile_picture ? { url: raw.profile_picture } : null);
    const role = raw.role || (raw.user && raw.user.role) || 'user';

    // Normalizar work_images_full - asegurar que sea un array
    let workImagesFull = raw.work_images_full;
    if (!Array.isArray(workImagesFull)) {
        workImagesFull = [];
    }
    
    // Normalizar work_images_ids - asegurar que sea un array
    let workImagesIds = raw.work_images_ids;
    if (!Array.isArray(workImagesIds)) {
        if (workImagesIds !== null && workImagesIds !== undefined) {
            workImagesIds = [workImagesIds];
        } else {
            workImagesIds = [];
        }
    }
    
    // Si work_images_full está vacío pero hay work_images_ids, intentar construir objetos básicos
    if (workImagesFull.length === 0 && workImagesIds.length > 0) {
        console.warn('[profileAdapter] ⚠️ work_images_full está vacío pero hay work_images_ids:', workImagesIds);
        // Intentar construir objetos básicos desde los IDs y URLs de work_images
        if (raw.work_images && Array.isArray(raw.work_images) && raw.work_images.length > 0) {
            workImagesFull = workImagesIds.map((id, idx) => ({
                id: id,
                url: raw.work_images[idx] || null,
                name: `Image ${id}`,
            })).filter(item => item.url); // Solo incluir items con URL válida
            console.log('[profileAdapter] 🔄 Construyendo work_images_full desde work_images:', workImagesFull.length, 'items');
        } else {
            // Si no hay work_images pero hay IDs, crear objetos básicos con los IDs
            workImagesFull = workImagesIds.map((id) => ({
                id: id,
                url: null, // Se obtendrá después desde el Media Service
                name: `Image ${id}`,
            }));
            console.log('[profileAdapter] 🔄 Construyendo work_images_full básico desde IDs:', workImagesFull.length, 'items');
        }
    }

    // Normalizar products_and_services_full para businessman
    let productsAndServicesFull = raw.products_and_services_full;
    let productsAndServicesIds = raw.products_and_services_ids || [];
    
    if (Array.isArray(productsAndServicesFull) && productsAndServicesFull.length > 0) {
        productsAndServicesFull = productsAndServicesFull.map(normalizeProduct);
        console.log('[profileAdapter] 🛒 Productos normalizados:', productsAndServicesFull.length, 'items');
    } else {
        productsAndServicesFull = [];
    }
    
    // Si products_and_services_full está vacío pero hay IDs, intentar construir objetos básicos
    if (productsAndServicesFull.length === 0 && productsAndServicesIds.length > 0) {
        console.warn('[profileAdapter] ⚠️ products_and_services_full vacío pero hay IDs:', productsAndServicesIds);
        // Crear objetos básicos con los IDs para que el frontend pueda mostrar algo
        productsAndServicesFull = productsAndServicesIds.map((id) => ({
            id: id,
            url: null,
            title: `Producto ${id}`,
            name: `Producto ${id}`,
        }));
        console.log('[profileAdapter] 🔄 Construyendo products_and_services_full básico desde IDs:', productsAndServicesFull.length, 'items');
    }

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
        work_images_ids: workImagesIds, // Preservar también los IDs normalizados
        work_images_full: workImagesFull,
        // Productos y servicios (businessman)
        products_and_services_full: productsAndServicesFull,
        products_and_services_ids: raw.products_and_services_ids || [],
        // Campos de verificación
        verification_title_id: raw.verification_title_id,
        verification_student_card_id: raw.verification_student_card_id,
        verification_graduation_letter_id: raw.verification_graduation_letter_id,
        verification_title_url: raw.verification_title_url,
        verification_student_card_url: raw.verification_student_card_url,
        verification_graduation_letter_url: raw.verification_graduation_letter_url,
        verification_status: raw.verification_status,
        verification_type: raw.verification_type,
        puntuations: raw.puntuations,
        point: raw.point,
    };
}

export default { normalizeProfile };
