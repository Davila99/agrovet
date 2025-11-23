import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';

// images: array of either File objects or string URLs
export default function ImageCarousel({ images = [], height = 320, thumb = false }) {
  const containerRef = useRef(null);
  const [srcs, setSrcs] = useState([]);
  // keep created object URLs in a ref so we don't revoke them while the DOM may still reference them
  const createdRef = useRef(new Map());

  useEffect(() => {
    // build stable src list: reuse previously created URLs when possible
    const next = images.map((it, idx) => {
      if (!it) return null;
      if (typeof it === 'string') return it;
      // files: look up by index key in createdRef; file identity is not guaranteed across arrays,
      // but in this app files usually come from the same File objects from the input. We fall back to creating a new URL.
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
    // do NOT revoke URLs here. Revoke only on unmount to avoid races where the DOM still tries to load old blob URLs.
    return () => {
      // no-op cleanup; revoke all on unmount below
    };
  }, [images]);

  // Revoke created object URLs once on unmount
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

  const scrollBy = (dir = 1) => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth || 300;
    el.scrollBy({ left: dir * w, behavior: 'smooth' });
  };

  if (!srcs.length) return (
    <Box sx={{ width: '100%', height, bgcolor: '#f4f6f8', borderRadius: 2 }} />
  );

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box
        ref={containerRef}
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

      {/* arrows */}
      <IconButton
        onClick={() => scrollBy(-1)}
        size="small"
        sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.4)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.55)' } }}
      >
        <ChevronLeft />
      </IconButton>
      <IconButton
        onClick={() => scrollBy(1)}
        size="small"
        sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.4)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.55)' } }}
      >
        <ChevronRight />
      </IconButton>
    </Box>
  );
}
