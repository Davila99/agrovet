// Lightweight sound manager for chat notifications.
// Uses MP3 assets stored under src/assets/mp3 so Vite will bundle/serve them.
// Expected files (already present in repo):
//  - src/assets/mp3/writing.mp3
//  - src/assets/mp3/notification.mp3

import sendSrc from "../assets/mp3/writing.mp3";
import notifySrc from "../assets/mp3/notification.mp3";

const makeAudio = (src) => {
  try {
    const a = new Audio(src);
    a.preload = "auto";
    return a;
  } catch (e) {
    return null;
  }
};

const sendAudio = typeof window !== "undefined" && sendSrc ? makeAudio(sendSrc) : null;
const notifyAudio = typeof window !== "undefined" && notifySrc ? makeAudio(notifySrc) : null;

export function playSendSound() {
  try {
    if (!sendAudio) return;
    // Clone to allow overlapping plays
    const a = sendAudio.cloneNode();
    a.play().catch(() => {});
  } catch (e) {}
}

export function playNotifySound() {
  try {
    if (!notifyAudio) return;
    const a = notifyAudio.cloneNode();
    a.play().catch(() => {});
  } catch (e) {}
}

// Decide which outgoing sound to play based on whether the user is in the
// active room and whether the browser window is focused. If the window is not
// focused or the user is in a different room, play the notification sound;
// otherwise play the in-room 'writing' sound.
export function playOutgoingSound(roomId) {
  try {
    const windowFocused = (typeof document !== 'undefined') ? document.hasFocus() : true;
    const activeRoom = (typeof window !== 'undefined') ? window.__AGROVET_ACTIVE_ROOM : null;
    const isActiveRoom = roomId ? String(activeRoom) === String(roomId) : Boolean(activeRoom);

    if (!windowFocused || !isActiveRoom) {
      // play notification
      if (!notifyAudio) return;
      const a = notifyAudio.cloneNode();
      a.play().catch(() => {});
    } else {
      // play writing
      if (!sendAudio) return;
      const a = sendAudio.cloneNode();
      a.play().catch(() => {});
    }
  } catch (e) {
    // swallow errors from autoplay policies or missing audio
  }
}

export default {
  playSendSound,
  playNotifySound,
};
