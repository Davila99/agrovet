import React from "react";
import "./voiceButton.css";

const VoiceButton = ({ isListening = false, onToggle, audioLevel = 0 }) => {
  // audioLevel expected 0..1
  const scale = 1 + Math.min(0.18, audioLevel * 0.18);
  const glow = Math.min(1, audioLevel * 1.6);
  const style = {
    transform: `scale(${scale})`,
    boxShadow: isListening
      ? `0 6px 24px rgba(0,215,200,${0.16 + glow * 0.5}), 0 0 60px rgba(110,242,229,${0.06 + glow * 0.6})`
      : undefined,
  };

  return (
    <button
      className={`mic-btn ${isListening ? "active" : ""}`}
      onClick={onToggle}
      aria-pressed={isListening}
      style={style}
    >
      <span className="mic-emoji" aria-hidden>🎤</span>
    </button>
  );
};

export default VoiceButton;
