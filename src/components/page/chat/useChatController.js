import { useState } from 'react';
import { normalizeStoredToken } from './chatUtils';
import { chatAPI } from '../../../services/endpoints';
import { playOutgoingSound, playSendSound } from '../../../services/sound';

// Hook that encapsulates Chat local state and send/attach handlers so the
// main `Chat.jsx` stays thin and mostly imports components.
export default function useChatController({ activeId, setRooms, getCurrentUserId }) {
  const [text, setText] = useState('');
  const [sendingText, setSendingText] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const handleSend = async () => {
    if (sendingText) return;
    if (!text.trim() || !activeId) return;
    const tempId = 'tmp_' + Date.now();
    const clientMsgId = `cid_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const msg = { id: tempId, text, client_msg_id: clientMsgId, fromMe: true, timestamp: new Date().toISOString(), uid: `tmp_${tempId}-${new Date().toISOString()}`, sender_id: getCurrentUserId() };
  // Intentional minimal logging: note when a text send is initiated
  try { console.info('[SEND] button pressed', { room: String(activeId), tempId, shortText: String(text).slice(0,120) }); } catch (e) {}
    // Insert optimistic message into room (single update). Use controlled updater below.
    try {
      setRooms((prev) => {
        try {
          const copy = prev.slice();
          const idx = copy.findIndex((r) => String(r.id) === String(activeId));
          if (idx === -1) return prev;
          const room = { ...(copy[idx] || {}) };
          const msgs = Array.isArray(room.messages) ? room.messages.slice() : [];
          msgs.push(msg);
          room.messages = msgs;
          copy[idx] = room;
          return copy;
        } catch (e) { return prev; }
      });
    } catch (e) {}
  try { playOutgoingSound && typeof playOutgoingSound === 'function' ? playOutgoingSound(activeId) : playSendSound && playSendSound(); } catch (e) {}
    setText('');
    setSendingText(true);

  (async () => {
      try {
        const token = normalizeStoredToken(localStorage.getItem('token'));
        const res = await chatAPI.sendMessage(activeId, text, { client_msg_id: clientMsgId })({ token });
  if (res && (res.id || res.pk)) {
          const serverMsg = { id: res.id || res.pk, text: res.content || res.message || res.text || text, timestamp: res.timestamp || res.created_at || new Date().toISOString(), sender_id: res.sender_id || (res.sender && (res.sender.id || res.sender.user_id)) || getCurrentUserId(), receipts: res.receipts || [] };
          setRooms((prev) => {
            try {
              const copy = prev.slice();
              const idx = copy.findIndex((r) => String(r.id) === String(activeId));
              if (idx === -1) return prev;
              const room = { ...(copy[idx] || {}) };
              const msgs = Array.isArray(room.messages) ? room.messages.slice() : [];
              const prevLen = msgs.length;
              const already = msgs.some((m) => String(m.id) === String(serverMsg.id));
              const tempIdx = msgs.findIndex((m) => String(m.id) === String(tempId));
              if (already) {
                if (tempIdx !== -1) msgs.splice(tempIdx, 1);
              } else if (tempIdx !== -1) msgs[tempIdx] = serverMsg; else msgs.push(serverMsg);
              const newLen = msgs.length;
              try { console.info('[SEND] server ack reconciled', { room: String(activeId), tempId, serverId: serverMsg.id, prevMsgs: prevLen, newMsgs: newLen }); } catch (e) {}
              room.messages = msgs;
              room.lastMessage = serverMsg.text || room.lastMessage;
              room.last_activity = serverMsg.timestamp || room.last_activity;
              copy[idx] = room;
              const sorted = copy.slice().sort((a,b) => { const ta = new Date(a.last_activity || (a.messages && a.messages.length ? a.messages[a.messages.length - 1].timestamp : 0)).getTime() || 0; const tb = new Date(b.last_activity || (b.messages && b.messages.length ? b.messages[b.messages.length - 1].timestamp : 0)).getTime() || 0; return tb - ta; });
              return sorted;
            } catch (e) { return prev; }
          });
        }
      } catch (e) {
        setRooms((prev) => prev.map((r) => {
          if (String(r.id) !== String(activeId)) return r;
          const msgs = (r.messages || []).map((m) => String(m.id) === String(tempId) ? { ...m, sendError: true } : m);
          return { ...r, messages: msgs };
        }));
      } finally {
        try { setTimeout(() => setSendingText(false), 300); } catch (err) { setSendingText(false); }
      }
    })();
  };

  const handleAttach = (file) => {
    if (!file || !activeId) return;
    let theFile = file;
    let spectrum = null;
    if (file && typeof file === 'object' && file.file) { theFile = file.file; spectrum = file.spectrum || null; }
    const previewUrl = file && file.previewUrl ? file.previewUrl : URL.createObjectURL(theFile);
    setPendingAttachment({ file: theFile, previewUrl, name: theFile.name, size: theFile.size, spectrum });
  };

  const cancelPendingAttachment = () => {
    if (pendingAttachment && pendingAttachment.previewUrl) {
      try { URL.revokeObjectURL(pendingAttachment.previewUrl); } catch (e) {}
    }
    setPendingAttachment(null);
  };

  const confirmSendAttachment = async (externalPending) => {
    const targetPending = externalPending || pendingAttachment;
    if (!targetPending || !activeId) return;
    // targetPending may be either:
    // - an object with { file, previewUrl, spectrum, ... }
    // - or a raw File object passed directly (external callers)
    let file = null;
    if (targetPending && targetPending.file) file = targetPending.file;
    else if (targetPending && (typeof File !== 'undefined') && (targetPending instanceof File)) file = targetPending;
    else if (targetPending && typeof targetPending === 'object' && targetPending.name && (typeof targetPending.size !== 'undefined')) file = targetPending;

    if (!file) {
      try { console.error('[UPLOAD] no file found in pending attachment', { targetPending }); } catch (e) {}
      // ensure UI state is sane
      try { setUploadingAttachment(false); } catch (e) {}
      return;
    }

    setUploadingAttachment(true);
    const tempId = 'tmp_media_' + Date.now();
    const clientMsgId = `cid_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const previewUrl = (targetPending && targetPending.previewUrl) ? targetPending.previewUrl : (file && typeof URL !== 'undefined' ? URL.createObjectURL(file) : null);
    // Generate a small data-URL thumbnail for images so other clients can
    // render an immediate preview (blob: URLs are local-only and won't work
    // across different browsers/sessions). We only generate this for images
    // to avoid heavy processing for videos/audios.
    const generateImagePreviewDataUrl = (f, maxDim = 320) => {
      return new Promise((resolve) => {
        try {
          if (!f || !f.type || !f.type.startsWith('image/')) return resolve(null);
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const img = new Image();
              img.onload = () => {
                try {
                  const w = img.width || 1;
                  const h = img.height || 1;
                  const ratio = Math.min(1, maxDim / Math.max(w, h));
                  const cw = Math.max(1, Math.round(w * ratio));
                  const ch = Math.max(1, Math.round(h * ratio));
                  const canvas = document.createElement('canvas');
                  canvas.width = cw;
                  canvas.height = ch;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0, cw, ch);
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
                  resolve(dataUrl);
                } catch (e) { resolve(null); }
              };
              img.onerror = () => resolve(null);
              img.src = String(reader.result || '');
            } catch (e) { resolve(null); }
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(f);
        } catch (e) { resolve(null); }
      });
    };
    const inferredType = file && file.type ? file.type.split('/')[0] : (targetPending && targetPending.media_type) ? targetPending.media_type : null;
    let previewDataUrl = null;
    try { if (file && file.type && String(file.type).startsWith('image/')) previewDataUrl = await generateImagePreviewDataUrl(file, 320); } catch (e) {}

    const mediaMsg = {
      id: tempId,
      text: '',
      client_msg_id: clientMsgId,
      media_spectrum: targetPending && targetPending.spectrum ? targetPending.spectrum : null,
      // include multiple variants so renderers that look for different keys will work
      media_url: previewUrl,
      mediaUrl: previewUrl,
      previewUrl: previewUrl,
      // small, cross-client-friendly data URL preview (may be null)
      preview_data_url: previewDataUrl,
      media_type: inferredType,
      mediaType: inferredType,
      uid: `tmp_${tempId}-${new Date().toISOString()}`,
      media_uploading: true,
      media_upload_percent: 0,
      fromMe: true,
      timestamp: new Date().toISOString(),
      sender_id: getCurrentUserId()
    };

    try { console.info('[SEND] optimistic media message created', { room: String(activeId), tempId, mediaMsg }); } catch (e) {}

    setRooms((prev) => prev.map((r) => String(r.id) === String(activeId) ? { ...r, messages: [...(r.messages || []), mediaMsg], lastMessage: '(enviando archivo...)' } : r));
    // Only clear parent's pendingAttachment if we used the parent's pendingAttachment
    if (!externalPending) setPendingAttachment(null);

    // Emit a temporary WS message so other clients see an "uploading" placeholder.
    try {
      if (typeof window !== 'undefined' && window._agrovet_chat_service && typeof window._agrovet_chat_service.send === 'function') {
        try {
          const tempPayload = {
            type: 'chat.message',
            message: {
              id: tempId,
              room: activeId,
              client_msg_id: clientMsgId,
              // include a cross-client-friendly preview if available (data URL)
              preview_data_url: previewDataUrl || null,
              // for compatibility, include media_url/previewUrl fields but prefer data URL
              media_url: previewDataUrl ? previewDataUrl : previewUrl,
              previewUrl: previewDataUrl ? previewDataUrl : previewUrl,
              media_uploading: true,
              status: 'uploading',
              sender_id: getCurrentUserId(),
              timestamp: mediaMsg.timestamp,
              media_type: inferredType,
            }
          };
          window._agrovet_chat_service.send(tempPayload);
          try { console.info('[WS] emitted temporary uploading message', { tempId, clientMsgId, room: String(activeId) }); } catch (e) {}
        } catch (e) {}
      }
    } catch (e) {}

    try {
      try { console.info('[UPLOAD] starting upload flow', { room: String(activeId), tempId, clientMsgId, fileName: file && file.name, fileType: file && file.type, fileSize: file && file.size }); } catch (e) {}
      const { uploadMediaFile } = await import('./mediaUploader');
      const mediaRes = await uploadMediaFile(file, (pct) => {
        setRooms((prev) => prev.map((r) => {
          if (String(r.id) !== String(activeId)) return r;
          const msgs = (r.messages || []).map((m) => String(m.id) === String(tempId) ? { ...m, media_upload_percent: pct } : m);
          return { ...r, messages: msgs };
        }));
      }, { description: targetPending && targetPending.spectrum ? targetPending.spectrum : undefined });
  try { console.info('[UPLOAD] upload finished', { mediaRes }); } catch (e) {}
      const token = normalizeStoredToken(localStorage.getItem('token'));
  // Prefer sending the final public URL to the backend when available so
  // the created ChatMessage can include media_url immediately in broadcasts.
  const finalUrl = mediaRes && (mediaRes.url || mediaRes.media_url) ? (mediaRes.url || mediaRes.media_url) : null;
  const res = await chatAPI.sendMessage(activeId, '', { media_url: finalUrl, media_id: mediaRes.id, client_msg_id: clientMsgId })({ token });
  try { console.info('[SEND] sendMessage response', { room: String(activeId), client_msg_id: clientMsgId, res }); } catch (e) {}

      // Ensure the final message (server-created or optimistic) carries the uploaded media URL
      // If the server's response doesn't include media_url, proactively merge mediaRes.url
      try {
        const finalUrl = mediaRes && (mediaRes.url || mediaRes.media_url) ? (mediaRes.url || mediaRes.media_url) : null;
        const finalMediaId = mediaRes && (mediaRes.id || mediaRes.pk) ? (mediaRes.id || mediaRes.pk) : null;
        if (finalUrl) {
          try {
            setRooms((prev) => {
              try {
                const copy = prev.slice();
                for (let ri = 0; ri < copy.length; ri++) {
                  const room = { ...(copy[ri] || {}) };
                  if (String(room.id) !== String(activeId)) continue;
                  const msgs = Array.isArray(room.messages) ? room.messages.slice() : [];
                  let changed = false;
                  for (let mi = 0; mi < msgs.length; mi++) {
                    const m = msgs[mi] || {};
                    // match by tempId, by client_msg_id, or by server id if present
                    const isTemp = String(m.id) === String(tempId);
                    const byClient = m.client_msg_id && String(m.client_msg_id) === String(clientMsgId);
                    const byServer = res && (res.id || res.pk) && String(m.id) === String(res.id || res.pk);
                    if (isTemp || byClient || byServer) {
                      const existing = msgs[mi] || {};
                      const merged = { ...(existing || {}) };
                      // prefer server fields but ensure media url present
                      merged.media_url = merged.media_url || merged.mediaUrl || finalUrl;
                      merged.mediaUrl = merged.mediaUrl || merged.media_url || finalUrl;
                      merged.previewUrl = merged.previewUrl || merged.media_url || finalUrl;
                      merged.media_id = merged.media_id || merged.mediaId || finalMediaId || merged.media || null;
                      merged.media_uploading = false;
                      merged.media_upload_percent = null;
                      msgs[mi] = merged;
                      changed = true;
                    }
                  }
                  if (changed) {
                    room.messages = msgs;
                    copy[ri] = room;
                    return copy;
                  }
                }
                return prev;
              } catch (e) { return prev; }
            });
            try { console.info('[SEND] merged uploaded media URL into local rooms state', { room: String(activeId), tempId, clientMsgId, url: finalUrl }); } catch (e) {}
          } catch (e) {}
        }
      } catch (e) {}

        // Emit a WS message_update so other connected clients (and this client if needed)
        // can reconcile the temporary message with the final public URL. Include both
        // client_msg_id and the tempId so receivers can match either key.
        try {
          if (finalUrl && typeof window !== 'undefined' && window._agrovet_chat_service && typeof window._agrovet_chat_service.send === 'function') {
            const updatePayload = {
              type: 'message_update',
              message: {
                id: (res && (res.id || res.pk)) || tempId,
                room: activeId,
                client_msg_id: clientMsgId,
                media_url: finalUrl,
                mediaUrl: finalUrl,
                media_uploading: false,
                media_upload_percent: null,
                status: 'uploaded'
              }
            };
            try { window._agrovet_chat_service.send(updatePayload); } catch (e) {}
            try { console.info('[WS] emitted message_update for uploaded media', { tempId, clientMsgId, room: String(activeId), url: finalUrl }); } catch (e) {}
          }
        } catch (e) {}

      // If the HTTP send returns the created message, reconcile immediately
      // with our optimistic temp message so the UI updates without a reload.
      if (res && (res.id || res.pk)) {
        const serverMsg = {
          id: res.id || res.pk,
          text: res.content || res.message || res.text || '',
          timestamp: res.timestamp || res.created_at || new Date().toISOString(),
          sender_id: res.sender_id || (res.sender && (res.sender.id || res.sender.user_id)) || getCurrentUserId(),
          receipts: res.receipts || [],
          // prefer explicit mediaRes (upload result) for URL and id, but fall back to any server-provided fields
          media_url: (mediaRes && (mediaRes.url || mediaRes.media_url)) || res.media_url || (res.media && (res.media.url || res.media.media_url)) || null,
          mediaUrl: (mediaRes && (mediaRes.url || mediaRes.media_url)) || res.media_url || (res.media && (res.media.url || res.media.media_url)) || null,
          media_id: (mediaRes && mediaRes.id) || (res.media && res.media.id) || null,
          mediaId: (mediaRes && mediaRes.id) || (res.media && res.media.id) || null,
          media_type: (mediaRes && mediaRes.type) || res.media_type || (res.media && res.media.type) || inferredType || null,
          mediaType: (mediaRes && mediaRes.type) || res.media_type || (res.media && res.media.type) || inferredType || null,
        };
        try { console.info('[SEND] reconciling serverMsg with mediaRes', { serverMsg, mediaRes, res }); } catch (e) {}
        setRooms((prev) => {
          try {
            const copy = prev.slice();
            const idx = copy.findIndex((r) => String(r.id) === String(activeId));
            if (idx === -1) return prev;
            const room = { ...(copy[idx] || {}) };
            const msgs = Array.isArray(room.messages) ? room.messages.slice() : [];
            const tempIdx = msgs.findIndex((m) => String(m.id) === String(tempId));
            const already = msgs.some((m) => String(m.id) === String(serverMsg.id));
            if (already) {
              if (tempIdx !== -1) msgs.splice(tempIdx, 1);
            } else if (tempIdx !== -1) {
              // merge server fields onto optimistic message, clear upload flags
              // but preserve any optimistic previewUrl/blob URL if server didn't return a media URL
              try {
                const existing = msgs[tempIdx] || {};
                const merged = { ...existing, ...serverMsg };
                // preserve preview/blob if server didn't provide a usable URL
                if (!merged.media_url && !merged.mediaUrl) {
                  const fallback = existing.previewUrl || existing.media_url || existing.mediaUrl || null;
                  if (fallback) {
                    merged.media_url = fallback;
                    merged.mediaUrl = fallback;
                    merged.previewUrl = fallback;
                    try { console.info('[SEND] preserved optimistic previewUrl during reconcile', { tempId, fallback }); } catch (e) {}
                  }
                }
                merged.media_uploading = false;
                merged.media_upload_percent = null;
                msgs[tempIdx] = merged;
              } catch (errMerge) {
                msgs[tempIdx] = { ...(msgs[tempIdx] || {}), ...serverMsg, media_uploading: false, media_upload_percent: null };
              }
            } else {
              msgs.push({ ...serverMsg, media_uploading: false, media_upload_percent: null });
            }
            room.messages = msgs;
            room.lastMessage = serverMsg.text || room.lastMessage;
            room.last_activity = serverMsg.timestamp || room.last_activity;
            copy[idx] = room;
            const sorted = copy.slice().sort((a,b) => { const ta = new Date(a.last_activity || (a.messages && a.messages.length ? a.messages[a.messages.length - 1].timestamp : 0)).getTime() || 0; const tb = new Date(b.last_activity || (b.messages && b.messages.length ? b.messages[b.messages.length - 1].timestamp : 0)).getTime() || 0; return tb - ta; });
            return sorted;
          } catch (e) { return prev; }
        });
      }
      return res || mediaRes;
    } catch (e) {
      try {
        // provide richer error output for debugging: include status/body/stack when available
        const out = (e && (e.body || e.raw || e.message)) ? { message: e.message, body: e.body, raw: e.raw, status: e.status } : e;
        try { console.error('[UPLOAD] upload/send failed', out); } catch (err) {}
        try { if (e && e.stack) console.error('[UPLOAD] stack', e.stack); } catch (err) {}
      } catch (err) {}
      setRooms((prev) => prev.map((r) => {
        if (String(r.id) !== String(activeId)) return r;
        const msgs = (r.messages || []).map((m) => {
          if (String(m.id).startsWith('tmp_media_')) {
            try { if (m.media_url && typeof m.media_url === 'string' && m.media_url.startsWith('blob:')) { URL.revokeObjectURL(m.media_url); } } catch (err) {}
            return { ...m, sendError: true, media_uploading: false };
          }
          return m;
        });
        return { ...r, messages: msgs };
      }));
    } finally {
      try { setUploadingAttachment(false); } catch (e) {}
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return { text, setText, sendingText, pendingAttachment, setPendingAttachment, handleSend, handleAttach, cancelPendingAttachment, confirmSendAttachment, handleKeyDown, uploadingAttachment };
}
