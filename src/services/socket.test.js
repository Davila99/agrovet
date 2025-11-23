import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import socketService from './socket';
import env from './env';

// Mock WebSocket
class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.readyState = 0; // CONNECTING
        setTimeout(() => {
            this.readyState = 1; // OPEN
            if (this.onopen) this.onopen();
        }, 10);
    }
    close() {
        this.readyState = 3; // CLOSED
        if (this.onclose) this.onclose({});
    }
    send(data) { }
}

global.WebSocket = MockWebSocket;

describe('socketService', () => {
    beforeEach(() => {
        socketService.disconnect();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('connects with token', () => {
        socketService.connect('abc');
        expect(socketService.token).toBe('abc');
        expect(socketService.socket).toBeTruthy();
    });

    it('does not connect without token', () => {
        socketService.connect(null);
        expect(socketService.socket).toBeNull();
    });

    it('subscribes and notifies', () => {
        const callback = vi.fn();
        socketService.subscribe('test_channel', callback);
        socketService.notify('test_channel', { msg: 'hello' });
        expect(callback).toHaveBeenCalledWith({ msg: 'hello' });
    });

    it('unsubscribes correctly', () => {
        const callback = vi.fn();
        const unsubscribe = socketService.subscribe('test_channel', callback);
        unsubscribe();
        socketService.notify('test_channel', { msg: 'hello' });
        expect(callback).not.toHaveBeenCalled();
    });
});
