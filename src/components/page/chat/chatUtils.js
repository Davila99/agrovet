// STUB: chatUtils disabled during migration
export const resolveAvatar = (url) => url || '';
export const normalizeStoredToken = (token) => token ? token.replace(/^(Token|Bearer)\s*/i, '') : '';
export const cleanName = (name) => name || '';
export const dedupeMessages = (messages) => messages || [];
export const formatTimestamp = (timestamp) => timestamp || '';
