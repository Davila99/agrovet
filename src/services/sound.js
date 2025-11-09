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

export default {
  playSendSound,
  playNotifySound,
};
