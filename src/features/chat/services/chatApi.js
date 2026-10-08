import httpClient from "../../../services/httpClient";
import env from "../../../services/env";
import chatAdapter from "./chatAdapter";
import { authHeaders } from "../../../services/endpoints/utils";

export const chatService = {
    // Obtener todas las salas de chat del usuario
    getRooms: async (token) => {
        const url = env.buildUrl('CHAT', '/api/chat/rooms/');
        const res = await httpClient(url, { 
            method: "GET",
            headers: authHeaders(token)
        });
        // Manejar diferentes formatos de respuesta del backend
        let roomsArray = [];
        if (Array.isArray(res)) {
            roomsArray = res;
        } else if (res && Array.isArray(res.results)) {
            roomsArray = res.results;
        } else if (res && res.data && Array.isArray(res.data)) {
            roomsArray = res.data;
        }
        return roomsArray.map(chatAdapter.normalizeConversation);
    },

    // Obtener o crear sala privada entre dos usuarios
    getOrCreatePrivateRoom: async (userId1, userId2, token) => {
        const url = env.buildUrl('CHAT', '/api/chat/rooms/get_or_create_private/');
        const res = await httpClient(url, { 
            method: "POST",
            body: { participants_ids: [userId1, userId2] },
            headers: authHeaders(token)
        });
        return chatAdapter.normalizeConversation(res);
    },

    // Obtener mensajes de una sala
    getMessages: async (roomId, token, limit = 50) => {
        const url = env.buildUrl('CHAT', `/api/chat/messages/last_messages/?room=${roomId}&limit=${limit}`);
        const res = await httpClient(url, { 
            method: "GET",
            headers: authHeaders(token)
        });
        if (Array.isArray(res)) {
            return res.map(chatAdapter.normalizeMessage);
        }
        return res;
    },

    // Enviar mensaje de texto
    sendMessage: async (roomId, content, token, mediaId = null) => {
        const url = env.buildUrl('CHAT', '/api/chat/messages/');
        const body = { 
            room: roomId, 
            content: content || '',
        };
        if (mediaId) {
            body.media_id = mediaId;
        }
        const res = await httpClient(url, { 
            method: "POST", 
            body,
            headers: authHeaders(token)
        });
        return chatAdapter.normalizeMessage(res);
    },

    // Enviar mensaje con imagen/video/audio (archivo)
    sendMessageWithImage: async (roomId, file, token, content = '', spectrum = null, onProgress = null) => {
        // Importar el uploader con progreso
        const { uploadMediaFile } = await import('../chat/mediaUploader');
        
        // Determinar el tipo de archivo
        const fileType = file.type?.split('/')[0] || 'image';
        
        // Preparar metadata
        const meta = {};
        if (spectrum && Array.isArray(spectrum) && fileType === 'audio') {
            meta.description = { spectrum };
        }
        
        try {
            // Subir archivo con progreso
            const mediaRes = await uploadMediaFile(file, onProgress, meta);
            
            if (mediaRes && mediaRes.id) {
                // Enviar mensaje con media_id
                return await chatService.sendMessage(roomId, content, token, mediaRes.id);
            }
            throw new Error('No se recibió ID del media después de subir');
        } catch (e) {
            console.error('Error subiendo archivo:', e);
            throw e;
        }
    },

    // Marcar mensajes como leídos
    markRead: async (roomId, token) => {
        const url = env.buildUrl('CHAT', '/api/chat/messages/mark_read/');
        return httpClient(url, { 
            method: "POST",
            body: { room: roomId },
            headers: authHeaders(token)
        });
    },

    // Crear sala de chat
    createRoom: async (participantsIds, token, isPrivate = true) => {
        const url = env.buildUrl('CHAT', '/api/chat/rooms/');
        const res = await httpClient(url, { 
            method: "POST", 
            body: { 
                participants_ids: participantsIds,
                is_private: isPrivate
            },
            headers: authHeaders(token)
        });
        return chatAdapter.normalizeConversation(res);
    },

    // Reaccionar a un mensaje con emoji
    reactMessage: async (messageId, emoji, token) => {
        const url = env.buildUrl('CHAT', `/api/chat/messages/${messageId}/react/`);
        return httpClient(url, {
            method: "POST",
            body: { emoji },
            headers: authHeaders(token)
        });
    },

    // Quitar reacción de un mensaje
    unreactMessage: async (messageId, emoji, token) => {
        const url = env.buildUrl('CHAT', `/api/chat/messages/${messageId}/react/?emoji=${encodeURIComponent(emoji)}`);
        return httpClient(url, {
            method: "DELETE",
            headers: authHeaders(token)
        });
    },

    // Iniciar u obtener estado de consulta
    initConsultation: async (roomId, consumerId, professionalId, token) => {
        const url = env.buildUrl('CHAT', '/api/chat/consultations/init/');
        return httpClient(url, {
            method: "POST",
            body: { room_id: roomId, consumer_id: consumerId, professional_id: professionalId },
            headers: authHeaders(token)
        });
    },

    // Extender consulta 15 minutos
    extendConsultation: async (consultationId, token) => {
        const url = env.buildUrl('CHAT', `/api/chat/consultations/${consultationId}/extend/`);
        return httpClient(url, {
            method: "POST",
            headers: authHeaders(token)
        });
    },

    // Cerrar consulta
    closeConsultation: async (consultationId, token) => {
        const url = env.buildUrl('CHAT', `/api/chat/consultations/${consultationId}/close/`);
        return httpClient(url, {
            method: "POST",
            headers: authHeaders(token)
        });
    },
};

export default chatService;
