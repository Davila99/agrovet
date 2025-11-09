import React, { useState, useRef, useEffect } from "react";
import { Box, Button, Typography, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { cleanName } from './chatUtils';
import AudioWaveform from './AudioWaveform';
import WaveformPlayer from './WaveformPlayer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

export default function AttachmentPreview({ pending, onConfirm, onCancel }) {
  if (!pending) return null;
  const { previewUrl, name, file, size } = pending;
  const mediaType = (pending && pending.media_type) || (file && file.type && file.type.split('/')[0]) || null;

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ width: '100%', maxHeight: 320, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        {mediaType === 'image' && (
          <img src={previewUrl} alt={name} style={{ width: '100%', height: 'auto', borderRadius: 8, objectFit: 'cover' }} />
        )}
        {mediaType === 'video' && (
          <video src={previewUrl} controls style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
        )}
        {mediaType === 'audio' && (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body1">{cleanName(name)}</Typography>
            {/* Inline preview player with waveform for pending audio attachments */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WaveformPlayer src={previewUrl} spectrum={pending && pending.spectrum ? pending.spectrum : new Array(32).fill(0)} activeColor={'#6b6b6b'} inactiveColor={'#e6e6e6'} />
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">{cleanName(name)} • {(size/1024).toFixed(1)} KB</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton
            onClick={onConfirm}
            aria-label="enviar"
            sx={{ bgcolor: 'success.main', color: 'common.white', '&:hover': { bgcolor: 'success.dark' } }}
            size="large"
          >
            <SendIcon />
          </IconButton>
          <IconButton
            onClick={onCancel}
            aria-label="cancelar"
            sx={{ bgcolor: 'error.main', color: 'common.white', '&:hover': { bgcolor: 'error.dark' } }}
            size="large"
          >
            <DeleteIcon />
          </IconButton>
          <IconButton onClick={onCancel} aria-label="cerrar" sx={{ ml: 1 }}><CloseIcon /></IconButton>
        </Box>
      </Box>
    </Box>
  );
}

  function PreviewAudioPlayer({ previewUrl, spectrum = [] }) {
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(null);

    useEffect(() => {
      if (!previewUrl) return;
      const a = new Audio(previewUrl);
      a.preload = 'metadata';
      audioRef.current = a;
      const onLoaded = () => {
        // noop
      };
      const onTime = () => {
        if (!a.duration) return setProgress(0);
        const p = a.currentTime / a.duration;
        setProgress(p);
        // debug log progress
        try { console.log('[PreviewAudioPlayer] progress', p); } catch (e) {}
      };
      const onEnd = () => {
        setPlaying(false);
        setProgress(0);
      };
      a.addEventListener('loadedmetadata', onLoaded);
      a.addEventListener('timeupdate', onTime);
      a.addEventListener('ended', onEnd);
      return () => {
        try { a.pause(); a.src = ''; } catch (e) {}
        a.removeEventListener('loadedmetadata', onLoaded);
        a.removeEventListener('timeupdate', onTime);
        a.removeEventListener('ended', onEnd);
      };
    }, [previewUrl]);

    const toggle = async () => {
      const a = audioRef.current;
      if (!a) return;
      if (playing) {
        a.pause();
        setPlaying(false);
        return;
      }
      try { await a.play(); setPlaying(true); } catch (e) { console.error('preview play failed', e); }
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={toggle} sx={{ bgcolor: '#e8f4ff', color: '#1976d2' }}>
            {playing ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <AudioWaveform spectrum={spectrum} width={260} height={36} dotted={true} progress={progress} isPlaying={playing} activeColor={'#6b6b6b'} inactiveColor={'#e6e6e6'} />
        </Box>
        <Typography variant="caption" color="text.secondary">{Math.round(progress * 100)}%</Typography>
      </Box>
    );
  }
