import React, { useState, useEffect, useRef } from "react";
import OrbSphere from "../atoms/OrbSphere";
import Waveform from "../atoms/Waveform";
import VoiceButton from "../molecules/VoiceButton";
import "./orbAgent.css";

const OrbAgent = () => {
  const [isListening, setIsListening] = useState(false);
  const [audioData, setAudioData] = useState(new Uint8Array(42));
  const [audioLevel, setAudioLevel] = useState(0);

  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);

  const toggleMic = async () => {
    if (!isListening) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioCtxRef.current = new AudioContext();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      sourceRef.current = audioCtxRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 128;
      analyserRef.current.smoothingTimeConstant = 0.85;

      sourceRef.current.connect(analyserRef.current);
      setIsListening(true);
    } else {
      audioCtxRef.current?.close();
      setIsListening(false);
    }
  };

  useEffect(() => {
    let frame;
    const loop = () => {
      if (isListening && analyserRef.current) {
        const buffer = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(buffer);
        const slice = buffer.slice(0, 42);
        setAudioData(slice);
        // compute audio level 0..1 for visual sync
        const avg = slice.reduce((s, v) => s + v, 0) / (slice.length * 255);
        setAudioLevel(avg);
      }
      frame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(frame);
  }, [isListening]);

  return (
    <div className="orb-agent-container">
      <OrbSphere isListening={isListening} />
      <Waveform audioData={audioData} isListening={isListening} />
      <VoiceButton isListening={isListening} onToggle={toggleMic} audioLevel={audioLevel} />
    </div>
  );
};

export default OrbAgent;
