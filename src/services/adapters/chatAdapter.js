// Adapter to normalize Chat objects (Conversations, Messages)
import { normalizeMedia } from './mediaAdapter';
import { normalizeProfile } from './profileAdapter'; // reusing profile normalization for participants/sender

export function normalizeMessage(raw) {
    if (!raw) return raw;
    const id = raw.id || raw.pk || raw.message_id;
    const text = raw.text || raw.content || raw.body || '';
    const sender = normalizeProfile(raw.sender || raw.user || raw.author);
    const created_at = raw.created_at || raw.created || raw.timestamp;
    const is_read = raw.is_read || raw.read || false;

    let attachments = [];
    if (Array.isArray(raw.attachments)) {
        attachments = raw.attachments.map(normalizeMedia);
    } else if (raw.attachment) {
        attachments = [normalizeMedia(raw.attachment)];
    }

    return {
        ...raw,
        id,
        text,
        sender,
        created_at,
        is_read,
        attachments,
    };
}

export function normalizeConversation(raw) {
    if (!raw) return raw;
    const id = raw.id || raw.pk || raw.conversation_id;
    const updated_at = raw.updated_at || raw.updated || raw.last_activity;

    let participants = [];
    if (Array.isArray(raw.participants)) {
        participants = raw.participants.map(normalizeProfile);
    }

    const last_message = raw.last_message ? normalizeMessage(raw.last_message) : null;

    return {
        ...raw,
        id,
        participants,
        last_message,
        updated_at,
    };
}

export default { normalizeMessage, normalizeConversation };
