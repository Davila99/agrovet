import React from 'react';

// Lightweight compatibility store that mimics a tiny subset of Zustand API
// so we don't have to add a new dependency. It supports:
// - usePresenceStore(selector) React hook
// - usePresenceStore.getState() -> { users, updateUser, removeUser, getUser }

let state = { users: {} };
const subscribers = new Set();

const notify = () => {
  for (const cb of Array.from(subscribers)) {
    try { cb(); } catch (e) {}
  }
};

function updateUser(id, payload) {
  try {
    if (id == null) return;
    const key = String(id);
    if (!key) return;
    state = { ...state, users: { ...(state.users || {}), [key]: { ...(state.users && state.users[key] ? state.users[key] : {}), ...(payload || {}) } } };
    notify();
  } catch (e) {}
}

function removeUser(id) {
  try {
    if (id == null) return;
    const key = String(id);
    if (!key) return;
    const copy = { ...(state.users || {}) };
    delete copy[key];
    state = { ...state, users: copy };
    notify();
  } catch (e) {}
}

function getUser(id) {
  try {
    if (id == null) return null;
    const key = String(id);
    return state.users && state.users[key] ? state.users[key] : null;
  } catch (e) { return null; }
}

function getSnapshot(selector = (s) => s) {
  try { return selector(state); } catch (e) { return selector({}); }
}

export function usePresenceStore(selector = (s) => s) {
  // useSyncExternalStore provides a safe subscription model for React
  const subscribe = React.useCallback((cb) => {
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  }, []);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return React.useSyncExternalStore(subscribe, () => getSnapshot(selector));
}

// Attach getState to mimic Zustand's API surface used in the codebase
usePresenceStore.getState = () => ({ users: state.users, updateUser, removeUser, getUser });

// Expose for debugging in DevTools
try {
  if (typeof window !== 'undefined') {
    window.__AGROVET_PRESENCE = usePresenceStore.getState();
  }
} catch (e) {}

export default usePresenceStore;
