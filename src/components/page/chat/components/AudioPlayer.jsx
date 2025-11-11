import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import AudioWaveform from '../AudioWaveform';

export default function AudioPlayer({ src, spectrum, messageId, onPlayStart, activeColor = '#1976d2', inactiveColor = '#cfd8dc', fromMe = false }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!src) return;
    const a = new Audio(src);
    a.preload = 'metadata';
    audioRef.current = a;

    const onLoaded = () => setDuration(a.duration || 0);
    const onTime = () => {
      if (!a.duration) return setProgress(0);
      setProgress(a.currentTime / a.duration);
    };
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
      try { window.dispatchEvent(new CustomEvent('agrovet-audio-ended', { detail: { id: messageId } })); } catch (e) {}
    };

    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended', onEnd);

    const onOtherPlay = (ev) => {
      try {
        const other = ev && ev.detail && ev.detail.id;
        if (other !== messageId && audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setPlaying(false);
          setProgress(0);
        }
      } catch (e) {}
    };
    window.addEventListener('agrovet-audio-play', onOtherPlay);

    return () => {
      try {
        a.pause();
        a.src = '';
      } catch (e) {}
      a.removeEventListener('loadedmetadata', onLoaded);
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('ended', onEnd);
      window.removeEventListener('agrovet-audio-play', onOtherPlay);
    };
  }, [src, messageId]);

  useEffect(() => {
  try { console.info('[AudioPlayer] init', { messageId, spectrumLen: Array.isArray(spectrum) ? spectrum.length : 0 }); } catch (e) {}
  }, [messageId, spectrum]);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); return; }
    try { window.dispatchEvent(new CustomEvent('agrovet-audio-play', { detail: { id: messageId } })); } catch (e) {}
    if (onPlayStart) onPlayStart(messageId);
    try { await a.play(); setPlaying(true); } catch (e) { console.error('play failed', e); }
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton size="small" onClick={toggle} sx={{ bgcolor: fromMe ? 'transparent' : '#e8f4ff', color: fromMe ? '#075e35' : '#1976d2' }}>
        {playing ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
      <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 44, textAlign: 'center' }}>{fmt(duration * progress || 0)}</Typography>
      <AudioWaveform spectrum={spectrum || []} width={220} height={36} dotted={true} progress={progress} activeColor={activeColor} inactiveColor={inactiveColor} isPlaying={playing} />
      <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>{fmt(duration || 0)}</Typography>
    </Box>
  );
}
