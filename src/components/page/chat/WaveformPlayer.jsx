import React from 'react';
import AudioWaveform from './AudioWaveform';
import AudioPlayButton from './atoms/AudioPlayButton';
import AudioTime from './atoms/AudioTime';
import useWaveform from './hooks/useWaveform';

// Reusable WaveformPlayer using wavesurfer.js (delegates logic to useWaveform hook)
export default function WaveformPlayer(props) {
  const {
    id = null,
    src,
    spectrum = [],
    height = 48,
    barWidth = 2,
    barGap = 2,
    activeColor = '#4a4a4a',
    inactiveColor = '#bdbdbd',
    cursorColor = '#00A6FF',
    onPlayStart,
    onPlayEnd,
  } = props;

  const { containerRef, playing, progress, duration, containerWidth, toggle } = useWaveform({ id, src, height, barWidth, activeColor, inactiveColor, cursorColor, onPlayStart, onPlayEnd });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <AudioPlayButton playing={playing} onToggle={toggle} ariaLabel={playing ? 'Pause' : 'Play'} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <AudioTime seconds={(duration || 0) * progress} />
        <div style={{ flex: 1, position: 'relative' }}>
          <div ref={containerRef} />
          {/* Render fallback SVG waveform on top (uses saved spectrum) - pointerEvents none so clicks pass through to wavesurfer */}
          <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
            <div style={{ width: '100%', padding: '0 12px' }}>
              {/* reserve some horizontal space for the duration label by reducing waveform width */}
              <AudioWaveform
                spectrum={Array.isArray(spectrum) && spectrum.length ? spectrum : new Array(32).fill(64)}
                width={Math.max(120, containerWidth - 80)}
                height={height}
                activeColor={activeColor}
                inactiveColor={inactiveColor}
                progress={progress}
                isPlaying={playing}
                dotted={false}
                barWidth={3}
                barGap={2}
              />
            </div>
          </div>
          {/* cursor marker (blue dot with white ring) */}
          <div style={{ position: 'absolute', left: `calc(${Math.max(0, Math.min(1, progress)) * 100}% - 7px)`, top: 0, height: height, width: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 10, background: cursorColor, border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }} />
          </div>
        </div>
        <AudioTime seconds={duration || 0} />
      </div>
    </div>
  );
}
