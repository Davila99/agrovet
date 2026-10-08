/**
 * AIOrbWeb — Órbita interactiva de voz y control para la IA AgroVet en Web.
 * Soporta grabación de voz con MediaRecorder, ondas de amplitud animadas y estados (idle, listening, processing, speaking).
 */
import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip, CircularProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ORB_THEMES = {
  idle: { color: '#2C8B64', shadow: 'rgba(44,139,100,0.4)', text: 'Presiona para hablar con la IA AgroVet' },
  listening: { color: '#ef4444', shadow: 'rgba(239,68,68,0.6)', text: 'Escuchando tu consulta...' },
  processing: { color: '#fbbf24', shadow: 'rgba(251,191,36,0.6)', text: 'Consultando base de datos médica RAG...' },
  speaking: { color: '#38bdf8', shadow: 'rgba(56,189,248,0.6)', text: 'Respondiendo consulta...' },
  error: { color: '#f87171', shadow: 'rgba(248,113,113,0.5)', text: 'Ocurrió un error al procesar el audio' },
};

export default function AIOrbWeb({ orbState, onVoiceRecorded, onInterrupt }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const theme = ORB_THEMES[orbState] || ORB_THEMES.idle;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        if (onVoiceRecorded && audioChunksRef.current.length > 0) {
          onVoiceRecorded(audioBlob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
      if (onInterrupt) onInterrupt('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleClick = () => {
    if (orbState === 'listening' || isRecording) {
      stopRecording();
    } else if (orbState === 'idle') {
      startRecording();
    } else if (onInterrupt) {
      onInterrupt();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3 }}>
      {/* Glow Animated Orb Container */}
      <Box
        onClick={handleClick}
        sx={{
          position: 'relative',
          width: 130,
          height: 130,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: `radial-gradient(circle, ${theme.color} 0%, rgba(15,23,42,0.8) 75%)`,
          boxShadow: `0 0 40px ${theme.shadow}, inset 0 0 20px rgba(255,255,255,0.2)`,
          transition: 'all 0.4s ease-in-out',
          transform: orbState === 'listening' ? 'scale(1.08)' : orbState === 'speaking' ? 'scale(1.05)' : 'scale(1)',
          animation: orbState === 'listening' ? 'pulse 1.2s infinite alternate' : orbState === 'processing' ? 'rotate 2s linear infinite' : 'none',
          '&:hover': {
            boxShadow: `0 0 55px ${theme.shadow}`,
            transform: 'scale(1.05)',
          },
        }}
      >
        {/* Core Icon */}
        {orbState === 'processing' ? (
          <CircularProgress size={44} sx={{ color: '#fff' }} />
        ) : orbState === 'speaking' ? (
          <VolumeUpIcon sx={{ fontSize: 50, color: '#fff' }} />
        ) : orbState === 'listening' ? (
          <StopIcon sx={{ fontSize: 50, color: '#fff' }} />
        ) : orbState === 'error' ? (
          <ErrorOutlineIcon sx={{ fontSize: 50, color: '#fff' }} />
        ) : (
          <MicIcon sx={{ fontSize: 50, color: '#fff' }} />
        )}
      </Box>

      {/* Dynamic Status Text */}
      <Typography variant="body2" fontWeight={600} color="#94a3b8" mt={2} textAlign="center">
        {theme.text}
      </Typography>
    </Box>
  );
}
