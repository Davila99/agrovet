import React, { useEffect, useRef } from "react";
import "./waveform.css";

// Smooth waveform: interpolate heights toward target values to avoid jumps
const lerp = (a, b, t) => a + (b - a) * t;

const Waveform = ({ audioData = null, isListening = false, barCount = 42 }) => {
  const barsRef = useRef([]);
  const heightsRef = useRef(new Array(barCount).fill(12));

  useEffect(() => {
    let raf = null;

    const step = () => {
      for (let i = 0; i < barCount; i++) {
        const el = barsRef.current[i];
        if (!el) continue;
        let target = 12;
        if (isListening && audioData && audioData.length > i) {
          // map 0-255 to 8-60 non-linearly
          const v = audioData[i];
          target = 8 + Math.pow(v / 255, 0.9) * 56; // non-linear mapping
        } else {
          // idle sine pattern
          const t = (performance.now() / 900) + i * 0.12;
          target = 10 + (Math.sin(t) * 6 + Math.cos(t * 0.7) * 3);
        }

        // smooth lerp towards target
        heightsRef.current[i] = lerp(heightsRef.current[i], target, 0.18);
        el.style.height = `${Math.max(4, heightsRef.current[i])}px`;
        // subtle glow based on height
        const glow = Math.min(1, heightsRef.current[i] / 60);
        el.style.boxShadow = `0 4px 10px rgba(30,200,220,${0.06 + glow * 0.14})`;
        el.style.opacity = `${0.7 + glow * 0.3}`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [audioData, isListening, barCount]);

  return (
    <div className="wave-container">
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className="wave-bar"
          ref={(el) => (barsRef.current[i] = el)}
          style={{ "--i": i }}
        />
      ))}
    </div>
  );
};

export default Waveform;