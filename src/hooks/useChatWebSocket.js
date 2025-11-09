import { useEffect } from 'react';
import { chatServiceFactory } from '../services/endpoints';

/**
 * Minimal hook to centralize WebSocket connect/disconnect.
 *
 * Usage: pass a connectFn that receives the service instance and performs
 * svc.connect(...) with desired handlers. The hook will call connectFn
 * inside an effect and disconnect on cleanup.
 *
 * connectFn: (svc) => void
 * deps: array of dependencies to control reconnection
 */
export default function useChatWebSocket(connectFn, deps = []) {
  useEffect(() => {
    const svc = chatServiceFactory();
    // expose for dev tooling and other modules that expect this global
    try {
      if (typeof window !== 'undefined') window._agrovet_chat_service = svc;
    } catch (e) {}

    try {
      if (typeof connectFn === 'function') {
        connectFn(svc);
      }
    } catch (e) {
      // keep failure local; caller's console logs/handlers are responsibility
      try { console.error('[useChatWebSocket] connectFn threw', e); } catch (er) {}
    }

    return () => {
      try {
        if (svc && typeof svc.disconnect === 'function') svc.disconnect();
      } catch (e) {}
      try {
        if (typeof window !== 'undefined' && window._agrovet_chat_service === svc) delete window._agrovet_chat_service;
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
