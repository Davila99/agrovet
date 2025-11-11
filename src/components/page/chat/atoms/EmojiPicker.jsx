import React from 'react';
import { IconButton, Popover, Box, Grid } from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

export default function EmojiPicker({ onPick, anchorElProp, inputRef, text, setText }) {
  const [anchor, setAnchor] = React.useState(null);
  const [FullPicker, setFullPicker] = React.useState(null);
  const [emojiDataState, setEmojiDataState] = React.useState(null);
  const [pickerLoadError, setPickerLoadError] = React.useState(false);

  const openEmojiPicker = async (ev) => {
    setAnchor(ev.currentTarget);
    if (!FullPicker && !pickerLoadError) {
      try {
        const pkgBase = ['@', 'emoji', '-', 'mart'].join('');
        const pickerName = pkgBase + '/' + 'react';
        const dataName = pkgBase + '/' + 'data';
        const pickerMod = await import(/* @vite-ignore */ pickerName);
        const dataMod = await import(/* @vite-ignore */ dataName);
        const P = pickerMod && (pickerMod.default || pickerMod.Picker || pickerMod);
        setFullPicker(() => P);
        setEmojiDataState(dataMod && (dataMod.default || dataMod));
      } catch (e) {
        console.warn('emoji-mart load failed, falling back to small emoji grid', e);
        setPickerLoadError(true);
      }
    }
  };

  const closeEmojiPicker = () => setAnchor(null);

  const onEmojiSelect = (emoji) => {
    const ch = emoji && (emoji.native || emoji.colons || emoji.symbol) || '';
    try {
      const el = inputRef && inputRef.current && inputRef.current.querySelector && inputRef.current.querySelector('input');
      if (!el) {
        setText((t) => (t || '') + ch);
        closeEmojiPicker();
        return;
      }
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const value = text || '';
      const next = value.slice(0, start) + ch + value.slice(end);
      setText(next);
      requestAnimationFrame(() => {
        try { el.focus(); el.setSelectionRange(start + ch.length, start + ch.length); } catch (e) {}
      });
    } catch (e) {
      setText((t) => (t || '') + ch);
    } finally {
      closeEmojiPicker();
    }
  };

  return (
    <>
      <IconButton onClick={openEmojiPicker} sx={{ bgcolor: '#F0F7FF', mr: 1 }} title="Emojis">
        <EmojiEmotionsIcon sx={{ color: '#1976d2' }} />
      </IconButton>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={closeEmojiPicker}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 1, maxWidth: 340 }}>
          {FullPicker && emojiDataState ? (
            <FullPicker data={emojiDataState} onEmojiSelect={onEmojiSelect} theme="light" />
          ) : (
            <Grid container spacing={1} sx={{ maxWidth: 320 }}>
              {[
                '😀','😃','😄','😁','😆','😊','😍','😘','😎','🤩',
                '🤔','😅','😇','😉','😭','😴','😡','👍','👎','🙏',
                '🎉','❤️','🔥','✨','😜','🤗','😬','🤝','💯','✅'
              ].map((e) => (
                <Grid item key={e}>
                  <IconButton size="small" onClick={() => onEmojiSelect({ native: e })}>{e}</IconButton>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Popover>
    </>
  );
}
