import { useState } from 'react';
import { normalizeStoredToken } from './chatUtils';
import { chatAPI } from '../../../services/endpoints';
import { playSendSound } from '../../../services/sound';

// Hook that encapsulates Chat local state and send/attach handlers so the
// main `Chat.jsx` stays thin and mostly imports components.
export default function useChatController({ activeId, setRooms, getCurrentUserId }) {
  const [text, setText] = useState('');
  const [sendingText, setSendingText] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);

  const handleSend = async () => {
    if (sendingText) return;
    if (!text.trim() || !activeId) return;
    const tempId = 'tmp_' + Date.now();
    const clientMsgId = `cid_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const msg = { id: tempId, text, client_msg_id: clientMsgId, fromMe: true, timestamp: new Date().toISOString(), uid: `tmp_${tempId}-${new Date().toISOString()}`, sender_id: getCurrentUserId() };
    setRooms((prev) => prev.map((r) => String(r.id) === String(activeId) ? { ...r, messages: [...(r.messages || []), msg] } : r));
    try { playSendSound(); } catch (e) {}
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
              const already = msgs.some((m) => String(m.id) === String(serverMsg.id));
              const tempIdx = msgs.findIndex((m) => String(m.id) === String(tempId));
              if (already) {
                if (tempIdx !== -1) msgs.splice(tempIdx, 1);
              } else if (tempIdx !== -1) msgs[tempIdx] = serverMsg; else msgs.push(serverMsg);
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

  const confirmSendAttachment = async () => {
    if (!pendingAttachment || !activeId) return;
    const file = pendingAttachment.file;
    const tempId = 'tmp_media_' + Date.now();
    const clientMsgId = `cid_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const mediaMsg = { id: tempId, text: '', client_msg_id: clientMsgId, media_spectrum: pendingAttachment && pendingAttachment.spectrum ? pendingAttachment.spectrum : null, media_url: pendingAttachment.previewUrl, previewUrl: pendingAttachment.previewUrl, media_type: file && file.type ? file.type.split('/')[0] : null, uid: `tmp_${tempId}-${new Date().toISOString()}`, media_uploading: true, media_upload_percent: 0, fromMe: true, timestamp: new Date().toISOString(), sender_id: getCurrentUserId() };

    setRooms((prev) => prev.map((r) => String(r.id) === String(activeId) ? { ...r, messages: [...(r.messages || []), mediaMsg], lastMessage: '(enviando archivo...)' } : r));
    setPendingAttachment(null);

    try {
      const { uploadMediaFile } = await import('./mediaUploader');
      const mediaRes = await uploadMediaFile(file, (pct) => {
        setRooms((prev) => prev.map((r) => {
          if (String(r.id) !== String(activeId)) return r;
          const msgs = (r.messages || []).map((m) => String(m.id) === String(tempId) ? { ...m, media_upload_percent: pct } : m);
          return { ...r, messages: msgs };
        }));
      }, { description: pendingAttachment && pendingAttachment.spectrum ? pendingAttachment.spectrum : undefined });
      const token = normalizeStoredToken(localStorage.getItem('token'));
      await chatAPI.sendMessage(activeId, '', { media_id: mediaRes.id, client_msg_id: clientMsgId })({ token });
    } catch (e) {
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
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return { text, setText, sendingText, pendingAttachment, setPendingAttachment, handleSend, handleAttach, cancelPendingAttachment, confirmSendAttachment, handleKeyDown };
}
