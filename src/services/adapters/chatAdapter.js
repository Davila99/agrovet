// Adapter to normalize Chat objects (Conversations/Rooms, Messages)
import { normalizeMedia } from './mediaAdapter';
import { normalizeProfile } from './profileAdapter'; // reusing profile normalization for participants/sender

export function normalizeMessage(raw) {
    if (!raw) return raw;
    const id = raw.id || raw.pk || raw.message_id;
    const text = raw.text || raw.content || raw.body || raw.message || '';
    
    // Normalizar sender - puede venir como objeto completo o solo como ID
    let sender = null;
    if (raw.sender) {
        if (typeof raw.sender === 'object' && raw.sender.id) {
            sender = normalizeProfile(raw.sender);
        } else if (typeof raw.sender === 'number' || typeof raw.sender === 'string') {
            sender = { id: parseInt(raw.sender) };
        }
    } else if (raw.user) {
        sender = normalizeProfile(raw.user);
    } else if (raw.author) {
        sender = normalizeProfile(raw.author);
    } else if (raw.sender_id) {
        sender = { id: parseInt(raw.sender_id) };
    }
    
    // Si no hay sender, crear uno básico con el sender_id si existe
    if (!sender && raw.sender_id) {
        sender = { id: parseInt(raw.sender_id) };
    }
    
    const created_at = raw.created_at || raw.created || raw.timestamp;
    const is_read = raw.is_read || raw.read || false;
    const room_id = raw.room || raw.room_id || raw.room_id;

    // Manejar media_url del backend - detectar tipo de archivo
    let attachments = [];
    let mediaType = 'image';
    let mediaSpectrum = raw.media_spectrum || raw.spectrum || null;
    
    // Intentar extraer spectrum desde media description si está disponible
    if (!mediaSpectrum && raw.media) {
        try {
            const mediaDesc = raw.media.description || raw.media.desc || raw.media.metadata;
            if (mediaDesc) {
                if (typeof mediaDesc === 'string') {
                    try {
                        const parsed = JSON.parse(mediaDesc);
                        if (Array.isArray(parsed.spectrum)) {
                            mediaSpectrum = parsed.spectrum;
                        } else if (Array.isArray(parsed)) {
                            mediaSpectrum = parsed;
                        }
                    } catch (e) {
                        // Si no es JSON válido, intentar como array directo
                        if (mediaDesc.startsWith('[')) {
                            try {
                                mediaSpectrum = JSON.parse(mediaDesc);
                            } catch (e2) {}
                        }
                    }
                } else if (Array.isArray(mediaDesc)) {
                    mediaSpectrum = mediaDesc;
                } else if (mediaDesc.spectrum && Array.isArray(mediaDesc.spectrum)) {
                    mediaSpectrum = mediaDesc.spectrum;
                }
            }
        } catch (e) {
            console.warn('Error parsing media spectrum from description:', e);
        }
    }
    
    // Priorizar file_url del backend, luego media_url, luego attachments
    const finalMediaUrl = raw.file_url || raw.media_url || (raw.media && raw.media.file_url) || (raw.media && raw.media.url);
    
    if (finalMediaUrl) {
        const url = String(finalMediaUrl).toLowerCase();
        if (url.match(/\.(mp4|webm|mov|mkv|avi)$/i)) {
            mediaType = 'video';
        } else if (url.match(/\.(mp3|wav|ogg|webm|m4a|aac|oga|opus)$/i)) {
            mediaType = 'audio';
        }
        attachments = [{
            id: raw.media_id || (raw.media && raw.media.id),
            url: finalMediaUrl,
            type: mediaType
        }];
    } else if (Array.isArray(raw.attachments)) {
        attachments = raw.attachments.map(normalizeMedia);
    } else if (raw.attachment) {
        attachments = [normalizeMedia(raw.attachment)];
    }

    return {
        ...raw,
        id,
        text,
        sender: sender || { id: null },
        created_at,
        is_read,
        attachments,
        room_id,
        media_id: raw.media_id || (raw.media && raw.media.id),
        media_url: finalMediaUrl || raw.media_url,
        file_url: raw.file_url || (raw.media && raw.media.file_url),
        media_spectrum: mediaSpectrum,
        media_file_size: raw.media_file_size || (raw.media && raw.media.file_size) || (raw.media && raw.media.size),
        delivered: raw.delivered || false,
        read: raw.read || false,
    };
}

export function normalizeConversation(raw) {
    if (!raw) return raw;
    const id = raw.id || raw.pk || raw.conversation_id || raw.room_id;
    const updated_at = raw.updated_at || raw.updated || raw.last_activity;

    let participants = [];
    if (Array.isArray(raw.participants)) {
        participants = raw.participants.map(normalizeProfile);
    } else if (raw.participants_ids && Array.isArray(raw.participants_ids)) {
        // Si solo tenemos IDs, crear objetos básicos
        participants = raw.participants_ids.map(id => ({ id }));
    }

    const last_message = raw.last_message ? normalizeMessage(raw.last_message) : null;
    
    // Incluir contador de mensajes no leídos si existe
    const unread_count = raw.unread_count || raw.unreadCount || raw.unread_messages_count || 0;

    return {
        ...raw,
        id,
        participants,
        last_message,
        updated_at,
        room_id: id, // Alias para compatibilidad
        unread_count,
    };
}

export default { normalizeMessage, normalizeConversation };
