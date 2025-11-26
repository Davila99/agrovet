import React, { useEffect, useRef, useState } from 'react';
import { Box, Avatar } from '@mui/material';
import AudioPlayButton from './AudioPlayButton';
import AudioTime from './AudioTime';
import Waveform from './Waveform';

// WhatsApp-like audio bubble
export default function WhatsAppAudioBubble({
  src,
  avatarUrl,
  fromMe = false,
  timestamp = '',
  duration: propDuration = 0,
  waveformData = [],
  read = false,
  receipts = [],
  currentUserId = null,
  id = null,
}) {
  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const mountedRef = useRef(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [duration, setDuration] = useState(propDuration || 0);

  // unique id for synchronization
  const uidRef = useRef(id || `wa-audio-${Math.random().toString(36).slice(2,9)}`);

  // setup audio element
  useEffect(() => {
    mountedRef.current = true;
    if (!src) return undefined;
    const a = new Audio(src);
    a.preload = 'metadata';
    audioRef.current = a;

    const onLoaded = () => {
      if (!mountedRef.current) return;
      setDuration(a.duration || propDuration || 0);
    };
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
      try { window.dispatchEvent(new CustomEvent('agrovet-audio-ended', { detail: { id: uidRef.current } })); } catch(e){}
      cancelRAF();
      if (audioRef.current) audioRef.current.currentTime = 0;
    };

    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('ended', onEnded);

    // listen for other players
    const onOtherPlay = (ev) => {
      try {
        const other = ev && ev.detail && ev.detail.id;
        if (other !== uidRef.current && audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setPlaying(false);
          setProgress(0);
          cancelRAF();
        }
      } catch (e) {}
    };

    window.addEventListener('agrovet-audio-play', onOtherPlay);

    return () => {
      mountedRef.current = false;
      try { a.pause(); a.src = ''; } catch (e) {}
      a.removeEventListener('loadedmetadata', onLoaded);
      a.removeEventListener('ended', onEnded);
      window.removeEventListener('agrovet-audio-play', onOtherPlay);
      cancelRAF();
      audioRef.current = null;
    };
  }, [src, propDuration]);

  // RAF loop to update progress smoothly
  const cancelRAF = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const rafLoop = () => {
    const a = audioRef.current;
    if (!a || !mountedRef.current) return cancelRAF();
    const d = a.duration || duration || 1;
    const p = d ? Math.max(0, Math.min(1, a.currentTime / d)) : 0;
    setProgress(p);
    rafRef.current = requestAnimationFrame(rafLoop);
  };

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      cancelRAF();
      return;
    }

    // notify others to pause
    try { window.dispatchEvent(new CustomEvent('agrovet-audio-play', { detail: { id: uidRef.current } })); } catch(e){}

    try {
      await a.play();
      setPlaying(true);
      rafLoop();
    } catch (e) {
      console.error('[WhatsAppAudioBubble] play failed', e);
    }
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // waveform rendering helpers
  const bars = Array.isArray(waveformData) && waveformData.length ? waveformData.slice() : new Array(24).fill(64);
  const bins = Math.max(4, Math.min(64, bars.length));
  const displayed = bars.slice(0, bins);
  // scale to 0-255
  const maxVal = Math.max(...displayed.map((n) => Number(n) || 0), 1);
  const scaled = displayed.map((n) => Math.round(((Number(n) || 0) / maxVal) * 255));

  // dimensions
  const totalHeight = 40; // px visual height
  const waveHeight = 28; // inner bars height container
  const barGap = 2;
  const barWidth = 2; // thin WhatsApp-like bars
  const waveformWidth = Math.max(120, Math.min(420, bins * (barWidth + barGap)));

  const playedCount = Math.floor(progress * bins);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: '8px 12px', borderRadius: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', bgcolor: fromMe ? '#DCF8C6' : '#FFFFFF', maxWidth: '100%', width: 'auto' }}>
      {/* optional avatar */}
      {avatarUrl && (
        <Avatar src={avatarUrl} sx={{ width: 36, height: 36 }} />
      )}

      {/* play/pause button */}
      <AudioPlayButton playing={playing} onToggle={toggle} />

      {/* elapsed time */}
      <AudioTime progress={progress} duration={duration} />

      {/* waveform + cursor */}
      <Waveform waveformData={waveformData} progress={progress} barWidth={barWidth} barGap={barGap} waveHeight={waveHeight} />

      {/* timestamp and read indicator are rendered by the parent MessageItem to avoid duplication */}
    </Box>
  );
}

export { WhatsAppAudioBubble };




