import httpClient from "../httpClient";
import env from "../env";
import chatAdapter from "../adapters/chatAdapter";

export const chatService = {
    getConversations: async () => {
        const url = env.buildUrl('CHAT', '/conversations/');
        const res = await httpClient(url, { method: "GET" });
        if (Array.isArray(res)) {
            return res.map(chatAdapter.normalizeConversation);
        }
        return res;
    },

    getMessages: async (conversationId) => {
        const url = env.buildUrl('CHAT', `/conversations/${conversationId}/messages/`);
        const res = await httpClient(url, { method: "GET" });
        if (Array.isArray(res)) {
            return res.map(chatAdapter.normalizeMessage);
        }
        // Pagination support: res.results
        if (res.results) {
            res.results = res.results.map(chatAdapter.normalizeMessage);
        }
        return res;
    },

    sendMessage: async (conversationId, data) => {
        // data can be { text: '...' } or FormData if attachments
        const url = env.buildUrl('CHAT', `/conversations/${conversationId}/messages/`);
        const res = await httpClient(url, { method: "POST", body: data });
        return chatAdapter.normalizeMessage(res);
    },

    markRead: async (conversationId) => {
        const url = env.buildUrl('CHAT', `/conversations/${conversationId}/read/`);
        return httpClient(url, { method: "POST" });
    },

    createConversation: async (userId) => {
        const url = env.buildUrl('CHAT', `/conversations/`);
        const res = await httpClient(url, { method: "POST", body: { user_id: userId } });
        return chatAdapter.normalizeConversation(res);
    },
};

export default chatService;
