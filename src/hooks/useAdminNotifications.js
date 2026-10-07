import { useEffect, useRef } from 'react';

// Using the correct WebSocket URL for the chat service in dev
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8006';

export const useAdminNotifications = (onNewNotification) => {
  const ws = useRef(null);
  const audio = useRef(new Audio('/sounds/notification.mp3'));

  useEffect(() => {
    // Only connect if we have a token (assuming admin is logged in)
    const token = localStorage.getItem('token');
    if (!token) return;

    ws.current = new WebSocket(WS_URL + '/ws/admin-notifications/');
    
    ws.current.onopen = () => {
      console.log('Connected to admin notifications WS');
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // data.type could be 'new_report' or 'new_validation'
        if (data.type === 'new_report' || data.type === 'new_validation') {
          // Play sound
          audio.current.play().catch(e => console.log('Audio autoplay blocked', e));
          
          if (onNewNotification) {
            onNewNotification(data);
          }
        }
      } catch (err) {
        console.error('Error parsing WS message', err);
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [onNewNotification]);
};
