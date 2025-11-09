// 🔧 Chat utilities: token normalization, timestamp formatting, avatars, and room merging

// ✅ Limpia tokens guardados (remueve prefijos Bearer o Token)
export const normalizeStoredToken = (raw) => {
  if (!raw) return null;
  const s = String(raw).trim();
  if (s === "null" || s === "undefined" || s === "") return null;
  return s.replace(/^Token\s*/i, "").replace(/^Bearer\s*/i, "");
};

// ✅ Formatea timestamps legibles
export const formatTimestamp = (ts) => {
  try {
    if (!ts) return "";
    const d =
      typeof ts === "string" && /\d{4}-\d{2}-\d{2}T/.test(ts)
        ? new Date(ts)
        : ts instanceof Date
        ? ts
        : new Date(ts);
    if (!d || Number.isNaN(d.getTime())) return String(ts).slice(0, 16);
    return d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "" + ts;
  }
};

// ✅ Resuelve correctamente las URLs de avatar
export const resolveAvatar = (src) => {
  try {
    if (!src) return "";
    const s = String(src);
    if (s.startsWith("/")) {
      const base =
        typeof window !== "undefined" && window.__AGROVET_API_BASE
          ? String(window.__AGROVET_API_BASE).replace(/\/$/, "")
          : "";
      return base ? base + s : s;
    }
    return s;
  } catch {
    return src;
  }
};

// Normalize display names: remove duplicated parentheses and unwrap single safe pair
export const cleanName = (n) => {
  if (!n) return n;
  try {
    let s = String(n);
    s = s.replace(/\(\(/g, "(").replace(/\)\)/g, ")");
    if (s.startsWith("(") && s.endsWith(")")) {
      const inner = s.slice(1, -1).trim();
      if (inner && !inner.includes("(") && !inner.includes(")")) return inner;
    }
    return s;
  } catch (e) {
    return n;
  }
};

// 🔹 mergeRooms con UID único para cada mensaje
export function mergeRooms(existing, incoming) {
  try {
    const byId = new Map();
    (existing || []).forEach((r) => byId.set(String(r.id), { ...r }));

    const participantsKey = (room) => {
      try {
        const parts =
          room.participants ||
          room.participants_list ||
          room.participantsIds ||
          [];
        const ids = parts
          .map((p) =>
            typeof p === "object" ? p.id || p.user_id || p.pk : p
          )
          .filter(Boolean)
          .map(String)
          .sort();
        return ids.join("-");
      } catch {
        return null;
      }
    };

    const privateIndex = new Map();
    (existing || []).forEach((r) => {
      const k = participantsKey(r);
      if (k) privateIndex.set(k, String(r.id));
    });

    const getLatestMsgContent = (msgs) => {
      try {
        if (!msgs || !msgs.length) return "";
        let best = null;
        let bestTs = 0;
        for (const m of msgs) {
          const t = m?.timestamp || m?.created_at || m?.ts || m?.time;
          const d = t ? new Date(t) : null;
          const ms = d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
          if (ms >= bestTs) {
            bestTs = ms;
            best = m;
          }
        }
        return best?.text || best?.content || best?.message || "";
      } catch {
        return "";
      }
    };

    const normalizeMessages = (msgs) =>
      (msgs || []).map((m, idx) => {
        const rawSender = m.sender_id || m.sender || m.senderId;
        const sender_id =
          rawSender && typeof rawSender === "object"
            ? rawSender.id || rawSender.user_id || rawSender.pk
            : rawSender;
        const timestamp = m.timestamp || m.created_at || new Date().toISOString();
        // Defensive: preserve media_spectrum and other media metadata so waveform
        // survives merges/normalization. We accept arrays or JSON strings.
        let media_spectrum = null;
        try {
          if (Array.isArray(m.media_spectrum)) media_spectrum = m.media_spectrum;
          else if (typeof m.media_spectrum === 'string') {
            const s = m.media_spectrum.trim();
            if (s.startsWith('[') || s.startsWith('{')) {
              const parsed = JSON.parse(s);
              if (Array.isArray(parsed)) media_spectrum = parsed;
              else if (parsed && Array.isArray(parsed.spectrum)) media_spectrum = parsed.spectrum;
            }
          } else if (m.media && m.media.description) {
            const d = m.media.description;
            if (Array.isArray(d)) media_spectrum = d;
            else if (typeof d === 'string') {
              try { const p = JSON.parse(d); if (Array.isArray(p)) media_spectrum = p; else if (p && Array.isArray(p.spectrum)) media_spectrum = p.spectrum; } catch(e){}
            }
          } else if (m.description) {
            const d = m.description;
            if (Array.isArray(d)) media_spectrum = d;
            else if (typeof d === 'string') {
              try { const p = JSON.parse(d); if (Array.isArray(p)) media_spectrum = p; else if (p && Array.isArray(p.spectrum)) media_spectrum = p.spectrum; } catch(e){}
            }
          }

        } catch (e) {
          media_spectrum = null;
        }

        return {
          id: m.id,
          uid: `${m.id}-${timestamp}-${idx}`, // 🔹 UID único para React
          sender_id,
          text: m.text || m.content || m.message || "",
          media_id: m.media || (m.media_id || null),
          media_url: m.media_url || m.url || null,
          media_spectrum: media_spectrum,
          media_type: m.media_type || (m.media && m.media.type) || null,
          media_uploading: Boolean(m.media_uploading),
          media_upload_percent: typeof m.media_upload_percent === 'number' ? m.media_upload_percent : null,
          timestamp,
          receipts: m.receipts || [],
          delivered: Boolean(m.delivered),
          delivered_at: m.delivered_at || null,
          read: Boolean(m.read),
          read_at: m.read_at || null,
          fromMe:
            Boolean(m.fromMe === true) ||
            String(sender_id) === String(localStorage.getItem("userId")),
        };
      });

    for (const r of incoming || []) {
      const rid = String(r.id);
      if (byId.has(rid)) {
        const cur = byId.get(rid);
        const curMsgs = cur.messages || [];
        const incomingMsgs = normalizeMessages(r.messages);

        const existingByUid = new Map(curMsgs.map((m) => [m.uid, { ...m }]));
        for (const im of incomingMsgs) {
          if (!existingByUid.has(im.uid)) {
            existingByUid.set(im.uid, im);
            continue;
          }

          const ex = existingByUid.get(im.uid);
          // merge fields but be explicit about receipts to avoid accidental loss
          const merged = { ...ex, ...im };
          if (Array.isArray(im.receipts) && im.receipts.length) {
            merged.receipts = im.receipts;
            try {
              console.debug('[mergeRooms] Actualizando receipts del mensaje', im.id, im.receipts);
            } catch (err) {
              // ignore logging failures in non-browser contexts
            }
          } else if (Array.isArray(ex.receipts) && ex.receipts.length) {
            merged.receipts = ex.receipts;
          } else {
            merged.receipts = merged.receipts || [];
          }

          existingByUid.set(im.uid, merged);
        }

        const combined = Array.from(existingByUid.values());
        byId.set(rid, {
          ...cur,
          messages: combined,
          lastMessage: getLatestMsgContent(combined) || cur.lastMessage,
        });
      } else {
        const partsNew = r.participants || r.participants_list || [];
        const dispNameNew = r.name || r.other_participant || `Room ${rid}`;
        const msgsNew = normalizeMessages(r.messages);
        byId.set(rid, {
          id: rid,
          name: dispNameNew,
          avatar: r.avatar || "",
          messages: msgsNew,
          participants: partsNew,
          lastMessage: getLatestMsgContent(msgsNew) || "",
        });
      }
    }

    const arr = Array.from(byId.values()).map((r) => ({
      ...r,
      __last_ts: (() => {
        try {
          if (r && r.last_activity) return new Date(r.last_activity).getTime();
          const msgs = r.messages || [];
          let max = 0;
          for (const m of msgs) {
            const t = (m && (m.timestamp || m.created_at || m.ts || m.time)) || null;
            if (!t) continue;
            const d = new Date(t);
            if (!Number.isNaN(d.getTime()) && d.getTime() > max) max = d.getTime();
          }
          return max || 0;
        } catch {
          return 0;
        }
      })(),
    }));

    arr.sort((a, b) => b.__last_ts - a.__last_ts);
    return arr;
  } catch (e) {
    console.error("mergeRooms error:", e);
    return (existing || []).concat(incoming || []);
  }
}

// Derive simple status ('sent'|'delivered'|'read') from receipts, optionally
// ignoring the current user's own receipt when computing aggregate status.
export function deriveStatusFromReceipts(receipts, me = null) {
  try {
    const list = Array.isArray(receipts) ? receipts.slice() : [];
    const filtered = list.filter((r) => !(me && String(r.user_id) === String(me)));
    const anyRead = filtered.some((r) => r && (r.read === true || r.read === 'true'));
    const allDelivered = filtered.length && filtered.every((r) => r && (r.delivered === true || r.delivered === 'true'));
    return anyRead ? 'read' : (allDelivered ? 'delivered' : 'sent');
  } catch (e) {
    return 'sent';
  }
}

// Update or insert a receipt for a user and return a new receipts array.
export function upsertReceipt(receipts, userId, status) {
  try {
    const now = new Date().toISOString();
    const list = Array.isArray(receipts) ? receipts.map(r => ({ ...(r || {}) })) : [];
    let found = false;
    for (let i = 0; i < list.length; i++) {
      if (String(list[i].user_id) === String(userId)) {
        found = true;
        if (status === 'read') { list[i].read = true; list[i].read_at = list[i].read_at || now; }
        else if (status === 'delivered') { list[i].delivered = true; list[i].delivered_at = list[i].delivered_at || now; }
        break;
      }
    }
    if (!found && userId) {
      list.push({ user_id: userId, delivered: status !== 'sent', delivered_at: status !== 'sent' ? now : null, read: status === 'read', read_at: status === 'read' ? now : null });
    }
    return list;
  } catch (e) {
    return receipts || [];
  }
}

// Find an optimistic message index in msgs array that corresponds to serverMsg
// Uses the same heuristics as before: client_msg_id, tmp_media_, tmp_+text, timestamp proximity, last tmp_
export function findOptimisticIndex(msgs, serverMsg) {
  try {
    if (!Array.isArray(msgs)) return -1;
    const dCid = serverMsg && (serverMsg.client_msg_id || null);
    if (dCid) {
      const idx = msgs.findIndex((m) => m.client_msg_id && String(m.client_msg_id) === String(dCid));
      if (idx !== -1) return idx;
    }

    // media match: tmp_media_
    if (serverMsg.media_url || serverMsg.media) {
      const idx = msgs.findIndex((m) => String(m.id).startsWith('tmp_media_') && String(m.sender_id) === String(serverMsg.sender_id));
      if (idx !== -1) return idx;
    }

    // exact text tmp_ match
    const idxText = msgs.findIndex((m) => String(m.id).startsWith('tmp_') && String(m.sender_id) === String(serverMsg.sender_id) && String((m.text||'').trim()) === String((serverMsg.text||'').trim()));
    if (idxText !== -1) return idxText;

    // timestamp proximity (5s)
    try {
      const serverTs = new Date(serverMsg.timestamp).getTime();
      const idxTs = msgs.findIndex((m) => {
        if (!String(m.id).startsWith('tmp_')) return false;
        const mTs = m.timestamp ? new Date(m.timestamp).getTime() : 0;
        if (!mTs) return false;
        return Math.abs(serverTs - mTs) <= 5000 && String(m.sender_id) === String(serverMsg.sender_id);
      });
      if (idxTs !== -1) return idxTs;
    } catch (e) {}

    // last tmp_ from same sender
    for (let ri = msgs.length - 1; ri >= 0; ri--) {
      const m = msgs[ri];
      if (!m || !m.id) continue;
      if (String(m.id).startsWith('tmp_') && String(m.sender_id) === String(serverMsg.sender_id)) return ri;
    }

    return -1;
  } catch (e) { return -1; }
}
