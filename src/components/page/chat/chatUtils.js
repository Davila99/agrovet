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
        return {
          id: m.id,
          uid: `${m.id}-${timestamp}-${idx}`, // 🔹 UID único para React
          sender_id,
          text: m.text || m.content || m.message || "",
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
          if (existingByUid.has(im.uid)) {
            const ex = existingByUid.get(im.uid);
            existingByUid.set(im.uid, { ...ex, ...im });
          } else {
            existingByUid.set(im.uid, im);
          }
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
