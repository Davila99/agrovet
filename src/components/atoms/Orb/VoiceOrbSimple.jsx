import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import "./VoiceOrb.css";

// Shader simplificado pero funcional
const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform vec2 screen;
uniform float time;
uniform float audioRadius;
uniform float finalAudio;
uniform vec3 color;
uniform float opacity;
uniform float sphereRadius;
uniform float radiusAudioMultiplier;

varying vec2 vUv;
varying vec3 vPosition;

// Simple noise function
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 st) {
  float value = 0.0;
  float amplitude = 0.5;
  for(int i = 0; i < 3; i++) {
    value += amplitude * noise(st);
    st *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 center = vec2(0.5, 0.5);
  vec2 uv = vUv;
  vec2 st = (uv - center) * 2.0;
  
  float radius = sphereRadius / max(screen.x, screen.y);
  radius += radiusAudioMultiplier * abs(audioRadius) / max(screen.x, screen.y);
  
  float dist = length(st);
  
  // Crear efecto de esfera con noise
  vec2 noiseCoord = st * 3.0 + vec2(time * 0.1, time * 0.15);
  float noiseValue = fbm(noiseCoord);
  float sphereDist = abs(dist - radius);
  
  // Efecto de audio
  float audioEffect = finalAudio * 0.3;
  noiseValue += audioEffect;
  
  float alpha = 1.0 - smoothstep(0.0, 0.2, sphereDist);
  alpha *= opacity;
  alpha *= (1.0 + audioEffect * 0.3);
  alpha = clamp(alpha, 0.3, 1.0); // Asegurar visibilidad mínima
  
  // Color con efecto de audio
  vec3 finalColor = color * (1.0 + audioEffect * 0.5);
  finalColor += color * noiseValue * 0.3;
  finalColor = clamp(finalColor, vec3(0.0), vec3(1.5)); // Limitar brillo
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

function SimpleOrb({ analyser, audioLevel, isSpeaking }) {
  const meshRef = useRef();
  
  const uniformsRef = useRef({
    screen: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    time: { value: 0 },
    audioRadius: { value: 0.0 },
    finalAudio: { value: 0.0 },
    color: { value: new THREE.Vector3(0.0, 0.95, 1.0) }, // Turquesa brillante
    opacity: { value: 0.8 }, // Aumentado para mejor visibilidad
    sphereRadius: { value: 0.3 }, // Reducido para mejor visualización
    radiusAudioMultiplier: { value: 0.1 },
  });

  // Actualizar audio
  useEffect(() => {
    if (!analyser) {
      uniformsRef.current.audioRadius.value = 0;
      uniformsRef.current.finalAudio.value = 0;
      return;
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const updateAudio = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Calcular audioRadius
      const idx1 = Math.floor(dataArray.length * 0.1);
      const idx2 = Math.floor(dataArray.length * 0.15);
      const audioRadius = Math.max(dataArray[idx1] / 255.0, dataArray[idx2] / 255.0);
      uniformsRef.current.audioRadius.value = audioRadius;
      
      // Calcular finalAudio
      let totalSum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        totalSum += dataArray[i];
      }
      uniformsRef.current.finalAudio.value = (totalSum / dataArray.length) / 255.0;
      
      requestAnimationFrame(updateAudio);
    };
    
    updateAudio();
  }, [analyser]);

  // Actualizar screen size
  useEffect(() => {
    const handleResize = () => {
      uniformsRef.current.screen.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animar tiempo
  useFrame((state) => {
    if (meshRef.current) {
      uniformsRef.current.time.value = state.clock.elapsedTime;
    }
  });

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(2, 2);
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniformsRef.current}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

const VoiceOrbSimple = ({ analyser, isSpeaking = false, audioLevel = 0 }) => {
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        console.warn('VoiceOrbSimple: WebGL no está disponible');
        setWebglError(true);
      }
    } catch (error) {
      console.warn('VoiceOrbSimple: Error verificando WebGL:', error);
      setWebglError(true);
    }
  }, []);

  if (webglError) {
    return (
      <div className="voice-orb-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#666', fontSize: '12px' }}>WebGL no disponible</div>
      </div>
    );
  }

  return (
    <div className="voice-orb-container" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 2]}
        frameloop="always"
        onError={(error) => {
          console.warn('VoiceOrbSimple: Error en Canvas:', error);
          setWebglError(true);
        }}
      >
        <SimpleOrb analyser={analyser} audioLevel={audioLevel} isSpeaking={isSpeaking} />
      </Canvas>
    </div>
  );
};

export default VoiceOrbSimple;

