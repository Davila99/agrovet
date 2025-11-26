import httpClient from "../httpClient";
import env from "../env";
import chatAdapter from "../adapters/chatAdapter";
import { authHeaders } from "./utils";

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
    sendMessageWithImage: async (roomId, file, token, content = '', spectrum = null) => {
        // Primero subir archivo a Media Service
        // MEDIA service URL ya incluye /api, así que solo agregamos /media/
        const mediaUrl = env.buildUrl('MEDIA', '/media/');
        const formData = new FormData();
        
        // Determinar el tipo de archivo y usar el nombre de campo apropiado
        const fileType = file.type?.split('/')[0] || 'image';
        const fieldName = fileType === 'audio' ? 'audio' : 'image';
        formData.append(fieldName, file);
        formData.append('folder', 'chat');
        
        // Si hay spectrum data (para audio), intentar enviarlo en description
        if (spectrum && Array.isArray(spectrum) && fileType === 'audio') {
            try {
                formData.append('description', JSON.stringify({ spectrum }));
            } catch (e) {
                console.warn('Error serializing spectrum data:', e);
            }
        }
        
        try {
            const mediaRes = await httpClient(mediaUrl, {
                method: "POST",
                body: formData,
                headers: authHeaders(token)
            });
            
            if (mediaRes && mediaRes.id) {
                // Enviar mensaje con media_id
                // El spectrum se almacenará en el media description y será recuperado por el adapter
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
};

export default chatService;
