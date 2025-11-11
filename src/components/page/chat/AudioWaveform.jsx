import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';

export default function AudioWaveform({ spectrum = [], width = 120, height = 36, color = '#9e9e9e', progress = 0, activeColor = '#3a3a3a', inactiveColor = '#bdbdbd', dotted = false, isPlaying = false, barWidth: propBarWidth = 3, barGap: propBarGap = 2 }) {
  // Normalize spectrum to an array of numbers 0-255
  const data = Array.isArray(spectrum) ? spectrum.slice() : [];
  const maxBins = Math.max(4, Math.min(64, data.length || 24));
  const bins = data.length ? Math.min(maxBins, data.length) : maxBins;
  const displayed = data.length ? data.slice(0, bins) : new Array(bins).fill(64);

  // If the recorded spectrum uses small absolute values (e.g. 0-5), scale it
  // proportionally so that the visual waveform remains visible. We scale to
  // a 0-255 range while preserving relative peaks.
  let scaled = displayed.slice();
  try {
    const maxVal = Math.max(...scaled.map((n) => Number(n) || 0), 1);
    if (maxVal > 0 && maxVal !== 255) {
      const factor = 255 / maxVal;
      scaled = scaled.map((n) => Math.round((Number(n) || 0) * factor));
    }
  } catch (e) {
    scaled = displayed.slice();
  }
  // Debug: log scaled spectrum in development to help trace rendering issues
  try {
    if (typeof window !== 'undefined' && (window.location && window.location.hostname === 'localhost')) {
      // limit output length
      const preview = scaled.slice(0, 64);
      // eslint-disable-next-line no-console
  // audio waveform render (debug suppressed)
    }
  } catch (e) {}

  // Auto-detect parent background luminance to select contrasting colors so
  // waveform bars remain visible both on light and dark message bubbles
  const containerRef = useRef(null);
  const [derived, setDerived] = useState({ active: activeColor, inactive: inactiveColor, stroke: 'rgba(0,0,0,0.06)' });

  useEffect(() => {
    // Prefer using provided activeColor/inactiveColor. Keep a subtle stroke
    // for visual separation. When playing, slightly darken the inactive
    // bars so the whole spectrum reads as a darker grey while playback occurs.
    try {
      const stroke = 'rgba(0,0,0,0.06)';
      if (isPlaying) {
        // darken unplayed bars while playing
        const playingInactive = '#6b6b6b';
        setDerived({ active: activeColor, inactive: playingInactive, stroke });
      } else {
        setDerived({ active: activeColor, inactive: inactiveColor, stroke });
      }
    } catch (e) {
      // ignore
    }
  }, [activeColor, inactiveColor, isPlaying]);

  // thin bars with a little horizontal breathing room (WhatsApp-like)
  // prefer very narrow bars (1px) with a small gap so the waveform reads as fine vertical strokes
  const gap = typeof propBarGap === 'number' ? propBarGap : (dotted ? 4 : 2);
  // Compute desired bar width trying to respect provided propBarWidth but
  // ensuring bars fit within the available width. propBarWidth is preferred.
  const maxPossibleBar = Math.max(1, Math.floor((width - (bins - 1) * gap) / bins));
  const barWidth = Math.max(1, Math.min(maxPossibleBar, Math.round(propBarWidth)));

  // clamp function
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  return (
    <Box ref={containerRef} sx={{ display: 'inline-block', width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {scaled.map((v, i) => {
          const norm = Number(v) || 0;
          // map 0-255 to min 2px - max approx 55% of container height so bars look shorter like WhatsApp
          const maxH = Math.max(4, Math.round(height * 0.55));
          const h = clamp(Math.round((norm / 255) * maxH), 2, maxH);
          const x = i * (barWidth + gap);
          const y = height - h;
          // Decide fill color based on progress. Use index-based fill to avoid
          // pixel rounding issues: compute how many bars should be considered
          // "played" and color those with active color.
          const clampedProgress = clamp(progress || 0, 0, 1);
          const playedCount = Math.floor(clampedProgress * bins);
          const fillColor = i < playedCount ? derived.active : derived.inactive;
          // Add a smooth transition so bars animate when progress changes or when playback toggles
          const transitionStyle = 'height 120ms linear, y 120ms linear, fill 120ms linear, opacity 120ms linear, transform 120ms linear';
          const barOpacity = isPlaying ? 1 : 0.95;
          const computedFill = fillColor;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx={Math.max(1, barWidth / 2)}
              ry={Math.max(1, barWidth / 2)}
              fill={computedFill}
              stroke={derived.stroke}
              strokeWidth={0.4}
              style={{ transition: transitionStyle, opacity: barOpacity, transformOrigin: 'center bottom' }}
            />
          );
        })}
      </svg>
    </Box>
  );
}
