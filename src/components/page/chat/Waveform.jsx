import React from 'react';
import { Box } from '@mui/material';

export default function Waveform({ waveformData = [], progress = 0, barWidth = 2, barGap = 2, waveHeight = 28, playedColor = '#3A3A3A', idleColor = '#BDBDBD' }) {
  const bars = Array.isArray(waveformData) && waveformData.length ? waveformData.slice() : new Array(24).fill(64);
  const bins = Math.max(4, Math.min(64, bars.length));
  const displayed = bars.slice(0, bins);
  const maxVal = Math.max(...displayed.map((n) => Number(n) || 0), 1);
  const scaled = displayed.map((n) => Math.round(((Number(n) || 0) / maxVal) * 255));
  const waveformWidth = Math.max(120, Math.min(420, bins * (barWidth + barGap)));
  const playedCount = Math.floor((progress || 0) * bins);

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: waveformWidth, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0 }}>
      <svg width="100%" height={waveHeight} viewBox={`0 0 ${bins * (barWidth + barGap)} ${waveHeight}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        {scaled.map((v, i) => {
          const h = Math.max(3, Math.round((v / 255) * (waveHeight * 0.9)));
          const x = i * (barWidth + barGap);
          const y = waveHeight - h;
          const isPlayed = i < playedCount;
          const fill = isPlayed ? playedColor : idleColor;
          const opacity = isPlayed ? 1 : 0.95;
          return (
            <rect key={i} x={x} y={y} width={barWidth} height={h} rx={1} fill={fill} opacity={opacity} style={{ transition: 'fill 140ms linear, height 140ms linear, opacity 140ms linear' }} />
          );
        })}
      </svg>

      <Box sx={{ position: 'absolute', left: `calc(${Math.max(0, Math.min(1, progress || 0)) * 100}% - 6px)`, top: (waveHeight / 2) - 6, width: 12, height: 12, borderRadius: '50%', background: '#00A6FF', border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', pointerEvents: 'none', transition: 'left 120ms linear' }} />
    </Box>
  );
}










