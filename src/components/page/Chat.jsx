import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  InputBase,
  Paper,
  useMediaQuery,
  AppBar,
  Toolbar,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Badge,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ReplyIcon from "@mui/icons-material/Reply";
import SpecialistsList from "./Dashboard/SpecialistsList";
import ChatBot from "./HomePage/ChatBot";
import {
  
  chatServiceFactory,
  connectPresence,
  getProfile,
} from "../../services/endpoints";

// Start with an empty rooms list — we'll show only real rooms from the server
const initialConversations = [];

export default function Chat() {
  const isMd = useMediaQuery("(min-width:900px)");
  // Rooms / conversations (source of truth for the list)
  const [rooms, setRooms] = useState(initialConversations);
  const [wsStatus, setWsStatus] = useState("CLOSED");
  const [sendError, setSendError] = useState(null);
  const [viewMode, setViewMode] = useState("chats");
  const serviceRef = React.useRef(null);
  const presenceRef = React.useRef(null);
  // No seleccionar automáticamente ningún chat al cargar — comportamiento tipo WhatsApp
  const [activeId, setActiveId] = useState(null);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);
  const [specialistSearch, setSpecialistSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});

  const activeConv = useMemo(
    () => rooms.find((c) => c.id === activeId) || null,
    [rooms, activeId]
  );

  // helper: determine current user id from localStorage/profile cached
  const getCurrentUserId = () => {
    const raw = localStorage.getItem("userId");
    if (!raw) return null;
    const n = Number(raw);
    return Number.isNaN(n) ? null : n;
  };

  // Resolve avatar urls and provide base prefix if needed
  const resolveAvatar = (src) => {
    try {
      if (!src) return "";
      const s = String(src);
      // If relative path, prefix with API base if available
      if (s.startsWith("/")) {
        const base =
          typeof window !== "undefined" && window.__AGROVET_API_BASE
            ? String(window.__AGROVET_API_BASE).replace(/\/$/, "")
            : "";
        return base ? base + s : s;
      }
      return s;
    } catch (e) {
      return src;
    }
  };

  const getReceiptUserId = (rc) => {
    if (!rc) return null;
    return (
      rc.user_id ||
      (rc.user && (rc.user.id || rc.user)) ||
      rc.user ||
      rc.userId ||
      null
    );
  };

  const computeLastTsForRoom = (r) => {
    try {
      // prefer explicit last_activity
      if (r && r.last_activity) {
        const d = new Date(r.last_activity);
        if (!Number.isNaN(d.getTime())) return d.getTime();
      }
      // otherwise inspect messages and pick the newest timestamp
      const msgs = r.messages || [];
      let max = 0;
      for (const m of msgs) {
        const t =
          (m && (m.timestamp || m.created_at || m.ts || m.time)) || null;
        if (!t) continue;
        const d = new Date(t);
        if (!Number.isNaN(d.getTime()) && d.getTime() > max) max = d.getTime();
      }
      return max || 0;
    } catch (e) {
      return 0;
    }
  };

  // Format timestamps consistently as `hh:mm AM/PM`
  const formatTimestamp = (ts) => {
    try {
      if (!ts) return "";
      // If ts looks like an ISO string, parse it
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
    } catch (e) {
      return "" + ts;
    }
  };

  const markUserOnline = (uid) => {
    if (!uid && uid !== 0) return;
    const id = String(uid);
    setOnlineUsers((prev) => {
      if (prev && prev[id]) return prev;
      return { ...(prev || {}), [id]: true };
    });
  };

  const markUserOffline = (uid) => {
    if (!uid && uid !== 0) return;
    const id = String(uid);
    setOnlineUsers((prev) => {
      if (!prev || !prev[id]) return prev || {};
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const isParticipantOnline = (p) => {
    try {
      const pid = p && (p.id || p);
      if (!pid) return false;
      const id = String(pid);
      // participant object may already contain `online` from server init
      if (p && typeof p.online !== "undefined")
        return Boolean(p.online) || Boolean(onlineUsers[id]);
      return Boolean(onlineUsers[id]);
    } catch (e) {
      return false;
    }
  };

  // normalize token helper (shared)
  const normalizeStoredToken = (raw) => {
    if (!raw) return null;
    const s = String(raw).trim();
    if (s === "null" || s === "undefined" || s === "") return null;
    return s.replace(/^Token\s*/i, "").replace(/^Bearer\s*/i, "");
  };

  // auto-scroll when activeConv messages change
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }, [activeConv?.messages?.length]);

  const selectChat = (id) => {
    setActiveId(id);
  };

  const navigate = useNavigate();

  // Open or create a 1:1 room with a specialist
  const openOneToOne = async (specialist) => {
    // show contact immediately in header while the room is created/loaded
    try {
      setSelectedContact(specialist);
    } catch (e) {}
    try {
      const normalizeStoredToken = (raw) => {
        if (!raw) return null;
        const s = String(raw).trim();
        if (s === "null" || s === "undefined" || s === "") return null;
        return s.replace(/^Token\s*/i, "").replace(/^Bearer\s*/i, "");
      };
      const token = normalizeStoredToken(localStorage.getItem("token"));
      let meId = localStorage.getItem("userId");
      // If localStorage doesn't have userId (or it's not a number), fetch profile
      if (!meId || String(meId).trim() === "" || Number.isNaN(Number(meId))) {
        try {
          const profile = await getProfile(token);
          if (profile && profile.id) {
            meId = String(profile.id);
            try {
              localStorage.setItem("userId", meId);
            } catch (e) {}
          }
        } catch (err) {
          console.warn("Could not determine authenticated user id", err);
        }
      }
      const participants = [Number(meId), Number(specialist.id)].filter(
        Boolean
      );
      if (participants.length !== 2) {
        throw new Error(
          "No se pudo determinar el usuario actual; por favor inicia sesión de nuevo."
        );
      }

      // Fetch current user's profile to determine role (specialist/businessman)
      let myProfile = null;
      try {
        myProfile = await getProfile(token);
      } catch (err) {
        console.debug("[Chat] could not fetch my profile for role check", err);
      }

      const isSpecial = (u) => {
        try {
          if (!u) return false;
          // u may be an object from the specialists list or the profile endpoint
          return Boolean(
            u.specialist_profile ||
              u.businessman_profile ||
              String(u.role || "").toLowerCase() === "specialist"
          );
        } catch (e) {
          return false;
        }
      };

      const meIsSpecial = isSpecial(myProfile) || isSpecial({ id: meId });
      const otherIsSpecial = isSpecial(specialist);
      // Backend requires private rooms to be between a specialist/business and a normal user
      if (
        (meIsSpecial && otherIsSpecial) ||
        (!meIsSpecial && !otherIsSpecial)
      ) {
        const msg =
          "No se puede crear un chat privado: ambos usuarios son del mismo tipo (especialista/usuario).";
        console.warn("[Chat] openOneToOne role validation failed", {
          meIsSpecial,
          otherIsSpecial,
        });
        setSendError(msg);
        throw new Error(msg);
      }
      console.debug("[Chat] openOneToOne payload", {
        participants,
        tokenPresent: !!token,
      });
      const res = await chatAPI.createRoom(participants, true)({ token });
      console.debug("[Chat] createRoom response", res);
      const room = res && (res.id ? res : Array.isArray(res) ? res[0] : null);
      if (room) {
        const incoming = [
          {
            id: String(room.id),
            name: specialist.full_name || specialist.username || "Chat",
            avatar:
              specialist.profile_picture_url ||
              specialist.profile_picture ||
              "",
            messages: room.messages || [],
            participants: room.participants || [
              { id: Number(meId) },
              { id: Number(specialist.id) },
            ],
          },
        ];
        setRooms((prev) => mergeRooms(prev, incoming));
        // set the active room - the existing effect will open the websocket
        console.debug("[Chat] opening room and setting activeId", {
          roomId: String(room.id),
        });
        setActiveId(String(room.id));
        setViewMode("chats");
        // Load chat history
        try {
          const history = await chatAPI.getLastMessages(room.id, 100);
          setRooms((prev) =>
            prev.map((r) =>
              String(r.id) === String(room.id)
                ? {
                    ...r,
                    messages: history.map((m) => ({
                      id: m.id,
                      text: m.content,
                      fromMe: m.sender.id === getCurrentUserId(),
                      timestamp: m.timestamp,
                    })),
                  }
                : r
            )
          );
        } catch (e) {
          console.error("Failed to load chat history", e);
        }
        // additional debug: if service already exists for a prior room, disconnect and allow effect to reconnect
        try {
          if (serviceRef.current) {
            console.debug(
              "[Chat] disconnecting existing service before new connection"
            );
            try {
              serviceRef.current.disconnect();
            } catch (e) {
              console.debug("[Chat] error disconnecting existing service", e);
            }
            serviceRef.current = null;
            setWsStatus("CLOSED");
          }
        } catch (e) {
          console.debug("[Chat] error handling existing service ref", e);
        }
      }
    } catch (e) {
      console.error("create/open 1:1 room failed", e);
      try {
        // Try to fetch raw error response to show serializer errors (helps debugging)
        const base =
          typeof window !== "undefined" && window.__AGROVET_API_BASE
            ? String(window.__AGROVET_API_BASE).replace(/\/$/, "")
            : location.hostname === "localhost" ||
              location.hostname === "127.0.0.1"
            ? "http://127.0.0.1:8000/api"
            : "https://agrovet.pythonanywhere.com/api";
        const url = `${base}/chat/rooms/`;
        const payload = { participants_ids: participants, is_private: true };
        const rawToken = localStorage.getItem("token");
        const tokenHeader = rawToken
          ? `Token ${String(rawToken)
              .replace(/^Token\s*/i, "")
              .replace(/^Bearer\s*/i, "")}`
          : null;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(tokenHeader ? { Authorization: tokenHeader } : {}),
          },
          body: JSON.stringify(payload),
        });
        let body = await res.text();
        try {
          body = JSON.parse(body);
        } catch (_) {}
        console.debug("[openOneToOne] raw createRoom fetch", {
          url,
          status: res.status,
          body,
        });
      } catch (_) {
        /* ignore secondary debug failure */
      }
    }
  };

  // clear selectedContact once the activeConv has authoritative data
  useEffect(() => {
    try {
      if (activeConv && (activeConv.name || activeConv.avatar)) {
        setSelectedContact(null);
      }
    } catch (e) {}
  }, [activeConv]);

  // When opening a room, mark messages as read for this user by sending a
  // control message over the websocket. Also optimistically update local
  // receipts so UI updates immediately.
  useEffect(() => {
    if (!activeId) return;
    const myId = getCurrentUserId();
    // Optimistically mark receipts in this room as read locally
    setRooms((prev) =>
      prev.map((r) => {
        if (String(r.id) !== String(activeId)) return r;
        const nowIso = new Date().toISOString();
        const msgs = (r.messages || []).map((m) => {
          try {
            // ensure receipts array exists and mark current user's receipt as read
            const receipts = Array.isArray(m.receipts) ? [...m.receipts] : [];
            const idx = receipts.findIndex(
              (rc) => String(getReceiptUserId(rc)) === String(myId)
            );
            if (idx !== -1) {
              receipts[idx] = {
                ...receipts[idx],
                read: true,
                read_at: receipts[idx].read_at || nowIso,
              };
            } else {
              // add a read receipt for this user (helps clearing unread badge)
              const senderId = m.sender_id || (m.sender && m.sender.id) || null;
              // Only add receipt for messages not sent by me
              if (!(String(senderId) === String(myId) || m.fromMe)) {
                receipts.push({
                  user_id: Number(myId),
                  read: true,
                  read_at: nowIso,
                  delivered: true,
                  delivered_at: nowIso,
                });
              }
            }
            return { ...m, receipts };
          } catch (e) {
            return m;
          }
        });
        return { ...r, messages: msgs };
      })
    );

    // Send mark_read via WS if connected
    try {
      const svc = serviceRef.current;
      if (svc && svc.isOpen()) {
        try {
          svc.send({ type: "mark_read" });
        } catch (e) {
          /* ignore */
        }
      }
    } catch (e) {}
  }, [activeId]);

  // IntersectionObserver: when a message from the other user becomes visible
  // mark the room as read (send mark_read) once per room per session.
  const readNotifiedRef = useRef(new Set());
  useEffect(() => {
    if (!activeId) return;
    const container = document.querySelector("#chat-messages-container");
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let seenOther = false;
        for (const e of entries) {
          const el = e.target;
          const fromMe = el.getAttribute("data-fromme") === "true";
          const visible = e.isIntersecting && e.intersectionRatio > 0.5;
          if (visible && !fromMe) {
            seenOther = true;
            break;
          }
        }
        if (seenOther && !readNotifiedRef.current.has(String(activeId))) {
          // send mark_read
          try {
            const svc = serviceRef.current;
            if (svc && svc.isOpen()) {
              try {
                svc.send({ type: "mark_read" });
              } catch (e) {}
            } else {
              // fall back to REST mark-read endpoint if you want (not implemented)
            }
          } catch (e) {}
          readNotifiedRef.current.add(String(activeId));
        }
      },
      { threshold: [0.5] }
    );

    // observe current message elements
    const msgs = container.querySelectorAll("[data-msg-id]");
    msgs.forEach((m) => observer.observe(m));
    return () => {
      try {
        observer.disconnect();
      } catch (e) {}
    };
  }, [activeId, activeConv?.messages?.length]);

  // Helper: create a deterministic key for private rooms based on participants
  const participantsKey = (room) => {
    try {
      const parts =
        room.participants ||
        room.participants_list ||
        room.participantsIds ||
        [];
      const ids = parts
        .map((p) => (typeof p === "object" ? p.id : p))
        .filter(Boolean)
        .map(String)
        .sort();
      return ids.join("-");
    } catch (e) {
      return null;
    }
  };

  // Helper: get a display name for a private room using the other participant's full_name/username
  const getDisplayNameFromParticipants = (parts, meId, fallback) => {
    try {
      if (!parts || parts.length === 0) return fallback || "";
      const pid = String(meId || localStorage.getItem("userId"));
      const others = parts.filter(
        (p) => String(typeof p === "object" ? p.id : p) !== String(pid)
      );
      const other = others.length
        ? others[0]
        : typeof parts[0] === "object"
        ? parts[0]
        : null;
      if (!other) return fallback || "";
      return (
        other.full_name ||
        other.username ||
        other.phone_number ||
        fallback ||
        ""
      );
    } catch (e) {
      return fallback || "";
    }
  };

  // Merge server rooms into local rooms with dedup for private rooms
  const mergeRooms = (existing, incoming) => {
    console.debug("[Chat] mergeRooms called", {
      existingCount: existing.length,
      incomingCount: incoming.length,
    });
    const byId = new Map();
    existing.forEach((r) => byId.set(String(r.id), { ...r }));

    // index private rooms by participant key to dedupe
    const privateIndex = new Map();
    existing.forEach((r) => {
      const k = participantsKey(r);
      if (k) privateIndex.set(k, String(r.id));
    });

    const getLatestMsgContent = (msgs) => {
      try {
        if (!msgs || !msgs.length) return "";
        let best = null;
        let bestTs = 0;
        for (const m of msgs) {
          const t =
            (m && (m.timestamp || m.created_at || m.ts || m.time)) || null;
          const d = t ? new Date(t) : null;
          const ms = d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
          if (ms >= bestTs) {
            bestTs = ms;
            best = m;
          }
        }
        if (!best) return "";
        return best.content || best.text || best.message || "";
      } catch (e) {
        return "";
      }
    };

    incoming.forEach((r) => {
      const rid = String(r.id);
      if (byId.has(rid)) {
        // merge messages and metadata
        const cur = byId.get(rid);
        const curMsgs = cur.messages || [];
        const incomingMsgs = (r.messages || []).map((m) => ({
          id: m.id,
          sender_id: m.sender_id || m.sender || m.senderId,
          content: m.content || m.text || "",
          timestamp: m.timestamp || m.created_at,
          receipts: m.receipts || [],
          delivered: Boolean(m.delivered),
          delivered_at: m.delivered_at || null,
          read: Boolean(m.read),
          read_at: m.read_at || null,
          fromMe: Boolean(
            m.fromMe === true ||
              ((m.sender_id || (m.sender && m.sender.id)) &&
                String(m.sender_id || (m.sender && m.sender.id)) ===
                  String(getCurrentUserId()))
          ),
        }));
        // Merge incoming message attributes into existing messages when ids match
        const existingById = new Map(
          curMsgs.map((m) => [String(m.id), { ...m }])
        );
        for (const im of incomingMsgs) {
          const key = String(im.id);
          if (existingById.has(key)) {
            // merge: prefer incoming fields for receipts/read/delivered but keep existing other fields
            const ex = existingById.get(key);
            existingById.set(key, { ...ex, ...im });
          } else {
            existingById.set(key, im);
          }
        }
        const combined = Array.from(existingById.values());
        byId.set(rid, {
          ...cur,
          messages: combined,
          lastMessage: getLatestMsgContent(combined) || cur.lastMessage,
        });
      } else {
        // check private dedupe by participants
        const k = participantsKey(r);
        if (k && privateIndex.has(k)) {
          const existingId = privateIndex.get(k);
          const partsExist = r.participants || r.participants_list || [];
          const dispNameExist =
            r.name ||
            getDisplayNameFromParticipants(
              partsExist,
              localStorage.getItem("userId"),
              ""
            );
          const cur = byId.get(existingId) || {
            id: existingId,
            messages: [],
            name: dispNameExist || "",
            avatar: r.avatar || "",
          };
          const curMsgs = cur.messages || [];
          const incomingMsgs = (r.messages || []).map((m) => ({
            id: m.id,
            sender_id: m.sender_id || m.sender || m.senderId,
            content: m.content || m.text || "",
            timestamp: m.timestamp || m.created_at,
            receipts: m.receipts || [],
            delivered: Boolean(m.delivered),
            delivered_at: m.delivered_at || null,
            read: Boolean(m.read),
            read_at: m.read_at || null,
            fromMe: Boolean(
              m.fromMe === true ||
                ((m.sender_id || (m.sender && m.sender.id)) &&
                  String(m.sender_id || (m.sender && m.sender.id)) ===
                    String(getCurrentUserId()))
            ),
          }));
          const existingById = new Map(
            curMsgs.map((m) => [String(m.id), { ...m }])
          );
          for (const im of incomingMsgs) {
            const key = String(im.id);
            if (existingById.has(key)) {
              const ex = existingById.get(key);
              existingById.set(key, { ...ex, ...im });
            } else {
              existingById.set(key, im);
            }
          }
          const combined = Array.from(existingById.values());
          byId.set(existingId, {
            ...cur,
            messages: combined,
            lastMessage: getLatestMsgContent(combined) || cur.lastMessage,
          });
        } else {
          // new room
          const partsNew = r.participants || r.participants_list || [];
          const dispNameNew =
            r.name ||
            getDisplayNameFromParticipants(
              partsNew,
              localStorage.getItem("userId"),
              `Room ${rid}`
            ); // Updated to use computed display name consistently
          const msgsNew = (r.messages || []).map((m) => ({
            id: m.id,
            sender_id: m.sender_id || m.sender || m.senderId,
            content: m.content || m.text || "",
            timestamp: m.timestamp || m.created_at,
            receipts: m.receipts || [],
            delivered: Boolean(m.delivered),
            delivered_at: m.delivered_at || null,
            read: Boolean(m.read),
            read_at: m.read_at || null,
            fromMe: Boolean(
              m.fromMe === true ||
                ((m.sender_id || (m.sender && m.sender.id)) &&
                  String(m.sender_id || (m.sender && m.sender.id)) ===
                    String(getCurrentUserId()))
            ),
          }));
          byId.set(rid, {
            id: rid,
            name: dispNameNew,
            avatar: r.avatar || "",
            messages: msgsNew,
            participants: partsNew,
            lastMessage: getLatestMsgContent(msgsNew) || "",
          });
          if (k) privateIndex.set(k, rid);
        }
      }
    });

    // Return rooms sorted by most recent activity (last message timestamp or lastActivity)
    const arr = Array.from(byId.values()).map((r) => ({
      ...r,
      __last_ts: computeLastTsForRoom(r),
    }));
    arr.sort((a, b) => b.__last_ts - a.__last_ts);
    return arr;
  };

  const goBackToList = () => setActiveId(null);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !activeId) return;
    // optimistic message with client_msg_id
    const client_msg_id =
      "cmsg_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
    // optimistic message: timestamp as ISO so we can format consistently later
    const nextMsg = {
      id: client_msg_id,
      fromMe: true,
      text: trimmed,
      timestamp: new Date().toISOString(),
      client_msg_id,
      reply_to: replyTo
        ? { id: replyTo.id, text: replyTo.text, senderName: replyTo.senderName }
        : null,
    };
    setRooms((prev) => {
      // append message to active room and move room to top
      const updated = prev.map((c) => {
        if (String(c.id) !== String(activeId)) return c;
        return {
          ...c,
          messages: [...(c.messages || []), nextMsg],
          lastMessage: trimmed,
        };
      });
      // find the updated room and move to top
      const idx = updated.findIndex((r) => String(r.id) === String(activeId));
      if (idx > 0) {
        const [room] = updated.splice(idx, 1);
        return [room, ...updated];
      }
      return updated;
    });
    // send via WS if connected — wait a short time for the socket, then
    // fallback silently to REST. Only surface an error to the user if both
    // transports fail.
    let serverMessageId = null;
    let wsSucceeded = false;
    try {
      const svc = serviceRef.current;
      if (svc) {
        // wait up to 400ms for socket to become open (shorter to reduce latency)
        const start = Date.now();
        while (!svc.isOpen() && Date.now() - start < 400) {
          // small sleep
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 80));
        }
        if (svc.isOpen()) {
          try {
            svc.send({
              content: trimmed,
              client_msg_id,
              reply_to: replyTo ? { id: replyTo.id, text: replyTo.text } : null,
            });
            wsSucceeded = true;
            // clear previous transient send errors
            setSendError(null);
          } catch (wsErr) {
            // don't spam console with stack for the expected 'Socket not open'
            console.debug("[Chat] WS send failed, will try REST fallback");
            wsSucceeded = false;
          }
        } else {
          // socket isn't open — will use REST fallback
          wsSucceeded = false;
        }
      } else {
        wsSucceeded = false;
      }
    } catch (e) {
      // treat as WS failure and try REST below
      console.debug("[Chat] unexpected WS send error, falling back to REST");
      wsSucceeded = false;
    }

    // If WS didn't succeed, attempt REST fallback. Only set sendError if REST also fails.
    if (!wsSucceeded) {
      try {
        const token = normalizeStoredToken(localStorage.getItem("token"));
        const res = await chatAPI.sendMessage(activeId, trimmed)({ token });
        if (res && res.id) serverMessageId = res.id;
        // clear previous transient send errors on success
        setSendError(null);
      } catch (err) {
        // both transports failed — surface a friendly error message but avoid noisy stacks
        console.error(
          "[Chat] REST fallback failed to send message",
          err && err.message ? err.message : err
        );
        setSendError("No se pudo enviar el mensaje. Revisa tu conexión.");
      }
    }
    setText("");
    // clear reply preview after sending
    setReplyTo(null);
    // Scroll to bottom
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );
    // If REST fallback returned a server id, reconcile it in rooms. Keep `fromMe: true`
    if (serverMessageId) {
      setRooms((prev) =>
        prev.map((r) => {
          if (String(r.id) !== String(activeId)) return r;
          const msgs = (r.messages || []).map((m) =>
            m.client_msg_id === client_msg_id
              ? { ...m, id: serverMessageId, fromMe: true }
              : m
          );
          return { ...r, messages: msgs };
        })
      );
    }
  };

  // Handle Enter to send, Shift+Enter for newline
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Load rooms on mount
  useEffect(() => {
    let mounted = true;
    const loadRooms = async () => {
      try {
        const normalizeStoredToken = (raw) => {
          if (!raw) return null;
          const s = String(raw).trim();
          if (s === "null" || s === "undefined" || s === "") return null;
          return s.replace(/^Token\s*/i, "").replace(/^Bearer\s*/i, "");
        };
        const token = normalizeStoredToken(localStorage.getItem("token"));
        const data = await chatAPI.listRooms({ token });
        let list = [];
        if (Array.isArray(data)) list = data;
        else if (data && Array.isArray(data.results)) list = data.results;
        if (!mounted) return;
        // normalize incoming rooms; prefer server-provided `other_participant` when present
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
    // Do not inject template/bot rooms here — leave rooms strictly to server data
    return () => {
      mounted = false;
    };
  }, []);

  // Presence socket: keep a background WS open so this browser session
  // is always subscribed to `user_<id>` group and receives notifications
  // even when the user doesn't have a specific room open.
  useEffect(() => {
    const normalizeStoredToken = (raw) => {
      if (!raw) return null;
      const s = String(raw).trim();
      if (s === "null" || s === "undefined" || s === "") return null;
      return s.replace(/^Token\s*/i, "").replace(/^Bearer\s*/i, "");
    };
    const token = normalizeStoredToken(localStorage.getItem("token"));
    if (!token) return;
    try {
      let fallbackTimer = null;
      const presenceSvc = connectPresence(token, {
        onOpen: () => {
          console.debug("[Chat] presence socket OPEN");
        },
        onMessage: (ev) => {
          try {
            const raw =
              typeof ev === "string" ? ev : ev && ev.data ? ev.data : ev;
            const d = typeof raw === "string" ? JSON.parse(raw) : raw;
            console.debug("[Chat] presence onMessage parsed", {
              raw,
              parsed: d,
            });
            // presence notifications from server
            if (d && d.type === "presence.online") {
              try {
                markUserOnline(d.user_id || d.user || (d.user && d.user.id));
              } catch (e) {}
              return;
            }
            if (d && d.type === "presence.offline") {
              try {
                markUserOffline(d.user_id || d.user || (d.user && d.user.id));
              } catch (e) {}
              return;
            }
            if (d && d.type === "init_rooms" && Array.isArray(d.rooms)) {
              const incoming = d.rooms.map((r) => ({
                id: String(r.id),
                name:
                  r.other_participant ||
                  r.name ||
                  getDisplayNameFromParticipants(
                    r.participants || [],
                    localStorage.getItem("userId"),
                    `Room ${r.id}`
                  ),
                avatar: r.avatar || "",
                messages: r.messages || [],
                participants: r.participants || r.participants_list || [],
              }));
              setRooms((prev) => mergeRooms(prev, incoming));
              // mark any participants flagged as online by server
              try {
                const meId = getCurrentUserId();
                for (const r of d.rooms) {
                  const parts = r.participants || [];
                  for (const p of parts) {
                    try {
                      if (!p) continue;
                      const pid = p.id || p;
                      if (!pid) continue;
                      if (String(pid) === String(meId)) continue;
                      if (p.online) markUserOnline(pid);
                    } catch (e) {}
                  }
                }
              } catch (e) {}
              return;
            }
            // Handle read and delivery notifications sent to per-user presence channel
            if (d && d.type === "chat.read") {
              try {
                const roomId = d.room_id;
                const userId =
                  d.user_id || d.user || (d.user && d.user.id) || null;
                const messageIds = Array.isArray(d.message_ids)
                  ? d.message_ids.map(String)
                  : null;
                const readInfo = d.read_info || null; // optional mapping of message_id -> { read, read_at }
                setRooms((prev) =>
                  prev.map((r) => {
                    if (String(r.id) !== String(roomId)) return r;
                    const msgs = (r.messages || []).map((m) => {
                      const mid = String(
                        m.id || m.message_id || m.client_msg_id || ""
                      );
                      const receipts = Array.isArray(m.receipts)
                        ? [...m.receipts]
                        : [];
                      if (messageIds && !messageIds.includes(mid))
                        return { ...m };
                      const idx = receipts.findIndex(
                        (rc) => String(getReceiptUserId(rc)) === String(userId)
                      );
                      if (idx !== -1) {
                        const readAt =
                          readInfo && readInfo[mid] && readInfo[mid].read_at
                            ? readInfo[mid].read_at
                            : receipts[idx].read_at || new Date().toISOString();
                        receipts[idx] = {
                          ...receipts[idx],
                          read: true,
                          read_at: readAt,
                          delivered: true,
                          delivered_at:
                            receipts[idx].delivered_at ||
                            new Date().toISOString(),
                        };
                        // also set aggregate message flags if provided by server
                        if (readInfo && readInfo[mid]) {
                          return {
                            ...m,
                            receipts,
                            read: Boolean(readInfo[mid].read),
                            read_at: readInfo[mid].read_at,
                          };
                        }
                      } else {
                        const readAt =
                          readInfo && readInfo[mid] && readInfo[mid].read_at
                            ? readInfo[mid].read_at
                            : new Date().toISOString();
                        receipts.push({
                          user_id: Number(userId),
                          read: true,
                          read_at: readAt,
                          delivered: true,
                          delivered_at: new Date().toISOString(),
                        });
                        if (readInfo && readInfo[mid]) {
                          return {
                            ...m,
                            receipts,
                            read: Boolean(readInfo[mid].read),
                            read_at: readInfo[mid].read_at,
                          };
                        }
                      }
                      return { ...m, receipts };
                    });
                    return { ...r, messages: msgs };
                  })
                );
              } catch (e) {
                console.debug("[Chat] presence failed applying chat.read", e);
              }
              return;
            }
            if (d && d.type === "chat.delivery") {
              try {
                const roomId = d.room_id || d.room || null;
                const messageId = d.message_id || d.message || null;
                const userId =
                  d.user_id || d.user || (d.user && d.user.id) || null;
                const deliveredAt =
                  d.delivered_at || d.message_delivered_at || null;
                setRooms((prev) =>
                  prev.map((r) => {
                    if (String(r.id) !== String(roomId)) return r;
                    const msgs = (r.messages || []).map((m) => {
                      if (!messageId) return m;
                      if (
                        String(m.id) !== String(messageId) &&
                        String(m.message_id || "") !== String(messageId)
                      )
                        return m;
                      const receipts = Array.isArray(m.receipts)
                        ? m.receipts.map((rc) => {
                            const rid = getReceiptUserId(rc);
                            if (String(rid) === String(userId))
                              return {
                                ...rc,
                                delivered: true,
                                delivered_at:
                                  rc.delivered_at ||
                                  deliveredAt ||
                                  new Date().toISOString(),
                              };
                            return rc;
                          })
                        : [];
                      if (
                        !receipts.find(
                          (rc) =>
                            String(getReceiptUserId(rc)) === String(userId)
                        )
                      ) {
                        receipts.push({
                          user_id: Number(userId),
                          delivered: true,
                          delivered_at: deliveredAt || new Date().toISOString(),
                        });
                      }
                      // apply aggregate message-level delivered flag if payload provides it
                      const updatedMsg = { ...m, receipts };
                      if (typeof d.message_delivered !== "undefined") {
                        updatedMsg.delivered = Boolean(d.message_delivered);
                        if (d.message_delivered_at)
                          updatedMsg.delivered_at = d.message_delivered_at;
                      }
                      return updatedMsg;
                    });
                    return { ...r, messages: msgs };
                  })
                );
              } catch (e) {
                console.debug(
                  "[Chat] presence failed applying chat.delivery",
                  e
                );
              }
              return;
            }
            const incomingRoomId =
              d.room_id || (d.room && (d.room.id || d.room)) || null;
            const roomId = incomingRoomId || null;
            if (roomId) {
              const msg = {
                id: d.message_id || "smsg_" + Date.now(),
                fromMe: false,
                text: d.message || d.content || "",
                username: d.username,
                timestamp: d.timestamp || new Date().toISOString(),
                client_msg_id: d.client_msg_id,
              };
              setRooms((prev) => {
                const copy = [...prev];
                const idx = copy.findIndex(
                  (r) => String(r.id) === String(roomId)
                );
                if (idx === -1) {
                  const parts = d.participants || [];
                  const newRoom = {
                    id: roomId,
                    name:
                      d.room?.name ||
                      getDisplayNameFromParticipants(
                        parts,
                        localStorage.getItem("userId"),
                        d.username || "Nuevo chat"
                      ),
                    avatar: d.avatar || "",
                    messages: [msg],
                    participants: parts,
                    lastMessage: msg.text,
                  };
                  return [newRoom, ...copy];
                }
                const r = copy[idx];
                let msgs = r.messages ? [...r.messages] : [];
                if (d.client_msg_id) {
                  msgs = msgs.map((m) =>
                    m.client_msg_id === d.client_msg_id
                      ? {
                          ...m,
                          id: d.message_id || m.id,
                          fromMe: false,
                          text: d.message || m.text,
                          timestamp: msg.timestamp,
                        }
                      : m
                  );
                  if (!msgs.find((m) => m.client_msg_id === d.client_msg_id))
                    msgs.push(msg);
                } else {
                  msgs.push(msg);
                }
                const updated = { ...r, messages: msgs, lastMessage: msg.text };
                copy.splice(idx, 1);
                return [updated, ...copy];
              });
            }
          } catch (e) {
            console.error("[Chat] presence onMessage parse", e);
          }
        },
        onClose: () => {
          console.debug("[Chat] presence socket CLOSED");
          setWsStatus("CLOSED");
        },
        onError: (e) => {
          console.debug("[Chat] presence socket ERROR", e);
        },
      });
      presenceRef.current = presenceSvc;

      // Fallback: if init_room or messages do not arrive within 800ms, fetch via REST
      fallbackTimer = setTimeout(async () => {
        try {
          const current = rooms.find((r) => String(r.id) === String(activeId));
          const hasMsgs =
            current && current.messages && current.messages.length;
          if (!hasMsgs) {
            console.debug(
              "[Chat] WS init not received, fetching last_messages via REST fallback",
              { room: activeId }
            );
            const token = localStorage.getItem("token");
            const msgs = await chatAPI.getLastMessages(
              activeId,
              100
            )({ token });
            if (Array.isArray(msgs) && msgs.length) {
              const incoming = [
                {
                  id: String(activeId),
                  name: msgs.room_name || current?.name || `Room ${activeId}`,
                  avatar: current?.avatar || "",
                  messages: msgs.map((m) => ({
                    id: m.id,
                    sender_id: (m.sender && m.sender.id) || m.sender_id,
                    text: m.content,
                    content: m.content,
                    timestamp: m.timestamp,
                    receipts: m.receipts || [],
                    delivered: m.delivered || false,
                    delivered_at: m.delivered_at || null,
                    read: m.read || false,
                    read_at: m.read_at || null,
                  })),
                  participants: current?.participants || [],
                },
              ];
              setRooms((prev) => mergeRooms(prev, incoming));
            }
          }
        } catch (err) {
          console.debug("[Chat] REST fallback last_messages failed", err);
        }
      }, 800);
    } catch (e) {
      console.warn("[Chat] presence socket failed", e);
    }
    return () => {
      try {
        clearTimeout(fallbackTimer);
      } catch (e) {}
      try {
        presenceRef.current?.disconnect();
      } catch (e) {}
    };
  }, []);

  // Polling fallback: refresh room list periodically so UI updates even if
  // WebSocket/Presence connection fails. Runs every 8s.
  useEffect(() => {
    let mounted = true;
    const normalizeStoredToken = (raw) => {
      if (!raw) return null;
      const s = String(raw).trim();
      if (s === "null" || s === "undefined" || s === "") return null;
      return s.replace(/^Token\s*/i, "").replace(/^Bearer\s*/i, "");
    };
    const poll = async () => {
      try {
        const token = normalizeStoredToken(localStorage.getItem("token"));
        const data = await chatAPI.listRooms({ token });
        let list = [];
        if (Array.isArray(data)) list = data;
        else if (data && Array.isArray(data.results)) list = data.results;
        if (!mounted) return;
        const norm = list.map((r) => ({
          id: String(r.id),
          name: r.name || `Room ${r.id}`,
          avatar: r.avatar || "",
          lastMessage: r.last_message || "",
          messages: r.messages || [],
          participants: r.participants || r.participants_list || [],
        }));
        setRooms((prev) => mergeRooms(prev, norm));
      } catch (e) {
        /* ignore polling errors */
      }
    };
    // start immediately then every 8s
    poll();
    const id = setInterval(poll, 8000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // Connect WebSocket when activeId changes
  useEffect(() => {
    // disconnect previous
    if (serviceRef.current) {
      try {
        serviceRef.current.disconnect();
      } catch (e) {}
      serviceRef.current = null;
      setWsStatus("CLOSED");
    }
    if (!activeId) return;
    // don't open a websocket for the embedded ChatBot pseudo-room
    if (String(activeId) === "bot-chat") return;
    const svc = chatServiceFactory();
    const token = localStorage.getItem("token");
    try {
      console.debug("[Chat] about to connect WS", {
        activeId,
        token_present: !!token,
        token_masked: token ? String(token).slice(0, 6) + "..." : null,
      });
    } catch (e) {}
    svc.connect(activeId, token, {
      onOpen: () => {
        setWsStatus("OPEN");
      },
      onMessage: (ev) => {
        try {
          const raw =
            typeof ev === "string" ? ev : ev && ev.data ? ev.data : ev;
          const d = typeof raw === "string" ? JSON.parse(raw) : raw;
          console.debug("[Chat] ws onMessage parsed", {
            raw,
            parsed: d,
            activeId,
          });
          // presence notifications may also arrive here
          if (d && d.type === "presence.online") {
            try {
              markUserOnline(d.user_id || d.user || (d.user && d.user.id));
            } catch (e) {}
            return;
          }
          if (d && d.type === "presence.offline") {
            try {
              markUserOffline(d.user_id || d.user || (d.user && d.user.id));
            } catch (e) {}
            return;
          }
          // Handle read notifications from server
          if (d && d.type === "chat.read") {
            try {
              const roomId = d.room_id;
              const userId =
                d.user_id || d.user || (d.user && d.user.id) || null;
              const messageIds = Array.isArray(d.message_ids)
                ? d.message_ids.map(String)
                : null;
              // mark receipts read in local state for that room (flexible receipt shapes)
              setRooms((prev) =>
                prev.map((r) => {
                  if (String(r.id) !== String(roomId)) return r;
                  const msgs = (r.messages || []).map((m) => {
                    const mid = String(
                      m.id || m.message_id || m.client_msg_id || ""
                    );
                    const receipts = Array.isArray(m.receipts)
                      ? [...m.receipts]
                      : [];
                    // If server provided explicit message_ids, only update those
                    if (messageIds && !messageIds.includes(mid))
                      return { ...m };
                    // try to find an existing receipt for that user
                    const idx = receipts.findIndex(
                      (rc) => String(getReceiptUserId(rc)) === String(userId)
                    );
                    if (idx !== -1) {
                      receipts[idx] = {
                        ...receipts[idx],
                        read: true,
                        read_at:
                          receipts[idx].read_at || new Date().toISOString(),
                        delivered: true,
                        delivered_at:
                          receipts[idx].delivered_at ||
                          new Date().toISOString(),
                      };
                    } else {
                      // add a receipt entry so UI can render ticks
                      receipts.push({
                        user_id: Number(userId),
                        read: true,
                        read_at: new Date().toISOString(),
                        delivered: true,
                        delivered_at: new Date().toISOString(),
                      });
                    }
                    return { ...m, receipts };
                  });
                  return { ...r, messages: msgs };
                })
              );
            } catch (e) {
              console.debug("[Chat] failed applying chat.read", e);
            }
            return;
          }
          // Handle delivery notifications (recipient received message)
          if (d && d.type === "chat.delivery") {
            try {
              const roomId = d.room_id || d.room || activeId;
              const messageId = d.message_id || d.message || null;
              const userId =
                d.user_id || d.user || (d.user && d.user.id) || null;
              setRooms((prev) =>
                prev.map((r) => {
                  if (String(r.id) !== String(roomId)) return r;
                  const msgs = (r.messages || []).map((m) => {
                    if (String(m.id) !== String(messageId)) return m;
                    const receipts = Array.isArray(m.receipts)
                      ? m.receipts.map((rc) => {
                          const rid = getReceiptUserId(rc);
                          if (String(rid) === String(userId))
                            return {
                              ...rc,
                              delivered: true,
                              delivered_at:
                                rc.delivered_at || new Date().toISOString(),
                            };
                          return rc;
                        })
                      : [];
                    return { ...m, receipts };
                  });
                  return { ...r, messages: msgs };
                })
              );
            } catch (e) {
              console.debug("[Chat] failed applying chat.delivery", e);
            }
            return;
          }
          // If server sent an initialization payload with rooms/messages
          if (d && d.type === "init_rooms" && Array.isArray(d.rooms)) {
            const incoming = d.rooms.map((r) => ({
              id: String(r.id),
              name: r.name || `Room ${r.id}`,
              avatar: r.avatar || "",
              messages: r.messages || [],
              participants: r.participants || r.participants_list || [],
            }));
            setRooms((prev) => mergeRooms(prev, incoming));
            return;
          }
          // If server sent a single-room init payload with history
          if (d && d.type === "init_room" && d.room) {
            try {
              const r = d.room;
              const incoming = {
                id: String(r.id),
                name: r.other_participant || r.name || `Room ${r.id}`,
                avatar: r.avatar || "",
                messages: (r.messages || []).map((m) => ({
                  id: m.id,
                  sender_id: m.sender_id,
                  text: m.content,
                  content: m.content,
                  timestamp: m.timestamp,
                  receipts: m.receipts || [],
                  delivered: m.delivered || false,
                  delivered_at: m.delivered_at || null,
                  read: m.read || false,
                  read_at: m.read_at || null,
                })),
                participants: r.participants || [],
              };
              setRooms((prev) => mergeRooms(prev, [incoming]));
              // if this is the active room, ensure activeConv updates and scrolled
              return;
            } catch (e) {
              console.debug("[Chat] failed merging init_room", e);
            }
          }
          // normalize incoming room id (server may send room_id or room object)
          const incomingRoomId =
            d.room_id || (d.room && (d.room.id || d.room)) || null;
          const roomId = incomingRoomId || activeId;
          // server payload: message, username, timestamp, client_msg_id, sender_id
          const currentUserId = getCurrentUserId();
          const msg = {
            id: d.message_id || "smsg_" + Date.now(),
            sender_id: d.sender_id || d.sender_id || null,
            fromMe:
              (currentUserId &&
                String(d.sender_id) === String(currentUserId)) ||
              false,
            text: d.message || d.content || "",
            content: d.content || d.message || "",
            username: d.username,
            timestamp: d.timestamp || new Date().toISOString(),
            client_msg_id: d.client_msg_id,
            receipts: d.receipts || d.message_receipts || [],
            delivered:
              typeof d.delivered !== "undefined"
                ? d.delivered
                : typeof d.message_delivered !== "undefined"
                ? d.message_delivered
                : false,
            delivered_at: d.delivered_at || d.message_delivered_at || null,
            read: typeof d.read !== "undefined" ? d.read : false,
            read_at:
              d.read_at ||
              (d.read_info &&
                d.read_info[String(d.message_id || "")] &&
                d.read_info[String(d.message_id || "")].read_at) ||
              null,
          };

          setRooms((prev) => {
            const copy = [...prev];
            const idx = copy.findIndex((r) => String(r.id) === String(roomId));

            // If room not found, create it and place at top
            if (idx === -1) {
              const newRoom = {
                id: roomId || d.id || "r_" + Date.now(),
                name: d.name || d.username || "Nuevo chat",
                avatar: d.avatar || "",
                messages: [msg],
                lastMessage: msg.text,
              };
              return [newRoom, ...copy];
            }

            // Update existing room: reconcile optimistic message or append
            const r = copy[idx];
            let msgs = r.messages ? [...r.messages] : [];
            if (d.client_msg_id) {
              msgs = msgs.map((m) =>
                m.client_msg_id === d.client_msg_id
                  ? {
                      ...m,
                      id: d.message_id || m.id,
                      fromMe: msg.fromMe,
                      text: d.message || m.text,
                      timestamp: msg.timestamp,
                    }
                  : m
              );
              if (!msgs.find((m) => m.client_msg_id === d.client_msg_id))
                msgs.push(msg);
            } else {
              msgs.push(msg);
            }

            const updated = { ...r, messages: msgs, lastMessage: msg.text };
            // move updated room to top
            copy.splice(idx, 1);
            return [updated, ...copy];
          });
        } catch (e) {
          console.error("ws message parse", e);
        }
      },
      onClose: () => {
        setWsStatus("CLOSED");
      },
      onError: (e) => {
        console.debug("ws error", e);
        setWsStatus("ERROR");
        setSendError(String(e));
      },
    });
    serviceRef.current = svc;
    return () => {
      try {
        svc.disconnect();
      } catch (e) {}
      serviceRef.current = null;
      setWsStatus("CLOSED");
    };
  }, [activeId]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (serviceRef.current) {
        try {
          serviceRef.current.disconnect();
        } catch (e) {}
      }
    };
  }, []);

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      {/* Lista lateral - oculta en móvil cuando se está en un chat */}
      {(!activeId || isMd) && (
        <Box
          sx={{
            // left pane width tuned to match specialists panel (WhatsApp-like)
            // use same width for chats and specialists on md+ for visual consistency
            width: { xs: "100%", md: 420 },
            borderRight: { md: "1px solid rgba(0,0,0,0.08)" },
            bgcolor: "background.paper",
            display: { xs: activeId && !isMd ? "none" : "block" },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Chats</Typography>
            <Typography variant="caption" color="text.secondary">
              Conversaciones recientes
            </Typography>

            {/* Rounded search box above the buttons (WhatsApp-style) */}
            <Box sx={{ mt: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Buscar especialistas"
                value={specialistSearch}
                onChange={(e) => setSpecialistSearch(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "999px",
                    backgroundColor: "rgba(0,0,0,0.02)",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                variant={viewMode === "chats" ? "contained" : "outlined"}
                size="small"
                onClick={() => setViewMode("chats")}
                sx={{
                  borderRadius: "999px",
                  textTransform: "none",
                  ...(viewMode === "chats"
                    ? {
                        backgroundColor: "#1565C0",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#0f4a86" },
                      }
                    : { borderColor: "#1565C0", color: "#1565C0" }),
                }}
              >
                Chats
              </Button>
              <Button
                variant={viewMode === "specialists" ? "contained" : "outlined"}
                size="small"
                onClick={() => setViewMode("specialists")}
                sx={{
                  borderRadius: "999px",
                  textTransform: "none",
                  ...(viewMode === "specialists"
                    ? {
                        backgroundColor: "#1565C0",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#0f4a86" },
                      }
                    : { borderColor: "#1565C0", color: "#1565C0" }),
                }}
              >
                Especialistas
              </Button>
              <Button
                variant={viewMode === "bot" ? "contained" : "outlined"}
                size="small"
                onClick={() => {
                  // open bot immediately in the main pane
                  const botRoomId = "bot-chat";
                  setRooms((prev) => {
                    if (prev.find((r) => String(r.id) === String(botRoomId)))
                      return prev;
                    return [
                      {
                        id: botRoomId,
                        name: "ChatBot",
                        avatar: "",
                        lastMessage: "",
                        messages: [],
                      },
                      ...prev,
                    ];
                  });
                  setActiveId(String("bot-chat"));
                  setViewMode("chats");
                }}
                sx={{
                  borderRadius: "999px",
                  textTransform: "none",
                  ...(viewMode === "bot"
                    ? {
                        backgroundColor: "#1565C0",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#0f4a86" },
                      }
                    : { borderColor: "#1565C0", color: "#1565C0" }),
                }}
              >
                ChatBot
              </Button>
            </Stack>
          </Box>
          <Divider />
          {viewMode === "chats" && (
            <List>
              {(() => {
                // sort rooms by most recent activity (desc) using computed last-ts
                const sorted = (rooms || [])
                  .slice()
                  .filter((c) => {
                    const hasMsgs =
                      Array.isArray(c.messages) && c.messages.length > 0;
                    return hasMsgs || Boolean(c.lastMessage);
                  })
                  .map((r) => ({ ...r, __last_ts: computeLastTsForRoom(r) }))
                  .sort((a, b) => (b.__last_ts || 0) - (a.__last_ts || 0));

                const myId = getCurrentUserId();

                const unreadCountFor = (room) => {
                  try {
                    const msgs = room.messages || [];
                    let count = 0;
                    for (const m of msgs) {
                      // only count messages not sent by me
                      const senderId =
                        m.sender_id || (m.sender && m.sender.id) || null;
                      if (String(senderId) === String(myId) || m.fromMe)
                        continue;
                      // find receipt for me (the recipient) using flexible keys
                      const receipts = m.receipts || [];
                      const myReceipt = receipts.find(
                        (r) => String(getReceiptUserId(r)) === String(myId)
                      );
                      if (myReceipt) {
                        if (!myReceipt.read) count += 1;
                      } else {
                        // if no receipts info, treat message as unread
                        count += 1;
                      }
                    }
                    return count;
                  } catch (e) {
                    return 0;
                  }
                };

                return sorted.map((c) => {
                  // ensure avatar fallback: prefer c.avatar, else derive from participants
                  let avatarSrc = c.avatar || "";
                  try {
                    if (!avatarSrc) {
                      // prefer explicit room-level avatar
                      avatarSrc =
                        c.avatar ||
                        c.other_participant?.avatar ||
                        c.other_participant?.profile_picture_url ||
                        c.other_participant?.profile_picture ||
                        "";
                    }
                    if (
                      !avatarSrc &&
                      Array.isArray(c.participants) &&
                      c.participants.length
                    ) {
                      const other =
                        c.participants.find(
                          (p) => String(p.id) !== String(myId)
                        ) || c.participants[0];
                      avatarSrc =
                        (other &&
                          (other.profile_picture_url ||
                            other.profile_picture ||
                            other.avatar ||
                            other.avatar_url ||
                            other.photo ||
                            other.image ||
                            (other.user &&
                              (other.user.profile_picture ||
                                other.user.avatar)) ||
                            "")) ||
                        "";
                    }
                    // resolve relative urls
                    avatarSrc = resolveAvatar(avatarSrc);
                  } catch (e) {
                    avatarSrc = resolveAvatar(avatarSrc || "");
                  }

                  const unread = unreadCountFor(c);

                  return (
                    <ListItemButton
                      key={c.id}
                      onClick={() => selectChat(String(c.id))}
                      selected={String(activeId) === String(c.id)}
                    >
                      <ListItemAvatar>
                        {(() => {
                          try {
                            const meId = getCurrentUserId();
                            const parts = c.participants || [];
                            const other =
                              parts.find(
                                (p) => String(p.id) !== String(meId)
                              ) ||
                              parts[0] ||
                              null;
                            const otherOnline = other
                              ? isParticipantOnline(other)
                              : false;
                            const avatarNode = (
                              <Avatar src={avatarSrc} alt={c.name}>
                                {!avatarSrc && c.name
                                  ? String(c.name).charAt(0)
                                  : null}
                              </Avatar>
                            );
                            return (
                              <Box
                                sx={{
                                  position: "relative",
                                  display: "inline-block",
                                }}
                              >
                                {unread > 0 ? (
                                  <Badge
                                    badgeContent={unread}
                                    color="success"
                                    overlap="circular"
                                    sx={{
                                      "& .MuiBadge-badge": {
                                        backgroundColor: "#25D366",
                                        color: "#fff",
                                        fontSize: 12,
                                        minWidth: 20,
                                        height: 20,
                                      },
                                    }}
                                  >
                                    {avatarNode}
                                  </Badge>
                                ) : (
                                  avatarNode
                                )}
                                {otherOnline && (
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      bottom: 2,
                                      right: 2,
                                      width: 10,
                                      height: 10,
                                      bgcolor: "#25D366",
                                      borderRadius: "50%",
                                      border: "2px solid white",
                                    }}
                                  />
                                )}
                              </Box>
                            );
                          } catch (e) {
                            return (
                              <Avatar src={avatarSrc} alt={c.name}>
                                {!avatarSrc && c.name
                                  ? String(c.name).charAt(0)
                                  : null}
                              </Avatar>
                            );
                          }
                        })()}
                      </ListItemAvatar>
                      <ListItemText
                        primary={c.name}
                        secondary={
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {c.lastMessage}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  );
                });
              })()}
            </List>
          )}

          {viewMode === "specialists" && (
            <SpecialistsList
              onSelectSpecialist={openOneToOne}
              searchQuery={specialistSearch}
            />
          )}

          {viewMode === "bot" && (
            <Box sx={{ p: 1 }}>
              {/* Render a small launcher that when clicked opens the ChatBot conversation in the main pane */}
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  // create/open a pseudo-room id for bot and open it in the main pane
                  const botRoomId = "bot-chat";
                  setRooms((prev) => {
                    if (prev.find((r) => String(r.id) === String(botRoomId)))
                      return prev;
                    return [
                      {
                        id: botRoomId,
                        name: "ChatBot",
                        avatar: "",
                        lastMessage: "",
                        messages: [],
                      },
                      ...prev,
                    ];
                  });
                  setActiveId(String(botRoomId));
                  setViewMode("chats");
                }}
              >
                Abrir ChatBot
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Panel de conversación */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header en mobile con botón atrás */}
        {!isMd && activeId && (
          <AppBar position="static" color="transparent" elevation={1}>
            <Toolbar>
              <IconButton edge="start" onClick={goBackToList} aria-label="back">
                <ArrowBackIcon />
              </IconButton>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="subtitle1">
                  {
                    // show other participant name for private rooms when available
                    (function () {
                      try {
                        const meId = getCurrentUserId();
                        const parts = activeConv?.participants || [];
                        if (parts && parts.length === 2 && meId) {
                          const other = parts.find(
                            (p) => Number(p.id) !== Number(meId)
                          );
                          return other
                            ? other.full_name ||
                                other.username ||
                                activeConv?.name
                            : activeConv?.name;
                        }
                      } catch (e) {}
                      return activeConv?.name;
                    })()
                  }
                </Typography>
                {(() => {
                  try {
                    const meId = getCurrentUserId();
                    const parts = activeConv?.participants || [];
                    const other =
                      parts && parts.length === 2 && meId
                        ? parts.find((p) => Number(p.id) !== Number(meId))
                        : null;
                    const otherOnline = other
                      ? isParticipantOnline(other)
                      : false;
                    if (otherOnline)
                      return (
                        <Typography
                          variant="caption"
                          sx={{ color: "success.main", fontWeight: 600 }}
                        >
                          En línea
                        </Typography>
                      );
                  } catch (e) {}
                  return (
                    <Typography variant="caption" color="text.secondary">
                      WS: {wsStatus}
                      {sendError ? ` • err: ${sendError}` : ""}
                    </Typography>
                  );
                })()}
              </Box>
            </Toolbar>
          </AppBar>
        )}

        {/* Mostrar placeholder sólo en escritorio cuando no hay chat seleccionado */}
        {!activeId && isMd ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Selecciona un chat para comenzar a conversar
            </Typography>
          </Box>
        ) : activeId ? (
          <Box
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            {/* Desktop header: show selected contact name + avatar like WhatsApp */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1.5,
                p: 2,
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                backgroundColor: "background.paper",
              }}
            >
              <Avatar
                src={resolveAvatar(
                  activeConv?.avatar ||
                    selectedContact?.profile_picture_url ||
                    selectedContact?.profile_picture ||
                    ""
                )}
                alt={
                  activeConv?.name ||
                  selectedContact?.full_name ||
                  selectedContact?.username ||
                  ""
                }
              >
                {!activeConv?.avatar &&
                (selectedContact?.profile_picture_url ||
                  selectedContact?.profile_picture) == null
                  ? activeConv?.name
                    ? String(activeConv.name).charAt(0)
                    : selectedContact?.full_name
                    ? String(selectedContact.full_name).charAt(0)
                    : ""
                  : null}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  {activeConv?.name ||
                    selectedContact?.full_name ||
                    selectedContact?.username ||
                    getDisplayNameFromParticipants(
                      activeConv?.participants || [],
                      getCurrentUserId(),
                      "Chat"
                    )}
                </Typography>
                {/* Header: show connection status only (omit lastMessage preview here) */}
                {(() => {
                  try {
                    const meId = getCurrentUserId();
                    const parts = activeConv?.participants || [];
                    const other =
                      parts && parts.length === 2 && meId
                        ? parts.find((p) => Number(p.id) !== Number(meId))
                        : null;
                    const otherOnline = other
                      ? isParticipantOnline(other)
                      : false;
                    if (otherOnline)
                      return (
                        <Typography
                          variant="caption"
                          sx={{ color: "success.main", fontWeight: 600 }}
                        >
                          En línea
                        </Typography>
                      );
                  } catch (e) {}
                  return (
                    <Typography variant="caption" color="text.secondary">
                      WS: {wsStatus}
                      {sendError ? ` • err: ${sendError}` : ""}
                    </Typography>
                  );
                })()}
              </Box>
            </Box>
            <Box
              id="chat-messages-container"
              sx={{
                flex: 1,
                overflowY: "auto",
                p: 2,
                // veterinary-themed background: subtle paw-print pattern + soft tint
                backgroundColor: "#f6fff8",
                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='%2339FF14' fill-opacity='0.06'><circle cx='20' cy='30' r='8'/><circle cx='34' cy='18' r='6'/><circle cx='12' cy='18' r='6'/><circle cx='58' cy='30' r='8'/><circle cx='72' cy='18' r='6'/><circle cx='50' cy='18' r='6'/></g><g fill='%23000000' fill-opacity='0.02'><rect x='0' y='0' width='120' height='120'/></g></svg>")`,
                backgroundRepeat: "repeat",
                backgroundSize: "160px 160px",
              }}
            >
              {String(activeId) === "bot-chat" ? (
                // Render the ChatBot component inline as the active conversation
                <Box sx={{ p: 2 }}>
                  <ChatBot />
                </Box>
              ) : (
                (activeConv?.messages || [])
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(a.timestamp || a.created_at || 0) -
                      new Date(b.timestamp || b.created_at || 0)
                  )
                  .map((m, idx, arr) => {
                    const ts =
                      m.timestamp || m.created_at || new Date().toISOString();
                    const prev = arr && arr[idx - 1];
                    const prevTs = prev
                      ? prev.timestamp || prev.created_at || ""
                      : null;
                    const showDay =
                      !prevTs ||
                      new Date(prevTs).toDateString() !==
                        new Date(ts).toDateString();
                    const dayKey = new Date(ts).toDateString();
                    const fmtDay = (iso) => {
                      try {
                        const d = new Date(iso);
                        const today = new Date();
                        const y = new Date();
                        y.setDate(y.getDate() - 1);
                        const isToday =
                          d.toDateString() === today.toDateString();
                        const isYesterday =
                          d.toDateString() === y.toDateString();
                        if (isToday) return "Hoy";
                        if (isYesterday) return "Ayer";
                        return d.toLocaleDateString();
                      } catch (e) {
                        return String(iso).slice(0, 10);
                      }
                    };

                    const currentUserId = getCurrentUserId();
                    const senderId =
                      m &&
                      (m.sender_id ||
                        (m.sender && m.sender.id) ||
                        (m.sender && m.sender_id));
                    const fromMe = Boolean(
                      m.fromMe === true ||
                        (senderId &&
                          currentUserId &&
                          String(senderId) === String(currentUserId))
                    );
                    const username =
                      m.username ||
                      (m.sender && (m.sender.full_name || m.sender.username)) ||
                      "";
                    const replied =
                      m.reply_to ||
                      m.replyTo ||
                      m.replyToMessage ||
                      m.reply_to_message ||
                      (m.reply_to && typeof m.reply_to === "object"
                        ? m.reply_to
                        : null);
                    const rtext = replied
                      ? typeof replied === "string"
                        ? replied
                        : replied.text ||
                          replied.content ||
                          replied.preview ||
                          ""
                      : null;
                    const rname =
                      replied && typeof replied === "object"
                        ? replied.senderName ||
                          replied.sender ||
                          replied.username ||
                          ""
                        : "";

                    return [
                      showDay ? (
                        <Box
                          key={`day-${dayKey}`}
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            my: 1,
                          }}
                        >
                          <Paper
                            sx={{ px: 2, py: 0.3, bgcolor: "background.paper" }}
                            elevation={0}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {fmtDay(ts)}
                            </Typography>
                          </Paper>
                        </Box>
                      ) : null,
                      <Box
                        key={m.id || m.client_msg_id}
                        data-msg-id={m.id || m.client_msg_id}
                        data-fromme={fromMe}
                        id={`msg-${m.id || m.client_msg_id}`}
                        sx={{
                          display: "flex",
                          justifyContent: fromMe ? "flex-end" : "flex-start",
                          mb: 1,
                          pr: fromMe ? 2 : 0,
                          pl: fromMe ? 0 : 2,
                          position: "relative",
                          "&:hover .reply-btn": { opacity: 1 },
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            top: -4,
                            left: fromMe ? "auto" : -36,
                            right: fromMe ? -36 : "auto",
                          }}
                        >
                          <IconButton
                            size="small"
                            className="reply-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReplyTo({
                                id: m.id || m.client_msg_id,
                                text: m.text || m.content || "",
                                senderName: username || "",
                              });
                            }}
                            sx={{ opacity: 0, transition: "opacity 0.12s" }}
                            aria-label="responder"
                          >
                            <ReplyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Paper
                          sx={{
                            padding: "6px 12px",
                            maxWidth: { xs: "76%", md: "54%" },
                            width: "auto",
                            display: "inline-block",
                            alignSelf: fromMe ? "flex-end" : "flex-start",
                            position: "relative",
                            bgcolor: fromMe ? "#CDE9FF" : "#FFFFFF",
                            color: "#000",
                            borderRadius: fromMe
                              ? "18px 18px 4px 18px"
                              : "18px 18px 18px 4px",
                            boxShadow: fromMe
                              ? "none"
                              : "0 1px 0 rgba(0,0,0,0.06)",
                            border: fromMe
                              ? "1px solid rgba(0,0,0,0.04)"
                              : "1px solid rgba(0,0,0,0.06)",
                            overflow: "visible",
                          }}
                        >
                          {!fromMe &&
                            username &&
                            Boolean(
                              activeConv &&
                                (activeConv.is_private ||
                                  (Array.isArray(activeConv.participants) &&
                                    activeConv.participants.length === 2))
                            ) === false && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  fontWeight: 600,
                                  mb: 0.3,
                                  color: "text.primary",
                                }}
                              >
                                {username}
                              </Typography>
                            )}
                          <Box sx={{ position: "relative" }}>
                            {replied && (
                              <Box
                                sx={{
                                  mb: 0.5,
                                  backgroundColor: fromMe
                                    ? "rgba(12,66,120,0.03)"
                                    : "rgba(0,0,0,0.03)",
                                  borderLeft: "3px solid rgba(0,0,0,0.08)",
                                  p: "6px 8px",
                                  maxWidth: "100%",
                                  overflow: "hidden",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 700,
                                    display: "block",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {rname}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    fontSize: 12,
                                  }}
                                >
                                  {rtext}
                                </Typography>
                              </Box>
                            )}
                            <Typography
                              variant="body2"
                              sx={{
                                display: "inline-block",
                                whiteSpace: "pre-wrap",
                                fontSize: 14,
                                lineHeight: 1.2,
                                wordBreak: "break-word",
                                maxWidth: "100%",
                                paddingRight: 30,
                              }}
                            >
                              {m.text || m.content || ""}
                            </Typography>
                          </Box>
                          {fromMe ? (
                            <Box
                              sx={{
                                position: "absolute",
                                right: -6,
                                bottom: 6,
                                width: 12,
                                height: 12,
                                transform: "rotate(45deg)",
                                bgcolor: "#CDE9FF",
                                borderRight: "1px solid rgba(0,0,0,0.04)",
                                borderBottom: "1px solid rgba(0,0,0,0.04)",
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                position: "absolute",
                                left: -6,
                                bottom: 6,
                                width: 12,
                                height: 12,
                                transform: "rotate(45deg)",
                                bgcolor: "#FFFFFF",
                                borderLeft: "1px solid rgba(0,0,0,0.06)",
                                borderBottom: "1px solid rgba(0,0,0,0.06)",
                              }}
                            />
                          )}
                          <Box
                            sx={{
                              position: "absolute",
                              right: 8,
                              bottom: 6,
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ opacity: 0.7, fontSize: 11 }}
                            >
                              {formatTimestamp(m.timestamp)}
                            </Typography>
                            {fromMe &&
                              (() => {
                                const myId = getCurrentUserId();
                                const receipts = m.receipts || [];
                                const other = receipts.find(
                                  (r) =>
                                    String(getReceiptUserId(r)) !== String(myId)
                                );
                                const subtle = { fontSize: 16, opacity: 1 };
                                // Prefer aggregate message flags if present (persisted on server)
                                const msgRead =
                                  Boolean(m.read) || (other && other.read);
                                const msgDelivered =
                                  Boolean(m.delivered) ||
                                  (other && other.delivered);
                                if (msgRead) {
                                  return (
                                    <DoneAllIcon
                                      fontSize="small"
                                      sx={{ color: "#1976d2", ...subtle }}
                                    />
                                  );
                                }
                                if (msgDelivered) {
                                  return (
                                    <DoneAllIcon
                                      fontSize="small"
                                      sx={{
                                        color: "rgba(0,0,0,0.45)",
                                        ...subtle,
                                      }}
                                    />
                                  );
                                }
                                return (
                                  <DoneIcon
                                    fontSize="small"
                                    sx={{
                                      color: "rgba(0,0,0,0.45)",
                                      ...subtle,
                                    }}
                                  />
                                );
                              })()}
                          </Box>
                        </Paper>
                      </Box>,
                    ];
                  })
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input: hide for ChatBot pseudo-room (embedded widget handles input) */}
            {String(activeId) !== "bot-chat" && (
              <Box
                sx={{
                  p: 1,
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.6), rgba(246,255,248,0.6))",
                }}
              >
                {/* Reply preview when replying to a message */}
                {replyTo && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: { xs: 8, md: 460 },
                      right: 8,
                      top: -56,
                      zIndex: 10,
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        maxWidth: 560,
                      }}
                    >
                      <Box sx={{ flex: 1, overflow: "hidden" }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {replyTo.senderName || "Respuesta"}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {replyTo.text}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => setReplyTo(null)}
                        aria-label="cancel-reply"
                      >
                        ✕
                      </IconButton>
                    </Paper>
                  </Box>
                )}
                <IconButton>
                  <AttachFileIcon />
                </IconButton>
                <Paper
                  component="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  sx={{ flex: 1, display: "flex", alignItems: "center", px: 1 }}
                >
                  <InputBase
                    multiline
                    maxRows={4}
                    placeholder="Escribe un mensaje"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    sx={{ width: "100%" }}
                  />
                </Paper>
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  aria-label="send"
                >
                  <SendIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

// (NOTE) openOneToOne is defined above inside component; remove duplicate older definition
