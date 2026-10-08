import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import "./VoiceOrb.css";

// Código exacto del repositorio NCS Spectrum GLava adaptado a WebGL
// ncs.glsl - Parámetros exactos del repositorio
const NCS_PARAMS = `
//1. Particle size and number
#define numParticles ivec2(screen.xy)
#define particleSize 3

//2. Particle Color, Opacity and Glow
#define color vec3(0.0118, 0.1412, 0.3412)
#define opacity 0.05
#define colorIntensityAddStrength 0.2
#define antiAlias 5.0
#define glowSize 10.0
#define glowIntensity 0.5
#define glowDirections 16.0
#define glowQuality 6.0
#define glowColor color

//3. Audio Influence
#define radiusAudioMultiplier 200.0
#define fractalAudioMixing 0.50
#define fractalAudioMultiplier 9.0

//4. Fractal Field Controls
#define octaveMultiplier 0.25
#define octaveScale 1.0
#define complexity 3
#define fScale 4.6
#define gamma 1.0
#define minVal -5.0
#define maxVal 5.0
#define offset 0.0
#define noiseMultiplier 1.0

//5. Displacement and Flow Controls
#define isRadialDisplacement false
#define displaceX 110.0
#define displaceY 95.0
#define displaceZ 115.0
#define flowX 0.0
#define flowY 0.033
#define flowZ 0.0
#define flowEvolution 0.015

//6. Sphere Controls
#define sphereRadius 275.0
#define feather 0.45
`;

// Fragment shader 1: Cálculo de posiciones de partículas (adaptado sin imageAtomicAdd)
const fragmentShader1 = `
precision highp float;

uniform vec2 screen;
uniform float time;
uniform int audio_sz;
uniform sampler2D audioTexture;
uniform float fractalAudioMultiplier;
uniform float fractalAudioMixing;
uniform float radiusAudioMultiplier;
uniform float particleSize;
uniform float sphereRadius;
uniform float feather;
uniform float antiAlias;
uniform bool isRadialDisplacement;
uniform float displaceX;
uniform float displaceY;
uniform float displaceZ;
uniform float flowX;
uniform float flowY;
uniform float flowZ;
uniform float flowEvolution;
uniform float fScale;
uniform float octaveMultiplier;
uniform float octaveScale;
uniform int complexity;
uniform float gamma;
uniform float minVal;
uniform float maxVal;
uniform float offset;
uniform float noiseMultiplier;

varying vec2 vUv;
varying vec3 vPosition;

${NCS_PARAMS}

// Función smooth_audio adaptada
float smooth_audio(sampler2D audioTex, int audio_sz, float index) {
  float normalizedIndex = index;
  return texture2D(audioTex, vec2(normalizedIndex, 0.5)).r;
}

// Funciones de noise exactas del repositorio
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
  vec4 Pi1 = mod(Pi0 + 1.0, rep);
  vec4 Pf0 = fract(P);
  vec4 Pf1 = Pf0 - 1.0;
  
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
  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);
  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);
  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);
  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);
  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);
  return 2.2 * n_xyzw;
}

float setAudio(sampler2D audioTex, int audio_sz) {
  float audioRadius = max(smooth_audio(audioTex, audio_sz, 0.1), smooth_audio(audioTex, audio_sz, 0.15));
  float audioFractal1 = max(smooth_audio(audioTex, audio_sz, 0.2), smooth_audio(audioTex, audio_sz, 0.25));
  float audioFractal2 = max(smooth_audio(audioTex, audio_sz, 0.3), smooth_audio(audioTex, audio_sz, 0.35));
  float audioFractal3 = max(smooth_audio(audioTex, audio_sz, 0.4), smooth_audio(audioTex, audio_sz, 0.45));
  float audioFractal4 = max(smooth_audio(audioTex, audio_sz, 0.5), smooth_audio(audioTex, audio_sz, 0.55));
  float audioFractal5 = max(smooth_audio(audioTex, audio_sz, 0.6), smooth_audio(audioTex, audio_sz, 0.65));
  float audioFractal6 = max(smooth_audio(audioTex, audio_sz, 0.7), smooth_audio(audioTex, audio_sz, 0.75));
  float audioFractal7 = max(smooth_audio(audioTex, audio_sz, 0.8), smooth_audio(audioTex, audio_sz, 0.85));
  float audioFractal8 = max(smooth_audio(audioTex, audio_sz, 0.9), smooth_audio(audioTex, audio_sz, 0.95));
  
  float audios[8];
  audios[0] = audioFractal1;
  audios[1] = audioFractal2;
  audios[2] = audioFractal3;
  audios[3] = audioFractal4;
  audios[4] = audioFractal5;
  audios[5] = audioFractal6;
  audios[6] = audioFractal7;
  audios[7] = audioFractal8;
  
  // Ordenamiento exacto del código original
  float temp;
  temp = max(audios[0], audios[2]);
  audios[0] = min(audios[0], audios[2]);
  audios[2] = temp;
  
  temp = max(audios[1], audios[3]);
  audios[1] = min(audios[1], audios[3]);
  audios[3] = temp;
  
  temp = max(audios[4], audios[6]);
  audios[4] = min(audios[4], audios[6]);
  audios[6] = temp;
  
  temp = max(audios[5], audios[7]);
  audios[5] = min(audios[5], audios[7]);
  audios[7] = temp;
  
  temp = max(audios[0], audios[4]);
  audios[0] = min(audios[0], audios[4]);
  audios[4] = temp;
  
  temp = max(audios[1], audios[5]);
  audios[1] = min(audios[1], audios[5]);
  audios[5] = temp;
  
  temp = max(audios[2], audios[6]);
  audios[2] = min(audios[2], audios[6]);
  audios[6] = temp;
  
  temp = max(audios[3], audios[7]);
  audios[3] = min(audios[3], audios[7]);
  audios[7] = temp;
  
  temp = max(audios[0], audios[1]);
  audios[0] = min(audios[0], audios[1]);
  audios[1] = temp;
  
  temp = max(audios[2], audios[3]);
  audios[2] = min(audios[2], audios[3]);
  audios[3] = temp;
  
  temp = max(audios[4], audios[5]);
  audios[4] = min(audios[4], audios[5]);
  audios[5] = temp;
  
  temp = max(audios[6], audios[7]);
  audios[6] = min(audios[6], audios[7]);
  audios[7] = temp;
  
  temp = max(audios[2], audios[4]);
  audios[2] = min(audios[2], audios[4]);
  audios[4] = temp;
  
  temp = max(audios[3], audios[5]);
  audios[3] = min(audios[3], audios[5]);
  audios[5] = temp;
  
  temp = max(audios[1], audios[4]);
  audios[1] = min(audios[1], audios[4]);
  audios[4] = temp;
  
  temp = max(audios[3], audios[6]);
  audios[3] = min(audios[3], audios[6]);
  audios[6] = temp;
  
  temp = max(audios[1], audios[2]);
  audios[1] = min(audios[1], audios[2]);
  audios[2] = temp;
  
  temp = max(audios[3], audios[4]);
  audios[3] = min(audios[3], audios[4]);
  audios[4] = temp;
  
  temp = max(audios[5], audios[6]);
  audios[5] = min(audios[5], audios[6]);
  audios[6] = temp;
  
  float finalAudio = fractalAudioMultiplier * mix(
    mix(audios[7] * audios[6] - audios[1] * audios[0], audios[7] * audios[6], audios[5]),
    mix(audios[6] * mix(audios[7] - audios[0], audios[6] - audios[3], audios[7] * audios[6]) - pow(audios[1] * audios[0], 1.05), audios[7] * audios[6], audios[5] * audios[4]),
    fractalAudioMixing
  );
  
  return finalAudio;
}

float octaveNoise(vec4 p, vec4 flow) {
  float total = 0.0;
  float frequency = 1.0;
  float amplitude = 1.0;
  float value = 0.0;
  
  for(int i = 0; i < complexity; i += 1) {
    value += (cnoise(vec4((p + flow * time) * frequency), vec4(0.0))) * amplitude;
    total += amplitude;
    amplitude *= octaveMultiplier;
    frequency *= octaveScale;
  }
  return value / total;
}

float fbm3(vec4 p, float disp, vec4 flow, float finalAudio) {
  float perlinVal = 0.0;
  float oN = finalAudio * (octaveNoise(fScale * (p - vec4(screen.x / 2.0, screen.y / 2.0, 0.0, 0.0)) / screen.x, flow));
  
  oN = clamp(oN, minVal, maxVal);
  
  if (oN >= 0.0)
    oN = pow(oN, gamma);
  else if (oN < 0.0)
    oN = -pow(-oN, gamma);
  
  perlinVal = offset + noiseMultiplier * oN;
  return disp * perlinVal;
}

void main() {
  // Convertir UV a coordenadas de pantalla
  vec2 screenCoord = vUv * screen.xy;
  vec2 centerScreen = screen.xy / 2.0;
  
  float finalAudio = setAudio(audioTexture, audio_sz);
  float audioRadius = max(smooth_audio(audioTexture, audio_sz, 0.1), smooth_audio(audioTexture, audio_sz, 0.15));
  
  // Calcular espacios para partículas (adaptado para WebGL)
  // Simplificado para renderizar partículas en una cuadrícula
  vec2 numParticles = screen.xy / 2.0; // Reducir densidad para rendimiento
  vec2 spaces = screen.xy / numParticles;
  
  vec2 particleIndex = floor(screenCoord / spaces);
  vec2 particleCoord = particleIndex * spaces;
  
  // Solo procesar si estamos cerca del centro de una partícula
  vec2 offset = screenCoord - particleCoord;
  if (length(offset) < spaces.x * 0.5) {
    vec3 particleCoords = vec3(screenCoord, 0.0);
    vec4 old = vec4(particleCoords, 0.0);
    
    if (!isRadialDisplacement) {
      particleCoords.xyz += vec3(
        fbm3(old.xyzw, displaceX, vec4(flowX, flowY, flowZ, flowEvolution), finalAudio),
        fbm3(old.yzxw, displaceY, vec4(flowY, flowZ, flowX, flowEvolution), finalAudio),
        fbm3(old.zxyw, displaceZ, vec4(flowZ, flowX, flowY, flowEvolution), finalAudio)
      );
    } else {
      particleCoords.xyz += fbm3(old.xyzw, displaceX, vec4(flowX, flowY, flowZ, flowEvolution), finalAudio) * normalize(particleCoords.xyz - vec3(screen.xy / 2.0, 0.0));
    }
    
    float radius = sphereRadius;
    float blurSize = antiAlias / screen.y;
    radius += radiusAudioMultiplier * abs(audioRadius) / screen.y;
    radius = min(radius, screen.x + blurSize);
    
    vec3 centerCoords = vec3(screen.xy / 2.0, 0.0);
    vec3 distanceVectorFromCenter = (particleCoords - centerCoords);
    
    if (length(distanceVectorFromCenter) <= radius) {
      vec3 newPos = centerCoords + radius * normalize(distanceVectorFromCenter);
      float diff = length(newPos - particleCoords);
      diff *= clamp((smoothstep(0.0, feather * radius, diff)) + blurSize, blurSize, 1.0 + blurSize);
      particleCoords += diff * normalize(distanceVectorFromCenter);
    }
    
    // Renderizar partícula
    float dist = length(screenCoord - particleCoords.xy);
    float particleDist = 1.0 - smoothstep(0.0, particleSize, dist);
    particleDist *= particleSize;
    
    vec3 color = vec3(0.0118, 0.1412, 0.3412);
    float alpha = opacity;
    alpha *= (pow(particleDist / particleSize, colorIntensityAddStrength) - colorIntensityAddStrength) * (1.0 - pow(1.0 - opacity, particleDist / particleSize));
    alpha *= particleDist;
    
    gl_FragColor = vec4(color * alpha, alpha);
  } else {
    gl_FragColor = vec4(0.0);
  }
}
`;

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

function NCSOrb({ analyser, audioLevel, isSpeaking }) {
  const meshRef = useRef();
  const audioTextureRef = useRef(null);
  
  const uniformsRef = useRef({
    screen: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    time: { value: 0 },
    audioTexture: { value: null },
    audio_sz: { value: 256 },
    fractalAudioMultiplier: { value: 9.0 },
    fractalAudioMixing: { value: 0.50 },
    radiusAudioMultiplier: { value: 200.0 },
    particleSize: { value: 3.0 },
    sphereRadius: { value: 275.0 },
    feather: { value: 0.45 },
    antiAlias: { value: 5.0 },
    isRadialDisplacement: { value: false },
    displaceX: { value: 110.0 },
    displaceY: { value: 95.0 },
    displaceZ: { value: 115.0 },
    flowX: { value: 0.0 },
    flowY: { value: 0.033 },
    flowZ: { value: 0.0 },
    flowEvolution: { value: 0.015 },
    fScale: { value: 4.6 },
    octaveMultiplier: { value: 0.25 },
    octaveScale: { value: 1.0 },
    complexity: { value: 3 },
    gamma: { value: 1.0 },
    minVal: { value: -5.0 },
    maxVal: { value: 5.0 },
    offset: { value: 0.0 },
    noiseMultiplier: { value: 1.0 },
  });

  // Crear textura de audio
  useEffect(() => {
    const audioData = new Float32Array(256);
    audioTextureRef.current = new THREE.DataTexture(audioData, 256, 1, THREE.RedFormat, THREE.FloatType);
    audioTextureRef.current.needsUpdate = true;
    uniformsRef.current.audioTexture.value = audioTextureRef.current;
  }, []);

  // Actualizar audio
  useEffect(() => {
    if (!analyser || !audioTextureRef.current) {
      if (audioTextureRef.current) {
        const audioData = audioTextureRef.current.image.data;
        audioData.fill(0);
        audioTextureRef.current.needsUpdate = true;
      }
      return;
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const updateAudio = () => {
      analyser.getByteFrequencyData(dataArray);
      
      const audioData = audioTextureRef.current.image.data;
      const binSize = Math.max(1, Math.floor(dataArray.length / 256));
      
      for (let i = 0; i < 256; i++) {
        let sum = 0;
        const start = i * binSize;
        const end = Math.min(start + binSize, dataArray.length);
        for (let j = start; j < end; j++) {
          sum += dataArray[j];
        }
        audioData[i] = (sum / binSize) / 255.0;
      }
      
      audioTextureRef.current.needsUpdate = true;
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
        fragmentShader={fragmentShader1}
        uniforms={uniformsRef.current}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

const VoiceOrbNCS = ({ analyser, isSpeaking = false, audioLevel = 0 }) => {
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        console.warn('VoiceOrbNCS: WebGL no está disponible');
        setWebglError(true);
      }
    } catch (error) {
      console.warn('VoiceOrbNCS: Error verificando WebGL:', error);
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
          console.warn('VoiceOrbNCS: Error en Canvas:', error);
          setWebglError(true);
        }}
      >
        <NCSOrb analyser={analyser} audioLevel={audioLevel} isSpeaking={isSpeaking} />
      </Canvas>
    </div>
  );
};

export default VoiceOrbNCS;
