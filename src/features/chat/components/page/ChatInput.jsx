import React from 'react';
import { Box, TextField, InputAdornment, IconButton, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import PauseIcon from '@mui/icons-material/Pause';
import MicNoneIcon from '@mui/icons-material/MicNone';
import { CircularProgress } from '@mui/material';
import FileAttach from './atoms/FileAttach';
import EmojiPicker from './atoms/EmojiPicker';
import AudioRecorder from './molecules/AudioRecorder';
import SendButton from './atoms/SendButton';

export default function ChatInput({
  text,
  setText,
  handleSend,
  handleKeyDown,
  onAttach,
  pendingAttachment,
  onCancelAttachment,
  onConfirmAttachment,
  sending,
  uploadingAttachment,
}) {
  const inputRef = React.useRef(null);
  const recorderRef = React.useRef(null);
  const [recording, setRecording] = React.useState(false);
  const [liveSpectrum, setLiveSpectrum] = React.useState(null);
  const [localPending, setLocalPending] = React.useState(null);
  // Important: do NOT auto-confirm audio attachments here.
  // Recording lifecycle: pause -> preview (parent gets pendingAttachment via onAttach)
  // user must explicitly confirm (onConfirmAttachment) or cancel (onCancelAttachment).

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 1.25, md: 1.5 },
        borderTop: (theme) => `1px solid ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
        backgroundColor: 'background.paper',
        flexShrink: 0,
      }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Escribe un mensaje..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ 
          '& .MuiOutlinedInput-root': { 
            borderRadius: { xs: 20, sm: 24, md: 28 }, 
            paddingRight: 0, 
            backgroundColor: (theme) => recording ? '#f5f5f5' : (theme.palette.mode === 'light' ? '#fff' : '#111'),
            fontSize: "0.75rem",
          },
          '& .MuiInputBase-input': {
            fontSize: "0.75rem",
          }
        }}
        InputProps={{
          inputRef: inputRef,
          startAdornment: (
              <InputAdornment position="start">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 0.5 }}>
                  <FileAttach onAttach={onAttach} />
                  <EmojiPicker inputRef={inputRef} text={text} setText={setText} />
                  {/* If there's a pending audio attachment with spectrum, render a small inline spectrum */}
                  {/* prefer external pendingAttachment, fallback to localPending set when recorder finishes */}
                  {((pendingAttachment || localPending) && (pendingAttachment || localPending).file && typeof (pendingAttachment || localPending).file.type === 'string' && (pendingAttachment || localPending).file.type.startsWith('audio') && Array.isArray((pendingAttachment || localPending).spectrum)) && (
                    <Box sx={{ ml: 1, display: 'flex', alignItems: 'flex-end', gap: '2px', width: { xs: 90, sm: 140 }, height: 28 }}>
                      {(pendingAttachment || localPending).spectrum.slice(0, 20).map((v, i) => {
                        const h = Math.max(2, Math.round((v / 255) * 100));
                        return (
                          <Box key={i} sx={{ width: `${100 / Math.min(20, (pendingAttachment || localPending).spectrum.length)}%`, background: '#1976d2', height: `${h}%`, borderRadius: 1 }} />
                        );
                      })}
                    </Box>
                  )}
                  {/* While actively recording show live spectrum inside the input */}
                  {recording && Array.isArray(liveSpectrum) && (
                    <Box sx={{ ml: 1, display: 'flex', alignItems: 'flex-end', gap: '2px', width: { xs: 90, sm: 140 }, height: 28 }}>
                      {liveSpectrum.slice(0, 20).map((v, i) => {
                        const h = Math.max(2, Math.round((v / 255) * 100));
                        return (
                          <Box key={`live-${i}`} sx={{ width: `${100 / Math.min(20, liveSpectrum.length)}%`, background: '#1976d2', height: `${h}%`, borderRadius: 1 }} />
                        );
                      })}
                    </Box>
                  )}
                </Box>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {/* Show Send button when there is text, otherwise show mic/recorder */}
                {String(text || '').trim().length > 0 ? (
                  <SendButton onClick={handleSend} disabled={!!sending} />
                ) : (
                  // If actively recording, show inline pause (to generate clip) and delete icons
                  recording ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title="Pausar (generar clip)">
                        <IconButton size="small" onClick={() => { try { recorderRef.current && recorderRef.current.stopRecording(); } catch(e){} }}>
                          <PauseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => { try { recorderRef.current && recorderRef.current.cancelRecording(); if (typeof onCancelAttachment === 'function') onCancelAttachment(); setLocalPending(null); } catch(e){} }}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    // If there's a pending audio attachment, render inline controls (play / send / delete)
                    ((pendingAttachment || localPending) && (pendingAttachment || localPending).file && typeof (pendingAttachment || localPending).file.type === 'string' && (pendingAttachment || localPending).file.type.startsWith('audio')) ? (
                      // If uploadingAttachment is true hide the send/delete buttons and show a small spinner
                      uploadingAttachment ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CircularProgress size={20} />
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Tooltip title="Reproducir">
                            <IconButton size="small" onClick={() => {
                              try {
                                const a = document.createElement('audio');
                                a.src = (pendingAttachment || localPending).previewUrl || ((pendingAttachment || localPending).file && URL.createObjectURL((pendingAttachment || localPending).file));
                                a.play().catch(()=>{});
                              } catch(e){}
                            }}>
                              <PlayArrowIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Enviar">
                            <IconButton size="small" onClick={() => {
                              try {
                                // Call parent's confirm handler with the local pending payload to avoid a race
                                if (typeof onConfirmAttachment === 'function') {
                                  const p = onConfirmAttachment(localPending);
                                  if (p && typeof p.then === 'function') {
                                    p.finally(() => {
                                      try { if (localPending && localPending.previewUrl) URL.revokeObjectURL(localPending.previewUrl); } catch (e) {}
                                      setLocalPending(null);
                                    });
                                  } else {
                                    try { if (localPending && localPending.previewUrl) URL.revokeObjectURL(localPending.previewUrl); } catch (e) {}
                                    setLocalPending(null);
                                  }
                                } else {
                                  try { if (localPending && localPending.previewUrl) URL.revokeObjectURL(localPending.previewUrl); } catch (e) {}
                                  setLocalPending(null);
                                }
                              } catch(e){}
                            }} sx={{ bgcolor: '#1976d2', color: '#fff', '&:hover': { bgcolor: '#155fa8' } }}>
                              <SendRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton size="small" onClick={() => { try { if (typeof onCancelAttachment === 'function') onCancelAttachment(); try { if (localPending && localPending.previewUrl) URL.revokeObjectURL(localPending.previewUrl); } catch(e){} setLocalPending(null); } catch(e){} }}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )
                    ) : (
                      // When idle and no pending audio, show the mic button inside the input
                      <Tooltip title="Grabar audio">
                        <IconButton size="small" onClick={() => { try { recorderRef.current && recorderRef.current.startRecording(); } catch(e){} }}>
                          <MicNoneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  )
                )}
              </InputAdornment>
            ),
        }}
              disabled={recording || uploadingAttachment || (pendingAttachment && pendingAttachment.file && typeof pendingAttachment.file.type === 'string' && pendingAttachment.file.type.startsWith('audio'))}
      />
      {/* Keep AudioRecorder mounted so its imperative methods and media state persist while ChatInput shows Pause/Preview UI. */}
      {/* Keep AudioRecorder mounted but visually hidden so the input's mic controls the recorder.
          Previously this component was visible as a floating button above the input; we hide it
          here to avoid duplicate microphone controls while preserving its mounted state and audio context. */}
      <Box sx={{ display: 'none' }}>
        <AudioRecorder ref={recorderRef} onAttach={(payload) => { try { if (typeof onAttach === 'function') onAttach(payload); setLocalPending(payload); } catch(e){} }} onCancelAttachment={(ev) => { try { if (typeof onCancelAttachment === 'function') onCancelAttachment(ev); setLocalPending(null); } catch(e){} }} onConfirmAttachment={(ev) => { try { if (typeof onConfirmAttachment === 'function') onConfirmAttachment(ev); setLocalPending(null); } catch(e){} }} onRecordingChange={(v) => setRecording(!!v)} onLiveSpectrum={(s) => setLiveSpectrum(s)} />
      </Box>
      {/* pendingAttachment UI (if parent uses it) kept intentionally outside to let parent render AttachmentPreview */}
    </Box>
  );
}




