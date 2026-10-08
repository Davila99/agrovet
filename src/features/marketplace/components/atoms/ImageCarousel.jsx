import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Dialog, DialogContent } from '@mui/material';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Fullscreen from '@mui/icons-material/Fullscreen';
import Close from '@mui/icons-material/Close';

// images: array of up to 5 File objects or string URLs
export default function ImageCarousel({ images = [], height = 320, allowFullscreen = true }) {
  const containerRef = useRef(null);
  const [srcs, setSrcs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const createdRef = useRef(new Map());

  // Max 5 images limit enforced
  const limitedImages = (Array.isArray(images) ? images : []).slice(0, 5);

  useEffect(() => {
    const next = limitedImages.map((it, idx) => {
      if (!it) return null;
      if (typeof it === 'string') return it;
      const key = String(idx);
      if (createdRef.current.has(key)) return createdRef.current.get(key);
      try {
        const url = URL.createObjectURL(it);
        createdRef.current.set(key, url);
        return url;
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    setSrcs(next);
  }, [images]);

  useEffect(() => {
    return () => {
      try {
        createdRef.current.forEach(u => {
          try { URL.revokeObjectURL(u); } catch (e) {}
        });
      } catch (e) {}
      createdRef.current.clear();
    };
  }, []);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth || 1;
    const index = Math.round(el.scrollLeft / w);
    if (index >= 0 && index < srcs.length) {
      setActiveIndex(index);
    }
  };

  const scrollToIndex = (idx) => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth || 300;
    el.scrollTo({ left: idx * w, behavior: 'smooth' });
    setActiveIndex(idx);
  };

  const scrollBy = (dir = 1) => {
    const nextIdx = Math.max(0, Math.min(srcs.length - 1, activeIndex + dir));
    scrollToIndex(nextIdx);
  };

  if (!srcs.length) {
    return <Box sx={{ width: '100%', height, bgcolor: '#f4f6f8', borderRadius: 2 }} />;
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', borderRadius: 2, overflow: 'hidden' }}>
      <Box
        ref={containerRef}
        onScroll={handleScroll}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {srcs.map((s, i) => (
          <Box key={i} sx={{ flex: '0 0 100%', scrollSnapAlign: 'start', width: '100%', height }}>
            <img src={s} alt={`img-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </Box>
        ))}
      </Box>

      {/* Navigation Arrows */}
      {srcs.length > 1 && activeIndex > 0 && (
        <IconButton
          onClick={() => scrollBy(-1)}
          size="small"
          aria-label="Anterior"
          sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
        >
          <ChevronLeft />
        </IconButton>
      )}
      {srcs.length > 1 && activeIndex < srcs.length - 1 && (
        <IconButton
          onClick={() => scrollBy(1)}
          size="small"
          aria-label="Siguiente"
          sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
        >
          <ChevronRight />
        </IconButton>
      )}

      {/* Fullscreen Trigger Button */}
      {allowFullscreen && (
        <IconButton
          onClick={() => setFullscreenOpen(true)}
          size="small"
          aria-label="Pantalla completa"
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
        >
          <Fullscreen fontSize="small" />
        </IconButton>
      )}

      {/* Pagination Dots (signals) */}
      {srcs.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            bgcolor: 'rgba(0,0,0,0.4)',
            px: 1.5,
            py: 0.5,
            borderRadius: 10,
            zIndex: 2,
          }}
        >
          {srcs.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => scrollToIndex(idx)}
              sx={{
                width: idx === activeIndex ? 12 : 7,
                height: 7,
                borderRadius: 4,
                bgcolor: idx === activeIndex ? '#22c55e' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </Box>
      )}

      {/* Fullscreen Lightbox Modal */}
      <Dialog
        fullScreen
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        PaperProps={{ sx: { bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' } }}
      >
        <IconButton
          onClick={() => setFullscreenOpen(false)}
          aria-label="Cerrar vista completa"
          sx={{ position: 'absolute', top: 16, right: 16, color: '#fff', bgcolor: 'rgba(255,255,255,0.15)', zIndex: 10, '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
        >
          <Close />
        </IconButton>

        <DialogContent sx={{ width: '100%', height: '100%', p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <img
            src={srcs[activeIndex]}
            alt={`fullscreen-img-${activeIndex}`}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />

          {srcs.length > 1 && activeIndex > 0 && (
            <IconButton
              onClick={() => setActiveIndex(prev => prev - 1)}
              sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              <ChevronLeft fontSize="large" />
            </IconButton>
          )}

          {srcs.length > 1 && activeIndex < srcs.length - 1 && (
            <IconButton
              onClick={() => setActiveIndex(prev => prev + 1)}
              sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              <ChevronRight fontSize="large" />
            </IconButton>
          )}

          {srcs.length > 1 && (
            <Box sx={{ position: 'absolute', bottom: 24, display: 'flex', gap: 1, bgcolor: 'rgba(255,255,255,0.2)', px: 2, py: 1, borderRadius: 10 }}>
              {srcs.map((_, idx) => (
                <Box
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  sx={{
                    width: idx === activeIndex ? 14 : 8,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: idx === activeIndex ? '#22c55e' : 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
