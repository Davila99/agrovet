import env from "./env";

class SocketService {
    constructor() {
        this.socket = null;
        this.subscribers = new Map(); // channel -> Set(callbacks)
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.token = null;
        this.isConnected = false;
    }

    connect(token) {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            if (this.token === token) return; // Already connected with same token
            this.disconnect();
        }

        this.token = token;
        if (!token) return;

        const wsUrl = env.buildUrl('WS', `/?token=${token}`);
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('[Socket] Connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.notify('status', { status: 'connected' });
        };

        this.socket.onclose = (event) => {
            console.log('[Socket] Disconnected', event.code, event.reason);
            this.isConnected = false;
            this.notify('status', { status: 'disconnected' });
            this.handleReconnect();
        };

        this.socket.onerror = (error) => {
            console.error('[Socket] Error', error);
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Expecting format: { type: 'channel_name', payload: ... } or similar
                // Adjust based on actual backend message format
                if (data.type) {
                    this.notify(data.type, data.payload || data);
                }
            } catch (e) {
                console.error('[Socket] Failed to parse message', event.data);
            }
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.isConnected = false;
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * this.reconnectAttempts;
            console.log(`[Socket] Reconnecting in ${delay}ms...`);
            setTimeout(() => {
                if (!this.isConnected && this.token) {
                    this.connect(this.token);
                }
            }, delay);
        } else {
            console.error('[Socket] Max reconnect attempts reached');
        }
    }

    subscribe(channel, callback) {
        if (!this.subscribers.has(channel)) {
            this.subscribers.set(channel, new Set());
        }
        this.subscribers.get(channel).add(callback);

        // Return unsubscribe function
        return () => {
            if (this.subscribers.has(channel)) {
                this.subscribers.get(channel).delete(callback);
                if (this.subscribers.get(channel).size === 0) {
                    this.subscribers.delete(channel);
                }
            }
        };
    }

    notify(channel, data) {
        if (this.subscribers.has(channel)) {
            this.subscribers.get(channel).forEach(cb => cb(data));
        }
    }

    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('[Socket] Cannot send, socket not open');
        }
    }
}

export const socketService = new SocketService();
export default socketService;
