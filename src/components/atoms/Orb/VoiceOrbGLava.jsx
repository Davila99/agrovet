import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import "./VoiceOrb.css";

// Fragment Shader simplificado basado en GLava NCS
const particleFragmentShader = `
precision highp float;

uniform vec2 screen;
uniform float time;
uniform sampler1D audio_r;
uniform int audio_sz;

uniform vec3 color;
uniform float opacity;
uniform float particleSize;
uniform float sphereRadius;
uniform float radiusAudioMultiplier;
uniform float fractalAudioMultiplier;
uniform float octaveMultiplier;
uniform float octaveScale;
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
uniform float antiAlias;
uniform float audioRadius;
uniform float finalAudio;

varying vec2 vUv;

// Función smooth_audio simplificada
float smooth_audio(sampler1D audio, int size, float pos) {
  float index = pos * float(size - 1);
  float i0 = floor(index);
  float i1 = min(i0 + 1.0, float(size - 1));
  float t = index - i0;
  float v0 = texture(audio, i0 / float(size)).r;
  float v1 = texture(audio, i1 / float(size)).r;
  return mix(v0, v1, t);
}

// Noise functions
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
  
  vec4 g0000 = vec4(gx00.x, gy00.x, gz00.x, gw00.x);
  vec4 g1000 = vec4(gx00.y, gy00.y, gz00.y, gw00.y);
  vec4 g0100 = vec4(gx00.z, gy00.z, gz00.z, gw00.z);
  vec4 g1100 = vec4(gx00.w, gy00.w, gz00.w, gw00.w);
  vec4 g0010 = vec4(gx10.x, gy10.x, gz10.x, gw10.x);
  vec4 g1010 = vec4(gx10.y, gy10.y, gz10.y, gw10.y);
  vec4 g0110 = vec4(gx10.z, gy10.z, gz10.z, gw10.z);
  vec4 g1110 = vec4(gx10.w, gy10.w, gz10.w, gw10.w);
  vec4 g0001 = vec4(gx01.x, gy01.x, gz01.x, gw01.x);
  vec4 g1001 = vec4(gx01.y, gy01.y, gz01.y, gw01.y);
  vec4 g0101 = vec4(gx01.z, gy01.z, gz01.z, gw01.z);
  vec4 g1101 = vec4(gx01.w, gy01.w, gz01.w, gw01.w);
  vec4 g0011 = vec4(gx11.x, gy11.x, gz11.x, gw11.x);
  vec4 g1011 = vec4(gx11.y, gy11.y, gz11.y, gw11.y);
  vec4 g0111 = vec4(gx11.z, gy11.z, gz11.z, gw11.z);
  vec4 g1111 = vec4(gx11.w, gy11.w, gz11.w, gw11.w);
  
  vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));
  g0000 *= norm00.x;
  g0100 *= norm00.y;
  g1000 *= norm00.z;
  g1100 *= norm00.w;
  
  vec4 norm01 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));
  g0001 *= norm01.x;
  g0101 *= norm01.y;
  g1001 *= norm01.z;
  g1101 *= norm01.w;
  
  vec4 norm10 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));
  g0010 *= norm10.x;
  g0110 *= norm10.y;
  g1010 *= norm10.z;
  g1110 *= norm10.w;
  
  vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));
  g0011 *= norm11.x;
  g0111 *= norm11.y;
  g1011 *= norm11.z;
  g1111 *= norm11.w;
  
  float n0000 = dot(g0000, Pf0);
  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));
  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));
  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));
  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));
  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));
  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));
  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));
  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));
  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));
  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));
  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));
  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));
  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));
  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));
  float n1111 = dot(g1111, Pf1);
  
  vec4 fade_xyzw = fade(Pf0);
  vec4 n_z = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.z);
  vec4 n_yz = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.z);
  vec4 n_xyz = mix(n_z, n_yz, fade_xyzw.y);
  float n = mix(mix(n_xyz.x, n_xyz.y, fade_xyzw.x), mix(n_xyz.z, n_xyz.w, fade_xyzw.x), fade_xyzw.w);
  
  return n;
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
  return value / max(total, 0.001);
}

float fbm3(vec4 p, float disp, vec4 flow) {
  float oN = finalAudio * fractalAudioMultiplier * octaveNoise(fScale * p / max(screen.x, 1.0), flow);
  oN = clamp(oN, minVal, maxVal);
  
  if (oN >= 0.0) {
    oN = pow(max(oN, 0.001), gamma);
  } else {
    oN = -pow(max(-oN, 0.001), gamma);
  }
  
  float perlinVal = offset + noiseMultiplier * oN;
  return disp * perlinVal;
}

void main() {
  vec2 centerScreen = screen.xy * 0.5;
  float minScreen = min(screen.x, screen.y);
  vec2 uv = (gl_FragCoord.xy - centerScreen) / max(minScreen, 1.0);
  
  float radius = sphereRadius / max(minScreen, 1.0);
  radius += radiusAudioMultiplier * abs(audioRadius) / max(minScreen, 1.0);
  
  float distFromCenter = length(uv);
  
  if (distFromCenter <= radius * 1.2) {
    vec4 flow = vec4(flowX, flowY, flowZ, flowEvolution);
    vec4 p = vec4(uv * fScale, 0.0, 0.0);
    
    float noise = 0.0;
    if (!isRadialDisplacement) {
      noise = fbm3(p, displaceX, flow);
    } else {
      vec3 dir = normalize(vec3(uv, 0.0));
      noise = fbm3(p, displaceX, flow) * length(dir);
    }
    
    float sphereDist = abs(distFromCenter - radius);
    float alpha = 1.0 - smoothstep(0.0, feather * max(radius, 0.01), sphereDist);
    alpha *= opacity;
    alpha *= (1.0 + finalAudio * 0.5);
    
    vec3 finalColor = color * (1.0 + finalAudio * 0.3);
    
    gl_FragColor = vec4(finalColor, alpha);
  } else {
    gl_FragColor = vec4(0.0);
  }
}
`;

// Vertex Shader simple para pantalla completa
const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Componente de partículas
function ParticleSphere({ analyser, audioLevel, isSpeaking }) {
  const meshRef = useRef();
  const audioTextureRef = useRef(null);
  
  const uniformsRef = useRef({
    screen: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    time: { value: 0 },
    audio_sz: { value: 256 },
    audio_r: { value: null },
    audioRadius: { value: 0.0 },
    finalAudio: { value: 0.0 },
    color: { value: new THREE.Vector3(0.0, 0.95, 1.0) }, // Turquesa brillante (cyan/turquesa)
    opacity: { value: 0.2 },
    colorIntensityAddStrength: { value: 0.2 },
    particleSize: { value: 3.0 },
    sphereRadius: { value: 275.0 },
    radiusAudioMultiplier: { value: 200.0 },
    fractalAudioMultiplier: { value: 9.0 },
    fractalAudioMixing: { value: 0.5 },
    octaveMultiplier: { value: 0.25 },
    octaveScale: { value: 1.0 },
    complexity: { value: 3 },
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
    antiAlias: { value: 5.0 },
  });

  // Crear textura de audio
  useEffect(() => {
    if (!analyser) return;
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const audioData = new Float32Array(256);
    
    const updateAudio = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Normalizar datos de audio
      for (let i = 0; i < 256; i++) {
        audioData[i] = dataArray[i] / 255.0;
      }
      
      // Calcular audioRadius y finalAudio (simplificado)
      const idx1 = Math.floor(dataArray.length * 0.1);
      const idx2 = Math.floor(dataArray.length * 0.15);
      const audioRadius = Math.max(dataArray[idx1] / 255.0, dataArray[idx2] / 255.0);
      uniformsRef.current.audioRadius.value = audioRadius;
      
      // Calcular finalAudio como promedio de todas las frecuencias
      let totalSum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        totalSum += dataArray[i];
      }
      uniformsRef.current.finalAudio.value = (totalSum / dataArray.length) / 255.0 * 9.0;
      
      if (!audioTextureRef.current) {
        const textureData = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
          textureData[i] = audioData[i];
        }
        audioTextureRef.current = new THREE.DataTexture(textureData, 256, 1, THREE.RedFormat, THREE.FloatType);
        audioTextureRef.current.needsUpdate = true;
        uniformsRef.current.audio_r.value = audioTextureRef.current;
      } else {
        const textureData = audioTextureRef.current.image.data;
        for (let i = 0; i < 256; i++) {
          textureData[i] = audioData[i];
        }
        audioTextureRef.current.needsUpdate = true;
      }
      
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

  // Crear geometría de pantalla completa
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(2, 2);
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniformsRef.current}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// Componente principal
const VoiceOrbGLava = ({ analyser, isSpeaking = false, audioLevel = 0 }) => {
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        console.warn('VoiceOrbGLava: WebGL no está disponible');
        setWebglError(true);
      }
    } catch (error) {
      console.warn('VoiceOrbGLava: Error verificando WebGL:', error);
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
          preserveDrawingBuffer: false,
        }}
        dpr={[1, 2]}
        frameloop="always"
        onCreated={({ gl }) => {
          try {
            const canvas = gl.domElement;
            const handleContextLost = (event) => {
              event.preventDefault();
              console.warn('VoiceOrbGLava: WebGL context perdido');
              setWebglError(true);
            };
            const handleContextRestored = () => {
              console.log('VoiceOrbGLava: WebGL context restaurado');
              setWebglError(false);
            };
            canvas.addEventListener('webglcontextlost', handleContextLost);
            canvas.addEventListener('webglcontextrestored', handleContextRestored);
            return () => {
              canvas.removeEventListener('webglcontextlost', handleContextLost);
              canvas.removeEventListener('webglcontextrestored', handleContextRestored);
            };
          } catch (error) {
            console.warn('VoiceOrbGLava: Error configurando WebGL context handlers:', error);
          }
        }}
        onError={(error) => {
          console.warn('VoiceOrbGLava: Error en Canvas:', error);
          setWebglError(true);
        }}
      >
        <ParticleSphere analyser={analyser} audioLevel={audioLevel} isSpeaking={isSpeaking} />
      </Canvas>
    </div>
  );
};

export default VoiceOrbGLava;

