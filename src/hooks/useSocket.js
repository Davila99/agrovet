import { useEffect } from 'react';
import socketService from '../services/socket';

export function useSocket(channel, callback) {
    useEffect(() => {
        if (!channel || !callback) return;

        const unsubscribe = socketService.subscribe(channel, callback);
        return () => {
            unsubscribe();
        };
    }, [channel, callback]);
}

export function useSocketConnection(token) {
    useEffect(() => {
        if (token) {
            socketService.connect(token);
        } else {
            socketService.disconnect();
        }
        return () => {
            // Optional: disconnect on unmount if this hook is used in a top-level provider that unmounts on logout
            // socketService.disconnect();
        };
    }, [token]);
}

export default useSocket;
