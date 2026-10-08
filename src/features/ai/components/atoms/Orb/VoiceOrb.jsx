import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import "./VoiceOrb.css";

// Vertex Shader - Adaptado del código GLSL original
const vertexShader = `
  uniform float time;
  uniform vec2 screen;
  uniform float audioRadius;
  uniform float audioFractal1;
  uniform float audioFractal2;
  uniform float audioFractal3;
  uniform float audioFractal4;
  uniform float audioFractal5;
  uniform float audioFractal6;
  uniform float audioFractal7;
  uniform float audioFractal8;
  uniform float finalAudio;
  
  uniform float sphereRadius;
  uniform float radiusAudioMultiplier;
  uniform float fractalAudioMultiplier;
  uniform float fractalAudioMixing;
  uniform float octaveMultiplier;
  uniform float octaveScale;
  uniform float complexity;
  uniform float fScale;
  uniform float gamma;
  uniform float minVal;
  uniform float maxVal;
  uniform float offset;
  uniform float noiseMultiplier;
  uniform bool isRadialDisplacement;
  uniform float displaceX;
  uniform float displaceY;
  uniform float displaceZ;
  uniform float flowX;
  uniform float flowY;
  uniform float flowZ;
  uniform float flowEvolution;
  uniform float feather;
  
  attribute float audioIndex;
  
  varying vec3 vPosition;
  varying float vDepth;
  
  // Noise functions del código GLSL original
  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
  }
  
  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }
  
  vec4 fade(vec4 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }
  
  float cnoise(vec4 P, vec4 rep) {
    vec4 Pi0 = mod(floor(P), rep);
    vec4 Pi1 = mod(Pi0 + vec4(1.0), rep);
    vec4 Pf0 = fract(P);
    vec4 Pf1 = Pf0 - vec4(1.0);
    
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = vec4(Pi0.zzzz);
    vec4 iz1 = vec4(Pi1.zzzz);
    vec4 iw0 = vec4(Pi0.wwww);
    vec4 iw1 = vec4(Pi1.wwww);
    
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    vec4 ixy00 = permute(ixy0 + iw0);
    vec4 ixy01 = permute(ixy0 + iw1);
    vec4 ixy10 = permute(ixy1 + iw0);
    vec4 ixy11 = permute(ixy1 + iw1);
    
    vec4 gx00 = ixy00 / 7.0;
    vec4 gy00 = floor(gx00) / 7.0;
    vec4 gz00 = floor(gy00) / 6.0;
    gx00 = fract(gx00) - 0.5;
    gy00 = fract(gy00) - 0.5;
    gz00 = fract(gz00) - 0.5;
    vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);
    vec4 sw00 = step(gw00, vec4(0.0));
    gx00 -= sw00 * (step(0.0, gx00) - 0.5);
    gy00 -= sw00 * (step(0.0, gy00) - 0.5);
    
    vec4 gx01 = ixy01 / 7.0;
    vec4 gy01 = floor(gx01) / 7.0;
    vec4 gz01 = floor(gy01) / 6.0;
    gx01 = fract(gx01) - 0.5;
    gy01 = fract(gy01) - 0.5;
    gz01 = fract(gz01) - 0.5;
    vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);
    vec4 sw01 = step(gw01, vec4(0.0));
    gx01 -= sw01 * (step(0.0, gx01) - 0.5);
    gy01 -= sw01 * (step(0.0, gy01) - 0.5);
    
    vec4 gx10 = ixy10 / 7.0;
    vec4 gy10 = floor(gx10) / 7.0;
    vec4 gz10 = floor(gy10) / 6.0;
    gx10 = fract(gx10) - 0.5;
    gy10 = fract(gy10) - 0.5;
    gz10 = fract(gz10) - 0.5;
    vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);
    vec4 sw10 = step(gw10, vec4(0.0));
    gx10 -= sw10 * (step(0.0, gx10) - 0.5);
    gy10 -= sw10 * (step(0.0, gy10) - 0.5);
    
    vec4 gx11 = ixy11 / 7.0;
    vec4 gy11 = floor(gx11) / 7.0;
    vec4 gz11 = floor(gy11) / 6.0;
    gx11 = fract(gx11) - 0.5;
    gy11 = fract(gy11) - 0.5;
    gz11 = fract(gz11) - 0.5;
    vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);
    vec4 sw11 = step(gw11, vec4(0.0));
    gx11 -= sw11 * (step(0.0, gx11) - 0.5);
    gy11 -= sw11 * (step(0.0, gy11) - 0.5);
    
    float n0000 = dot(gx00, Pf0) + dot(gy00, vec4(Pf0.y, Pf0.x, Pf0.z, Pf0.w));
    float n1000 = dot(gx10, Pf1) + dot(gy10, vec4(Pf1.y, Pf1.x, Pf1.z, Pf1.w));
    float n0100 = dot(gx01, Pf0) + dot(gy01, vec4(Pf0.y, Pf0.x, Pf0.z, Pf0.w));
    float n1100 = dot(gx11, Pf1) + dot(gy11, vec4(Pf1.y, Pf1.x, Pf1.z, Pf1.w));
    
    float n0001 = dot(gx00, Pf0) + dot(gy00, vec4(Pf0.y, Pf0.x, Pf0.z, Pf0.w));
    float n1001 = dot(gx10, Pf1) + dot(gy10, vec4(Pf1.y, Pf1.x, Pf1.z, Pf1.w));
    float n0101 = dot(gx01, Pf0) + dot(gy01, vec4(Pf0.y, Pf0.x, Pf0.z, Pf0.w));
    float n1101 = dot(gx11, Pf1) + dot(gy11, vec4(Pf1.y, Pf1.x, Pf1.z, Pf1.w));
    
    vec4 fade_xyzw = fade(Pf0);
    float n_xyzw = mix(mix(n0000, n1000, fade_xyzw.x), mix(n0100, n1100, fade_xyzw.x), fade_xyzw.y);
    float n_xyzw2 = mix(mix(n0001, n1001, fade_xyzw.x), mix(n0101, n1101, fade_xyzw.x), fade_xyzw.y);
    
    return mix(n_xyzw, n_xyzw2, fade_xyzw.z);
  }
  
  float octaveNoise(vec4 p, vec4 flow) {
    float total = 0.0;
    float frequency = 1.0;
    float amplitude = 1.0;
    float value = 0.0;
    
    for(int i = 0; i < 3; i++) {
      vec4 rep = vec4(289.0);
      value += cnoise((p + flow * time) * frequency, rep) * amplitude;
      total += amplitude;
      amplitude *= octaveMultiplier;
      frequency *= octaveScale;
    }
    return value / total;
  }
  
  float fbm3(vec4 p, float disp, vec4 flow) {
    float oN = finalAudio * fractalAudioMultiplier * octaveNoise(fScale * p / screen.x, flow);
    oN = clamp(oN, minVal, maxVal);
    
    if (oN >= 0.0) {
      oN = pow(oN, gamma);
    } else {
      oN = -pow(-oN, gamma);
    }
    
    float perlinVal = offset + noiseMultiplier * oN;
    return disp * perlinVal;
  }
  
  void main() {
    vPosition = position;
    
    vec3 particleCoords = position;
    vec4 old = vec4(particleCoords, 0.0);
    
    // Flow vector
    vec4 flow = vec4(flowX, flowY, flowZ, flowEvolution);
    
    // Displacement basado en audio fractal
    if (isRadialDisplacement) {
      vec3 centerCoords = vec3(0.0);
      vec3 distanceVectorFromCenter = particleCoords - centerCoords;
      particleCoords += fbm3(old.xyzw, displaceX, flow) * normalize(distanceVectorFromCenter);
    } else {
      particleCoords.xyz += vec3(
        fbm3(old.xyzw, displaceX, flow),
        fbm3(old.yzxw, displaceY, flow),
        fbm3(old.zxyw, displaceZ, flow)
      );
    }
    
    // Audio radius modulation
    float radius = sphereRadius;
    radius += radiusAudioMultiplier * abs(audioRadius);
    
    // Ensure sphere shape with feather
    vec3 centerCoords2 = vec3(0.0);
    vec3 distanceVectorFromCenter2 = particleCoords - centerCoords2;
    float distFromCenter = length(distanceVectorFromCenter2);
    
    if (distFromCenter <= radius) {
      vec3 newPos = centerCoords2 + radius * normalize(distanceVectorFromCenter2);
      float diff = length(newPos - particleCoords);
      float blurSize = 5.0 / screen.y;
      diff *= clamp(smoothstep(0.0, feather * radius, diff) + blurSize, blurSize, 1.0 + blurSize);
      particleCoords += diff * normalize(distanceVectorFromCenter2);
    }
    
    vDepth = length(particleCoords);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(particleCoords, 1.0);
    gl_PointSize = 3.0 * (1.0 + finalAudio * 0.5);
  }
`;

// Fragment Shader - Adaptado del código GLSL original
const fragmentShader = `
  uniform vec3 color;
  uniform float opacity;
  uniform float colorIntensityAddStrength;
  uniform float particleSize;
  uniform float audioLevel;
  
  varying vec3 vPosition;
  varying float vDepth;
  
  void main() {
    // Base color del código original: vec3(0.0118, 0.1412, 0.3412)
    vec3 baseColor = color;
    
    // Calcular distancia desde el centro del punto
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    // Forma circular suave con anti-aliasing
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    // Audio intensity affects color
    float intensity = 1.0 + audioLevel * colorIntensityAddStrength;
    vec3 finalColor = baseColor * intensity;
    
    // Glow effect basado en audio
    float glow = 0.5 + audioLevel * 0.5;
    finalColor += baseColor * glow * 0.5;
    
    // Opacity with audio modulation
    float finalOpacity = opacity * alpha * (1.0 + audioLevel * 0.3);
    
    gl_FragColor = vec4(finalColor, finalOpacity);
  }
`;

// Componente de partículas de la esfera
function AudioSphere({ analyser, audioLevel, isSpeaking }) {
  const meshRef = useRef();
  
  const uniformsRef = useRef({
    time: { value: 0 },
    screen: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    audioRadius: { value: 0 },
    audioFractal1: { value: 0 },
    audioFractal2: { value: 0 },
    audioFractal3: { value: 0 },
    audioFractal4: { value: 0 },
    audioFractal5: { value: 0 },
    audioFractal6: { value: 0 },
    audioFractal7: { value: 0 },
    audioFractal8: { value: 0 },
    finalAudio: { value: 0 },
    sphereRadius: { value: 275.0 },
    radiusAudioMultiplier: { value: 200.0 },
    fractalAudioMultiplier: { value: 9.0 },
    fractalAudioMixing: { value: 0.5 },
    octaveMultiplier: { value: 0.25 },
    octaveScale: { value: 1.0 },
    complexity: { value: 3.0 },
    fScale: { value: 4.6 },
    gamma: { value: 1.0 },
    minVal: { value: -5.0 },
    maxVal: { value: 5.0 },
    offset: { value: 0.0 },
    noiseMultiplier: { value: 1.0 },
    isRadialDisplacement: { value: false },
    displaceX: { value: 110.0 },
    displaceY: { value: 95.0 },
    displaceZ: { value: 115.0 },
    flowX: { value: 0.0 },
    flowY: { value: 0.033 },
    flowZ: { value: 0.0 },
    flowEvolution: { value: 0.015 },
    feather: { value: 0.45 },
    color: { value: new THREE.Vector3(0.0118, 0.1412, 0.3412) },
    opacity: { value: 0.05 },
    colorIntensityAddStrength: { value: 0.2 },
    particleSize: { value: 3.0 },
    audioLevel: { value: 0 },
  });

  // Crear geometría de partículas en esfera
  const { positions, audioIndices } = useMemo(() => {
    const count = 15000; // Más partículas para mejor densidad
    const positions = new Float32Array(count * 3);
    const audioIndices = new Float32Array(count);
    const radius = 275;
    
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      audioIndices[i] = i / count;
    }
    
    return { positions, audioIndices };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('audioIndex', new THREE.BufferAttribute(audioIndices, 1));
    return geo;
  }, [positions, audioIndices]);

  // Actualizar audio data según el código GLSL original
  useEffect(() => {
    if (!analyser) {
      // Reset audio values when no analyser
      uniformsRef.current.audioRadius.value = 0;
      uniformsRef.current.finalAudio.value = 0;
      for (let i = 1; i <= 8; i++) {
        uniformsRef.current[`audioFractal${i}`].value = 0;
      }
      return;
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const updateAudio = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Calcular audioRadius (bajas frecuencias) - como en el código original
      // max(smooth_audio(audio_r, audio_sz, 0.1), smooth_audio(audio_r, audio_sz, 0.15))
      const idx1 = Math.floor(dataArray.length * 0.1);
      const idx2 = Math.floor(dataArray.length * 0.15);
      const audioRadius = Math.max(
        dataArray[idx1] / 255.0,
        dataArray[idx2] / 255.0
      );
      uniformsRef.current.audioRadius.value = audioRadius;
      
      // Calcular fractales de audio según el código original
      const bands = [
        { start: 0.2, end: 0.25 },
        { start: 0.3, end: 0.35 },
        { start: 0.4, end: 0.45 },
        { start: 0.5, end: 0.55 },
        { start: 0.6, end: 0.65 },
        { start: 0.7, end: 0.75 },
        { start: 0.8, end: 0.85 },
        { start: 0.9, end: 0.95 },
      ];
      
      bands.forEach((band, index) => {
        // max(smooth_audio(audio_r, audio_sz, start), smooth_audio(audio_r, audio_sz, end))
        const startIdx = Math.floor(dataArray.length * band.start);
        const endIdx = Math.floor(dataArray.length * band.end);
        const value = Math.max(
          dataArray[startIdx] / 255.0,
          dataArray[endIdx] / 255.0
        );
        uniformsRef.current[`audioFractal${index + 1}`].value = value;
      });
      
      // Final audio - promedio de todas las frecuencias
      let totalSum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        totalSum += dataArray[i];
      }
      uniformsRef.current.finalAudio.value = (totalSum / dataArray.length) / 255.0;
      
      // Actualizar audioLevel para pulsación cuando la IA habla
      uniformsRef.current.audioLevel.value = isSpeaking ? audioLevel : 0;
      
      requestAnimationFrame(updateAudio);
    };
    
    updateAudio();
  }, [analyser, audioLevel, isSpeaking]);

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

  // Validar que los uniforms estén correctamente inicializados
  useEffect(() => {
    if (!uniformsRef.current) {
      console.warn('VoiceOrb: Uniforms no inicializados');
      return;
    }
    // Validar que todos los uniforms requeridos existan
    const requiredUniforms = ['time', 'screen', 'color', 'opacity'];
    const missingUniforms = requiredUniforms.filter(u => !uniformsRef.current[u]);
    if (missingUniforms.length > 0) {
      console.warn('VoiceOrb: Uniforms faltantes:', missingUniforms);
    }
  }, []);

  // Validar que el geometry esté correctamente inicializado
  if (!geometry || !geometry.attributes || !geometry.attributes.position) {
    console.warn('VoiceOrb: Geometry no inicializado correctamente');
    return null;
  }

  return (
    <points ref={meshRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniformsRef.current}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        onError={(error) => {
          console.warn('VoiceOrb: Error en shader material:', error);
        }}
      />
    </points>
  );
}

// Componente principal
const VoiceOrb = ({ analyser, isSpeaking = false, audioLevel = 0 }) => {
  const [webglError, setWebglError] = useState(false);

  // Verificar soporte de WebGL
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        console.warn('VoiceOrb: WebGL no está disponible');
        setWebglError(true);
      }
    } catch (error) {
      console.warn('VoiceOrb: Error verificando WebGL:', error);
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
        camera={{ position: [0, 0, 600], fov: 50 }}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
        }}
        dpr={[1, 2]}
        frameloop="always"
        onCreated={({ gl }) => {
          // Manejar errores de WebGL
          // En react-three/fiber, gl es el renderer, el contexto ya está creado
          try {
            const canvas = gl.domElement;
            
            // El contexto ya está creado por react-three/fiber, solo agregamos listeners
            const handleContextLost = (event) => {
              event.preventDefault();
              console.warn('VoiceOrb: WebGL context perdido');
              setWebglError(true);
            };
            
            const handleContextRestored = () => {
              console.log('VoiceOrb: WebGL context restaurado');
              setWebglError(false);
            };
            
            canvas.addEventListener('webglcontextlost', handleContextLost);
            canvas.addEventListener('webglcontextrestored', handleContextRestored);
            
            // Cleanup
            return () => {
              canvas.removeEventListener('webglcontextlost', handleContextLost);
              canvas.removeEventListener('webglcontextrestored', handleContextRestored);
            };
          } catch (error) {
            console.warn('VoiceOrb: Error configurando WebGL context handlers:', error);
          }
        }}
        onError={(error) => {
          console.warn('VoiceOrb: Error en Canvas:', error);
          setWebglError(true);
        }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <AudioSphere analyser={analyser} audioLevel={audioLevel} isSpeaking={isSpeaking} />
      </Canvas>
    </div>
  );
};

export default VoiceOrb;
