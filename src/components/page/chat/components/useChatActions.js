import { useState, useRef } from "react";
import { normalizeStoredToken } from "../chatUtils";
import { chatAPI } from "../../../../services/endpoints";
import { playSendSound } from "../../../../services/sound";

// Minimal hook to centralize chat actions used by small components.
// This is intentionally small: it provides a sendTextMessage helper so components
// that previously imported this file won't break. Replace with the real
// implementation as needed.
export default function useChatActions() {
	const [loading, setLoading] = useState(false);
	const lastSentRef = useRef(null);

	const sendTextMessage = async (roomId, text, opts = {}) => {
		setLoading(true);
		try {
			const token = normalizeStoredToken(localStorage.getItem("token"));
			const client_msg_id = opts.client_msg_id || null;
			const res = await chatAPI.sendMessage(roomId, text, { client_msg_id })({ token });
			try {
				playSendSound();
			} catch (e) {
				// non-fatal
			}
			lastSentRef.current = { roomId, text, res };
			return res;
		} finally {
			setLoading(false);
		}
	};

	return { loading, sendTextMessage, lastSentRef };
}
