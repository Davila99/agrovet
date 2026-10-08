import { useEffect, useRef, useState } from 'react';

// Hook that abstracts wavesurfer.js initialization and native audio fallback.
export default function useWaveform({ id = null, src, height = 48, barWidth = 2, activeColor = '#4a4a4a', inactiveColor = '#bdbdbd', cursorColor = '#00A6FF', onPlayStart, onPlayEnd }) {
  const containerRef = useRef(null);
  const waveRef = useRef(null);
  const audioRef = useRef(null);
  const [wavesurfer, setWavesurfer] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [containerWidth, setContainerWidth] = useState(300);

  useEffect(() => {
    let mounted = true;
    let ws = null;
    const init = async () => {
      try {
        const WaveSurferModule = await import('wavesurfer.js');
        const WaveSurfer = WaveSurferModule.default || WaveSurferModule;
        if (!mounted) return;
        ws = WaveSurfer.create({
          container: containerRef.current,
          backend: 'MediaElement',
          waveColor: inactiveColor,
          progressColor: activeColor,
          cursorColor: cursorColor,
          cursorWidth: 2,
          height: height,
          responsive: true,
          barWidth: barWidth,
          barRadius: 2,
          normalize: false,
          partialRender: true,
        });
        waveRef.current = ws;
        setWavesurfer(ws);

        ws.on('ready', () => {
          if (!mounted) return;
          setDuration(ws.getDuration() || 0);
        });
        ws.on('error', (err) => {
          try { ws.destroy(); } catch (e) {}
          waveRef.current = null;
          setWavesurfer(null);
        });
        ws.on('audioprocess', () => {
          if (!ws || !mounted) return;
          const pos = ws.getCurrentTime() || 0;
          const d = ws.getDuration() || 1;
          setProgress(d ? pos / d : 0);
        });
        ws.on('seek', () => {
          if (!ws || !mounted) return;
          const pos = ws.getCurrentTime() || 0;
          const d = ws.getDuration() || 1;
          setProgress(d ? pos / d : 0);
        });
        ws.on('finish', () => {
          setPlaying(false);
          setProgress(1);
          if (onPlayEnd) onPlayEnd();
        });

        if (src) {
          try { ws.load(src); } catch (e) {
            try { ws.destroy(); } catch (e2) {}
            waveRef.current = null;
            setWavesurfer(null);
          }
        }
        try {
          const el = containerRef.current && containerRef.current.parentElement;
          if (el) setContainerWidth(Math.max(120, el.clientWidth || 300));
        } catch (e) {}
      } catch (e) {
        // wavesurfer import failed - fallback will use native audio
      }
    };
    init();

    return () => {
      mounted = false;
      try { if (ws) ws.destroy(); } catch (e) {}
    };
  }, [src, activeColor, inactiveColor, cursorColor, height, barWidth]);

  // native audio fallback
  useEffect(() => {
    if (wavesurfer) {
      if (audioRef.current) {
        try { audioRef.current.pause(); audioRef.current.src = ''; } catch (e) {}
        audioRef.current = null;
      }
      return undefined;
    }
    if (!src) return undefined;
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
      setProgress(1);
      if (onPlayEnd) onPlayEnd();
    };
    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended', onEnd);

    return () => {
      try { a.pause(); a.src = ''; } catch (e) {}
      a.removeEventListener('loadedmetadata', onLoaded);
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('ended', onEnd);
      audioRef.current = null;
    };
  }, [src, wavesurfer, onPlayEnd]);

  // resize handler
  useEffect(() => {
    const onResize = () => {
      try {
        const el = containerRef.current && containerRef.current.parentElement;
        if (el) setContainerWidth(Math.max(120, el.clientWidth || 300));
      } catch (e) {}
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggle = async () => {
    try {
      try { window.dispatchEvent(new CustomEvent('agrovet-audio-play', { detail: { id } })); } catch (e) {}
      if (wavesurfer) {
        if (wavesurfer.isPlaying()) {
          wavesurfer.pause();
          setPlaying(false);
        } else {
          try { wavesurfer.play(); setPlaying(true); if (onPlayStart) onPlayStart(); } catch (e) {}
        }
        return;
      }
      const a = audioRef.current;
      if (!a) return;
      if (!a.paused) {
        a.pause();
        setPlaying(false);
        return;
      }
      try { if (onPlayStart) onPlayStart(); await a.play(); setPlaying(true); } catch (e) {}
    } catch (e) {}
  };

  // global pause listener
  useEffect(() => {
    const onOtherPlay = (ev) => {
      try {
        const other = ev && ev.detail && ev.detail.id;
        if (other === id) return;
        if (wavesurfer && wavesurfer.isPlaying && wavesurfer.isPlaying()) {
          try { wavesurfer.pause(); } catch (e) {}
          setPlaying(false);
        }
        const a = audioRef.current;
        if (a && !a.paused) {
          try { a.pause(); a.currentTime = 0; } catch (e) {}
          setPlaying(false);
        }
      } catch (e) {}
    };
    window.addEventListener('agrovet-audio-play', onOtherPlay);
    return () => window.removeEventListener('agrovet-audio-play', onOtherPlay);
  }, [wavesurfer, id]);

  return {
    containerRef,
    playing,
    progress,
    duration,
    containerWidth,
    toggle,
  };
}
