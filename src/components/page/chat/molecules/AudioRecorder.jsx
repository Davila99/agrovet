import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import MicNoneIcon from '@mui/icons-material/MicNone';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

const AudioRecorder = React.forwardRef(function AudioRecorder({ onAttach, onCancelAttachment, onConfirmAttachment, onRecordingChange, onLiveSpectrum }, ref) {
  const [state, setState] = React.useState('IDLE'); // IDLE | RECORDING | PAUSED | SENDING
  const [recordedBlobUrl, setRecordedBlobUrl] = React.useState(null);
  const [audioBlob, setAudioBlob] = React.useState(null);
  const [elapsedSec, setElapsedSec] = React.useState(0);
  const mediaRecorderRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);
  const ignoreNextOnStopRef = React.useRef(false);
  const audioStreamRef = React.useRef(null);
  const audioCtxRef = React.useRef(null);
  const analyserRef = React.useRef(null);
  const dataArrayRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const timerRef = React.useRef(null);
  const anchorRef = React.useRef(null);

  const startRecording = async () => {
    if (state === 'RECORDING') return;
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
        if (ignoreNextOnStopRef.current) {
          // reset the flag and do not produce a clip
          ignoreNextOnStopRef.current = false;
          setState('IDLE');
          try { if (typeof onRecordingChange === 'function') onRecordingChange(false); } catch (e) {}
          stopAnalyser();
          try { if (audioStreamRef.current) { audioStreamRef.current.getTracks().forEach(t=>t.stop()); audioStreamRef.current = null; } } catch(e){}
          return;
        }
        const blob = new Blob(audioChunksRef.current, { type: audioChunksRef.current[0]?.type || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setRecordedBlobUrl(url);

        // compute snapshot spectrum
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

        try {
          const fname = `voice_${Date.now()}.webm`;
          const file = new File([blob], fname, { type: blob.type });
          if (onAttach) onAttach({ file, previewUrl: url, spectrum });
        } catch (e) { console.warn('failed to create File from blob', e); }

        stopAnalyser();
        try { if (audioStreamRef.current) { audioStreamRef.current.getTracks().forEach(t=>t.stop()); audioStreamRef.current = null; } } catch(e){}

        setState('PAUSED');
        try { if (typeof onRecordingChange === 'function') onRecordingChange(false); } catch (e) {}
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
  } catch (e) { console.warn('analyser setup failed', e); }

      mr.start();
      setState('RECORDING');
      setElapsedSec(0);
      timerRef.current = setInterval(() => setElapsedSec((s) => s + 1), 1000);
      try { if (typeof onRecordingChange === 'function') onRecordingChange(true); } catch (e) {}
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
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
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
        // when cancelling while recording we must avoid the onstop handler
        ignoreNextOnStopRef.current = true;
        try { mediaRecorderRef.current.stop(); } catch(e){}
        // onstop will early-return and we continue cleanup below
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
      setAudioBlob(null);
      setElapsedSec(0);
      setState('IDLE');
      try { if (typeof onRecordingChange === 'function') onRecordingChange(false); } catch (e) {}
      try { if (typeof onCancelAttachment === 'function') onCancelAttachment(); } catch (e) {}
    } catch (e) { console.error(e); }
  };

  // expose methods to parent via ref
  React.useImperativeHandle(ref, () => ({
    cancelRecording: () => cancelRecording(),
    stopRecording: () => stopRecording(),
    startRecording: () => startRecording(),
  }));

  const drawAnalyser = () => {
    try {
      const analyser = analyserRef.current;
      const canvas = canvasRef.current;
      if (!analyser || !canvas) return;
      const canvasCtx = canvas.getContext('2d');
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = dataArrayRef.current;

      const lastEmitRef = drawAnalyser._lastEmit || { t: 0 };
      drawAnalyser._lastEmit = lastEmitRef;

      const draw = () => {
        rafRef.current = requestAnimationFrame(draw);
        try { analyser.getByteFrequencyData(dataArray); } catch(e) { return; }
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

        // Emit a compact spectrum to parent occasionally (~140ms)
        try {
          const now = Date.now();
          if (typeof onLiveSpectrum === 'function' && now - lastEmitRef.t > 140) {
            lastEmitRef.t = now;
            const bins = 20;
            const chunk = Math.max(1, Math.floor(dataArray.length / bins));
            const spec = [];
            for (let bi = 0; bi < bins; bi++) {
              let sum = 0;
              for (let j = 0; j < chunk; j++) {
                const idx = bi * chunk + j;
                if (idx < dataArray.length) sum += dataArray[idx];
              }
              spec.push(Math.round(sum / chunk));
            }
            try { onLiveSpectrum(spec); } catch (e) {}
          }
        } catch (e) {}
      };
      draw();
  } catch (e) { console.warn('draw analyser failed', e); }
  };

  const formatTime = (s) => {
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const handlePauseClick = () => {
    // Pause implemented as stop -> produce blob and go to PAUSED
    stopRecording();
  };

  const handleSendClick = () => {
    // If we already have audioBlob and recordedBlobUrl, parent onAttach was called in onstop
    // Set SENDING and then reset UI; ChatInput will auto-confirm pendingAttachment.
    setState('SENDING');
    try { if (typeof onConfirmAttachment === 'function') onConfirmAttachment(); } catch (e) {}
    setTimeout(() => {
      setState('IDLE');
      setRecordedBlobUrl(null);
      setAudioBlob(null);
      setElapsedSec(0);
    }, 300);
  };

  const handlePlayClick = () => {
    try {
      const a = document.createElement('audio');
      a.src = recordedBlobUrl;
      a.play().catch(()=>{});
    } catch(e){}
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title={state === 'RECORDING' ? 'Detener' : 'Grabar audio'}>
        <IconButton
          ref={anchorRef}
          onClick={() => { if (state !== 'RECORDING') startRecording(); else stopRecording(); }}
          sx={{
            bgcolor: state === 'RECORDING' ? '#FFEDEE' : '#E8F6FF',
            mr: 1,
            '&:hover': { bgcolor: state === 'RECORDING' ? '#FFD3D3' : '#D6F0FF' }
          }}
        >
          <MicNoneIcon sx={{ color: state === 'RECORDING' ? '#d32f2f' : '#1976d2' }} />
        </IconButton>
      </Tooltip>

      {/* Canvas kept hidden; parent receives live spectrum via onLiveSpectrum and will render it inline in the input */}
      <canvas ref={canvasRef} width={300} height={48} style={{ display: 'none' }} />
    </Box>
  );
});

export default AudioRecorder;










