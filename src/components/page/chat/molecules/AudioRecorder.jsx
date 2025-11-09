import React from 'react';
import { Box, Button, IconButton } from '@mui/material';
import MicNoneIcon from '@mui/icons-material/MicNone';

export default function AudioRecorder({ onAttach }) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = React.useState(null);
  const mediaRecorderRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);
  const audioStreamRef = React.useRef(null);
  const audioCtxRef = React.useRef(null);
  const analyserRef = React.useRef(null);
  const dataArrayRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);

  const startRecording = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size) audioChunksRef.current.push(ev.data);
      };

      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: audioChunksRef.current[0]?.type || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);
        try {
          const fname = `voice_${Date.now()}.webm`;
          const file = new File([blob], fname, { type: blob.type });
          let spectrum = null;
          try {
            const analyser = analyserRef.current;
            if (analyser) {
              const freq = new Uint8Array(analyser.frequencyBinCount || 1024);
              analyser.getByteFrequencyData(freq);
              const bins = 32;
              const chunk = Math.max(1, Math.floor(freq.length / bins));
              spectrum = [];
              for (let i = 0; i < bins; i++) {
                let sum = 0;
                for (let j = 0; j < chunk; j++) {
                  const idx = i * chunk + j;
                  if (idx < freq.length) sum += freq[idx];
                }
                spectrum.push(Math.round(sum / chunk));
              }
            }
          } catch (e) { spectrum = null; }
          if (onAttach) onAttach({ file, previewUrl: url, spectrum });
        } catch (e) {
          console.warn('failed to create File from blob', e);
        }
        stopAnalyser();
        try { if (audioStreamRef.current) { audioStreamRef.current.getTracks().forEach(t=>t.stop()); audioStreamRef.current = null; } } catch(e){}
        setIsRecording(false);
      };

      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ac = new AudioContext();
        audioCtxRef.current = ac;
        const src = ac.createMediaStreamSource(stream);
        const analyser = ac.createAnalyser();
        analyser.fftSize = 2048;
        src.connect(analyser);
        analyserRef.current = analyser;
        const bufferLength = analyser.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        drawAnalyser();
      } catch (e) { console.debug('analyser setup failed', e); }

      mr.start();
      setIsRecording(true);
    } catch (e) {
      console.error('startRecording failed', e);
    }
  };

  const stopAnalyser = () => {
    try {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch (e) {} audioCtxRef.current = null; }
      analyserRef.current = null;
      dataArrayRef.current = null;
      rafRef.current = null;
    } catch (e) {}
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch (e) { console.error('stopRecording failed', e); }
  };

  const cancelRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      stopAnalyser();
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      }
      if (recordedBlobUrl) {
        try { URL.revokeObjectURL(recordedBlobUrl); } catch (e) {}
        setRecordedBlobUrl(null);
      }
      setIsRecording(false);
    } catch (e) { console.error(e); }
  };

  const drawAnalyser = () => {
    try {
      const analyser = analyserRef.current;
      const canvas = canvasRef.current;
      if (!analyser || !canvas) return;
      const canvasCtx = canvas.getContext('2d');
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = dataArrayRef.current;

      const draw = () => {
        rafRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        const width = canvas.width;
        const height = canvas.height;
        canvasCtx.fillStyle = '#f5f5f5';
        canvasCtx.fillRect(0, 0, width, height);
        const barCount = Math.min(64, dataArray.length);
        const barWidth = (width / barCount) - 2;
        for (let i = 0; i < barCount; i++) {
          const v = dataArray[i];
          const percent = v / 255;
          const barHeight = Math.max(2, percent * height);
          const x = i * (barWidth + 2);
          const grad = canvasCtx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, '#2AABEE');
          grad.addColorStop(1, '#1976d2');
          canvasCtx.fillStyle = grad;
          canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight);
        }
      };
      draw();
    } catch (e) { console.debug('draw analyser failed', e); }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton sx={{ bgcolor: isRecording ? '#FFF6E6' : '#FFF6E6', mr: 1 }} title={isRecording ? 'Detener grabación' : 'Grabar audio'} onClick={() => { if (!isRecording) startRecording(); else stopRecording(); }}>
        <MicNoneIcon sx={{ color: isRecording ? '#d32f2f' : '#F39C12' }} />
      </IconButton>
      {(isRecording || recordedBlobUrl) && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <canvas ref={canvasRef} width={300} height={48} style={{ borderRadius: 8, width: '100%', maxWidth: 420, background: '#f5f5f5' }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isRecording ? (
              <Button variant="contained" color="error" onClick={stopRecording}>Detener</Button>
            ) : (
              <Button variant="contained" color="primary" onClick={() => { /* playback handled elsewhere */ }}>{recordedBlobUrl ? 'Listo' : 'Grabar'}</Button>
            )}
            <Button variant="outlined" onClick={cancelRecording}>Cancelar</Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
