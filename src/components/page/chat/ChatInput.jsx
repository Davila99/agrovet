import React from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
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
}) {
  const inputRef = React.useRef(null);

  return (
    <Box
      sx={{
        p: 1.5,
        borderTop: '1px solid rgba(0,0,0,0.08)',
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
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 28, paddingRight: 0 } }}
        InputProps={{
          inputRef: inputRef,
          startAdornment: (
            <InputAdornment position="start">
              <>
                <FileAttach onAttach={onAttach} />
                <AudioRecorder onAttach={onAttach} />
                <EmojiPicker inputRef={inputRef} text={text} setText={setText} />
              </>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <SendButton onClick={handleSend} disabled={!!sending} />
            </InputAdornment>
          ),
        }}
      />
      {/* pendingAttachment UI (if parent uses it) kept intentionally outside to let parent render AttachmentPreview */}
    </Box>
  );
}
