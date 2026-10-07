/**
 * AIAgentPage — Página principal del Asistente de IA y Triage Clínico Veterinario en Web.
 * Conectado directamente al microservicio `ai-service` (mismo motor y RAG que la app móvil).
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
  Chip,
  Divider,
  Alert,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import RefreshIcon from '@mui/icons-material/Refresh';
import AIOrbWeb from './AIOrbWeb';
import RecommendationCardWeb from './RecommendationCardWeb';
import { sendChatMessage, sendVoiceChat, getIndexedBooks } from '../../../services/endpoints/ai';

export default function AIAgentPage() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [orbState, setOrbState] = useState('idle'); // idle | listening | processing | speaking | error
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [conversationId, setConversationId] = useState(`web_session_${Date.now()}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar libros indexados en RAG al montar
  useEffect(() => {
    getIndexedBooks()
      .then((res) => setBooks(res.books || []))
      .catch(() => setBooks([]));
  }, []);

  const handleSendText = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMessage = inputText.trim();
    setInputText('');

    const userMsgObj = { id: Date.now(), role: 'user', content: userMessage, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsgObj]);
    setLoading(true);
    setOrbState('processing');

    try {
      const res = await sendChatMessage(userMessage, conversationId);
      const assistantMsgObj = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.response || res.message || 'Sin respuesta.',
        cards: res.cards,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsgObj]);
      setOrbState('idle');
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', content: `❌ ${err.message || 'Error al conectar con la IA.'}`, isError: true },
      ]);
      setOrbState('error');
      setTimeout(() => setOrbState('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceRecorded = async (audioBlob) => {
    setOrbState('processing');
    setLoading(true);

    try {
      const res = await sendVoiceChat(audioBlob, conversationId);
      if (res.transcription) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: 'user', content: res.transcription, timestamp: new Date() },
        ]);
      }

      const assistantMsgObj = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.response || 'Sin respuesta.',
        cards: res.cards,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsgObj]);
      setOrbState('speaking');

      // Reproducir audio TTS de respuesta si se incluye
      if (res.audio_base64) {
        try {
          const audio = new Audio(`data:audio/mp3;base64,${res.audio_base64}`);
          audio.onended = () => setOrbState('idle');
          audio.play().catch(() => setOrbState('idle'));
        } catch (e) {
          setOrbState('idle');
        }
      } else {
        setTimeout(() => setOrbState('idle'), 3000);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'assistant', content: `❌ ${err.message || 'Error procesando audio de voz.'}`, isError: true },
      ]);
      setOrbState('error');
      setTimeout(() => setOrbState('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleResetConversation = () => {
    setMessages([]);
    setConversationId(`web_session_${Date.now()}`);
    setOrbState('idle');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a', color: '#f1f5f9' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SmartToyIcon sx={{ color: '#2C8B64', fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={800} color="#f1f5f9" fontSize="1.1rem">
              AgroVet IA — Asistente Clínico Veterinario
            </Typography>
            <Typography variant="caption" color="#64748b">
              Motor LLM + RAG con evidencia médica oficial de manuales veterinarios.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {books.length > 0 && (
            <Chip
              icon={<AutoStoriesIcon style={{ color: '#38bdf8', fontSize: 16 }} />}
              label={`${books.length} libros RAG`}
              size="small"
              sx={{ bgcolor: 'rgba(56,189,248,0.12)', color: '#38bdf8', fontWeight: 700, fontSize: '0.75rem' }}
            />
          )}
          <Tooltip title="Nueva consulta">
            <IconButton size="small" onClick={handleResetConversation} sx={{ color: '#94a3b8' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Interactive Voice Orb */}
      <AIOrbWeb
        orbState={orbState}
        onVoiceRecorded={handleVoiceRecorded}
        onInterrupt={() => setOrbState('idle')}
      />

      {/* Messages area */}
      <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, opacity: 0.6 }}>
            <Typography variant="body2" color="#64748b" align="center">
              Haz una pregunta o graba un audio para iniciar el triage clínico (ej: "Mi ternero tiene fiebre y tos seca").
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: { xs: '90%', sm: '75%' },
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: msg.role === 'user' ? '#1e3a8a' : '#1e293b',
                  color: '#f1f5f9',
                  border: msg.role === 'user' ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Typography variant="body2" whitespace="pre-wrap" fontSize="0.9rem" lineHeight={1.5}>
                  {msg.content}
                </Typography>
              </Paper>

              {/* Render Recommendation Cards if assistant message contains clinical triage */}
              {msg.cards && <RecommendationCardWeb cards={msg.cards} />}
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Text Input Bar */}
      <Box component="form" onSubmit={handleSendText} sx={{ display: 'flex', gap: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Escribe tu consulta médica veterinaria..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
          InputProps={{
            sx: { bgcolor: '#1e293b', color: '#f1f5f9', borderRadius: 2.5, fontSize: '0.9rem' },
          }}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.08)' },
            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2C8B64' },
          }}
        />
        <IconButton
          type="submit"
          disabled={loading || !inputText.trim()}
          sx={{
            bgcolor: '#2C8B64',
            color: '#fff',
            '&:hover': { bgcolor: '#236f50' },
            '&:disabled': { bgcolor: 'rgba(44,139,100,0.3)', color: 'rgba(255,255,255,0.4)' },
            borderRadius: 2.5,
            width: 42,
            height: 42,
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
        </IconButton>
      </Box>
    </Box>
  );
}
