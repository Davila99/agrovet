import { useState, useEffect, useRef, useCallback } from "react";
import { chatAPI } from "../../../services/endpoints";
import { normalizeStoredToken, dedupeMessages } from "./chatUtils";

export default function useChatRooms(activeId, externalSetRooms = null) {
  // If an external [rooms, setRooms] pair is provided, use it; otherwise
  // create internal state and setters.
  const [internalRooms, internalSetRooms] = useState([]);
  const rooms = externalSetRooms ? externalSetRooms[0] : internalRooms;
  const setRooms = externalSetRooms ? externalSetRooms[1] : internalSetRooms;
  const creatingRoomRef = useRef(new Set());

  // Define mergeRooms locally to ensure consistent merging & dedupe behavior
  const mergeRooms = useCallback((prevRooms, newRooms) => {
    const merged = [...(prevRooms || [])];

    (newRooms || []).forEach((newRoom) => {
      if (!newRoom || !newRoom.id) return;

      const existingIndex = merged.findIndex(
        (r) => String(r.id) === String(newRoom.id)
      );

      if (existingIndex === -1) {
        // new room, add to the start
        merged.unshift(newRoom);
      } else {
        const existing = merged[existingIndex] || {};
        const mergedMessages = dedupeMessages([
          ...(existing.messages || []),
          ...(newRoom.messages || []),
        ]);

        merged[existingIndex] = {
          ...existing,
          ...newRoom,
          messages: mergedMessages,
          lastMessage: newRoom.lastMessage || existing.lastMessage,
          last_activity: newRoom.last_activity || existing.last_activity,
          unread: newRoom.unread !== undefined ? newRoom.unread : existing.unread,
        };
      }
    });

    return merged;
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadRooms = async () => {
      try {
        const token = normalizeStoredToken(localStorage.getItem("token"));
        const data = await chatAPI.listRooms({ token });
        let list = [];
        if (Array.isArray(data)) list = data;
        else if (data && Array.isArray(data.results)) list = data.results;

        if (!mounted) return;
        const norm = list.map((r) => ({
          id: String(r.id),
          name: r.other_participant || r.name || `Room ${r.id}`,
          avatar: r.avatar || "",
          lastMessage: r.last_message || "",
          messages: r.messages || [],
          participants: r.participants || r.participants_list || [],
        }));
        setRooms((prev) => mergeRooms(prev, norm));
      } catch (e) {
        console.warn("listRooms failed", e);
      }
    };
    loadRooms();
    return () => {
      mounted = false;
    };
  }, [mergeRooms]);

  // open or create a private 1:1 room with dedupe guard
  const openOneToOne = async (specialist) => {
    try {
      const me = Number(localStorage.getItem("userId")) || null;
      const other = specialist && (specialist.id || specialist.user_id);
      if (!other) return null;
      const found = rooms.find((r) => {
        const parts = r.participants || [];
        return (
          parts.some((p) => String(p) === String(other) || String(p?.id) === String(other)) &&
          parts.some((p) => String(p) === String(me) || String(p?.id) === String(me))
        );
      });
      if (found) return found;

      if (creatingRoomRef.current.has(String(other))) return null;
      creatingRoomRef.current.add(String(other));

      const token = normalizeStoredToken(localStorage.getItem("token"));
      const payload = await chatAPI.createRoom([me, other], true)({ token });
      const r = payload && payload.id ? payload : (payload && payload.results && payload.results[0]) || null;
      if (r) {
        const norm = {
          id: String(r.id),
          name: r.other_participant || r.name || `Room ${r.id}`,
          avatar: r.avatar || "",
          messages: r.messages || [],
          participants: r.participants || r.participants_list || [],
          lastMessage: r.last_message || "",
        };
        setRooms((prev) => mergeRooms(prev, [norm]));
        return norm;
      }
      return null;
    } catch (e) {
      console.warn("openOneToOne failed", e);
      return null;
    } finally {
      try {
        const specialistId = specialist && (specialist.id || specialist.user_id);
        creatingRoomRef.current.delete(String(specialistId));
      } catch (e) {}
    }
  };

  // when activeId changes, load last messages for that room from API
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      // Treat literal strings 'null' and 'undefined' as missing activeId
      if (!activeId || String(activeId).toLowerCase() === 'null' || String(activeId).toLowerCase() === 'undefined') return;
      const token = normalizeStoredToken(localStorage.getItem("token"));
      try {
        const data = await chatAPI.getLastMessages(activeId, 100)({ token });
        const msgs = Array.isArray(data) ? data : data.results || [];
        if (!mounted) return;
        const normMsgs = msgs.map((m) => ({
          id: m.id,
          sender_id: m.sender_id || (m.sender && (m.sender.id || m.sender.user_id)) || m.senderId,
          text: m.text || m.content || m.message || "",
          media_id: m.media || (m.media_id || null),
          media_url: m.media_url || m.url || null,
          timestamp: m.timestamp || m.created_at,
          receipts: m.receipts || [],
        }));
          setRooms((prev) => {
          const found = prev.find((r) => String(r.id) === String(activeId));
          if (!found) return prev;
          const merged = mergeRooms(prev, [{ id: activeId, messages: normMsgs }]);
          return merged;
        });
          // After populating messages, attempt to enrich any messages that have a media_id but lack media_url
          (async () => {
            try {
              const mediaIds = Array.from(new Set(normMsgs.filter(m => m.media_id && !m.media_url).map(m => String(m.media_id))));
              if (!mediaIds.length) return;
              const apiBase = typeof window !== 'undefined' && window.__AGROVET_API_BASE ? String(window.__AGROVET_API_BASE).replace(/\/$/, '') : `${location.protocol}//${location.hostname}${location.port ? ':' + location.port : ''}`;
              const raw = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
              const token = raw ? raw.replace(/^Token\s*/i, '').replace(/^Bearer\s*/i, '') : null;
              const headers = token ? { Authorization: `Token ${token}` } : {};
              for (const mid of mediaIds) {
                try {
                  const url = `${apiBase}/api/media/${encodeURIComponent(mid)}/`;
                  const resp = await fetch(url, { headers });
                  if (!resp.ok) {
                    try { console.warn('[useChatRooms] media fetch failed', { mid, status: resp.status }); } catch (e) {}
                    continue;
                  }
                  const data = await resp.json();
                  const finalMediaUrl = data && (data.url || data.file_url || data.media_url || data.path || null);
                  const descr = data && (data.description || data.desc || null);
                  let parsedSpectrum = null;
                  try { parsedSpectrum = descr ? (typeof descr === 'string' ? JSON.parse(descr) : descr) : null; } catch (e) { parsedSpectrum = null; }
                  if (finalMediaUrl || parsedSpectrum) {
                    setRooms(prevRooms => {
                      try {
                        const copy = prevRooms.slice();
                        for (let ri = 0; ri < copy.length; ri++) {
                          const r = { ...(copy[ri] || {}) };
                          const msgs = Array.isArray(r.messages) ? r.messages.slice() : [];
                          let changed = false;
                          for (let mi = 0; mi < msgs.length; mi++) {
                            const mm = msgs[mi] || {};
                            if (String(mm.media_id) === String(mid) && (!mm.media_url || mm.media_url === null)) {
                              const updated = { ...(mm || {}) };
                              if (finalMediaUrl) {
                                updated.media_url = finalMediaUrl;
                                updated.mediaUrl = updated.mediaUrl || finalMediaUrl;
                                updated.previewUrl = updated.previewUrl || finalMediaUrl;
                                updated.media_uploading = false;
                                updated.media_upload_percent = null;
                              }
                              if (Array.isArray(parsedSpectrum)) {
                                updated.media_spectrum = parsedSpectrum;
                                updated.__spectrum_updated_at = new Date().toISOString();
                              }
                              msgs[mi] = updated;
                              changed = true;
                            }
                          }
                          if (changed) {
                            r.messages = msgs;
                            copy[ri] = r;
                          }
                        }
                        return copy;
                      } catch (e) {
                        return prevRooms;
                      }
                    });
                  }
                } catch (e) {
                  try { console.warn('[useChatRooms] error fetching media detail', { mid, err: String(e) }); } catch (ee) {}
                }
              }
            } catch (e) {}
          })();
      } catch (e) {
        console.warn("getLastMessages failed", e);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [activeId, mergeRooms]);

  return { rooms, setRooms, openOneToOne };
}
