import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Environment } from "@react-three/drei";
import * as THREE from "three";
import './WaterSphere.css';

// NOTE: simplified, robust implementation to avoid vertex-shader compile failures.
// Uses a safe FBM-based onBeforeCompile injection (no texture sampling in vertex shader)
// and keeps procedural canvas textures for color/normal/displacement.

function generateWaterTexture(size = 1024){
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  function noise(x,y){
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const a = Math.sin((xi + yi*57)) * 43758.5453;
    const b = Math.sin((xi+1 + yi*57)) * 43758.5453;
    const c = Math.sin((xi + (yi+1)*57)) * 43758.5453;
    const d = Math.sin((xi+1 + (yi+1)*57)) * 43758.5453;
    const u = xf*xf*(3 - 2*xf), v = yf*yf*(3 - 2*yf);
    const res = (a*(1-u)*(1-v) + b*(u)*(1-v) + c*(1-u)*(v) + d*(u)*(v));
    return (res % 1 + 1) % 1;
  }

  function fbm(x,y){
    let v = 0.0, a = 0.5;
    for(let i=0;i<6;i++){
      v += a * noise(x, y);
      x *= 2.0; y *= 2.0; a *= 0.5;
    }
    return v;
  }

  // build height field with swirling
  const height = new Float32Array(size*size);
  for(let j=0;j<size;j++){
    for(let i=0;i<size;i++){
      const u = (i/size - 0.5) * 2.0;
      const v = (j/size - 0.5) * 2.0;
      // radial falloff to keep edges soft
      const r = Math.sqrt(u*u + v*v);
      const swirl = fbm(i*0.002 + Math.sin(j*0.003)*0.5, j*0.002 + Math.cos(i*0.003)*0.5);
      const waves = fbm(i*0.006, j*0.006) * 0.6 + fbm(i*0.02, j*0.02)*0.4;
      let h = swirl * 0.7 + waves * 0.5;
      h *= Math.exp(-r*2.2); // fade to edges
      // add bright veins
      const veins = Math.pow(Math.abs(fbm(i*0.03, j*0.03) - 0.45), 3.0) * 1.6;
      h += veins * 0.45;
      height[j*size + i] = h;
    }
  }

  // normalize height to [0,1]
  let min = Infinity, max = -Infinity;
  for(let k=0;k<height.length;k++){ if(height[k] < min) min = height[k]; if(height[k] > max) max = height[k]; }
  const range = Math.max(1e-6, max - min);
  for(let k=0;k<height.length;k++) height[k] = (height[k] - min) / range;

  // create color mapping (turquoise/teal palette similar to reference)
  function lerp(a,b,t){ return a + (b-a)*t; }
  function mixColor(t){
    const deep = [2/255, 70/255, 78/255];
    const mid = [8/255, 178/255, 161/255];
    const high = [199/255, 246/255, 248/255];
    if(t < 0.4){ const f = t/0.4; return [lerp(deep[0], mid[0], f), lerp(deep[1], mid[1], f), lerp(deep[2], mid[2], f)]; }
    const f = (t-0.4)/0.6; return [lerp(mid[0], high[0], f), lerp(mid[1], high[1], f), lerp(mid[2], high[2], f)];
  }

  // fill color image and create height image data
  const heightCanvas = document.createElement('canvas'); heightCanvas.width = heightCanvas.height = size;
  const hctx = heightCanvas.getContext('2d');
  const hImg = hctx.createImageData(size,size);

  for(let j=0;j<size;j++){
    for(let i=0;i<size;i++){
      const h = height[j*size + i];
      const col = mixColor(Math.pow(h, 0.9));
      const idx = (j*size + i)*4;
      img.data[idx] = Math.floor(col[0]*255);
      img.data[idx+1] = Math.floor(col[1]*255);
      img.data[idx+2] = Math.floor(col[2]*255);
      img.data[idx+3] = 255;
      const hv = Math.floor(h*255);
      hImg.data[idx] = hv; hImg.data[idx+1] = hv; hImg.data[idx+2] = hv; hImg.data[idx+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  hctx.putImageData(hImg, 0, 0);

  // build normal map from height via sobel-like gradient
  const normalCanvas = document.createElement('canvas'); normalCanvas.width = normalCanvas.height = size;
  const nctx = normalCanvas.getContext('2d');
  const nImg = nctx.createImageData(size,size);
  for(let j=0;j<size;j++){
    for(let i=0;i<size;i++){
      const getH = (x,y)=>{ x = Math.max(0, Math.min(size-1, x)); y = Math.max(0, Math.min(size-1, y)); return height[y*size + x]; };
      const hl = getH(i-1,j), hr = getH(i+1,j), hu = getH(i,j-1), hd = getH(i,j+1);
      const dx = (hr - hl) * 1.0;
      const dy = (hd - hu) * 1.0;
      const nz = 1.0;
      let nx = -dx, ny = -dy, nzv = nz;
      const len = Math.sqrt(nx*nx + ny*ny + nzv*nzv) + 1e-6;
      nx /= len; ny /= len; nzv /= len;
      const idx = (j*size + i)*4;
      nImg.data[idx] = Math.floor((nx*0.5 + 0.5)*255);
      nImg.data[idx+1] = Math.floor((ny*0.5 + 0.5)*255);
      nImg.data[idx+2] = Math.floor((nzv*0.5 + 0.5)*255);
      nImg.data[idx+3] = 255;
    }
  }
  nctx.putImageData(nImg, 0, 0);

  return { colorCanvas: canvas, normalCanvas, heightCanvas };
}

const WaterMesh = ({ texturePath = '/textures/water-texture.jpg', normalPath = '/textures/water-normal-map.jpg', displacementPath = '/textures/water-displacement.jpg' }) => {
  const mesh = useRef();
  const matRef = useRef();
  const overlayMat = useRef();

  // Procedural textures by default (high-res canvases). If the caller provides
  // explicit texture paths and wants those used, they can replace the props.
  const proc = useMemo(() => generateWaterTexture(1024), []);
  const colorMap = useMemo(() => {
    const t = new THREE.CanvasTexture(proc.colorCanvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1,1);
    t.encoding = THREE.sRGBEncoding;
    // ensure texture is uploaded to GPU and has reasonable filters/mipmaps
    t.needsUpdate = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = true;
    t.anisotropy = 4;
    return t;
  }, [proc]);
  const normalMap = useMemo(() => {
    const t = new THREE.CanvasTexture(proc.normalCanvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1,1);
    t.encoding = THREE.LinearEncoding;
    t.needsUpdate = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = true;
    t.anisotropy = 4;
    return t;
  }, [proc]);
  const dispMap = useMemo(() => {
    const t = new THREE.CanvasTexture(proc.heightCanvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1,1);
    t.encoding = THREE.LinearEncoding;
    // displacement map doesn't need mipmaps and can use linear filtering
    t.needsUpdate = true;
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    t.anisotropy = 1;
    return t;
  }, [proc]);

  // ensure texture encoding
  colorMap.encoding = THREE.sRGBEncoding;
  normalMap.encoding = THREE.LinearEncoding;
  dispMap.encoding = THREE.LinearEncoding;

  useFrame((state, delta) => {
    if(!mesh.current) return;
    // subtle rotation to give life
    mesh.current.rotation.y += delta * 0.06;
    // animate normal/displacement offsets for flowing surface (faster for pronounced motion)
    if(colorMap) { colorMap.offset.y = (colorMap.offset.y + delta * 0.06) % 1; }
    if(normalMap) { normalMap.offset.x = (normalMap.offset.x + delta * 0.09) % 1; }
    if(dispMap) { dispMap.offset.y = (dispMap.offset.y + delta * 0.05) % 1; }
    // animate subtle material properties
    if(matRef.current){
      const m = matRef.current;
      // breathing thin-film-like modulation
      m.clearcoat = 1.0;
      m.clearcoatRoughness = 0.02;
      m.roughness = 0.02 + 0.02 * Math.sin(state.clock.elapsedTime * 0.9);
      m.transmission = 0.95;
      m.thickness = 1.1 + 0.5 * Math.sin(state.clock.elapsedTime * 0.9);
      // pulsate displacement scale for more pronounced, hyperreal flow
      m.displacementScale = 0.18 + 0.12 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 1.1));
    }
    // update overlay shader time uniform if overlay material is present
    if(overlayMat.current && overlayMat.current.uniforms && typeof overlayMat.current.uniforms.u_time !== 'undefined'){
      overlayMat.current.uniforms.u_time.value = state.clock.elapsedTime;
    }
  });

  // update injected shader uniforms (u_time) per-frame if available
  useFrame((state) => {
    const mat = matRef.current;
    // try to attach shader injection if material became available later
    if(mat && !mat.userData?.shader){ _setupOnBefore(mat); }
    if(mat && mat.userData && mat.userData.shader && mat.userData.shader.uniforms){
      mat.userData.shader.uniforms.u_time.value = state.clock.elapsedTime;
      // also give dispMap in case it needs to be updated
    }
    // keep overlay sampler uniforms in sync (safe fragment-stage sampling)
    if(overlayMat.current && overlayMat.current.uniforms){
      if(typeof overlayMat.current.uniforms.u_time !== 'undefined') overlayMat.current.uniforms.u_time.value = state.clock.elapsedTime;
      if(typeof overlayMat.current.uniforms.u_disp !== 'undefined') overlayMat.current.uniforms.u_disp.value = dispMap;
      if(typeof overlayMat.current.uniforms.u_color !== 'undefined') overlayMat.current.uniforms.u_color.value = colorMap;
      if(typeof overlayMat.current.uniforms.u_normal !== 'undefined') overlayMat.current.uniforms.u_normal.value = normalMap;
    }
  });

  // Enhance vertex displacement by injecting a safe onBeforeCompile modification
  // Use only procedural FBM/curl in the vertex shader (no texture reads) and guard
  // numeric operations to avoid division-by-zero / tiny-precision sums.
  const _setupOnBefore = (material) => {
    if(!material || material.__flowInjected) return;
    material.__flowInjected = true;
    material.onBeforeCompile = (shader) => {
      shader.uniforms.u_time = { value: 0 };
      shader.vertexShader = 'uniform float u_time;\n' + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n  // Safe procedural FBM + curl displacement (vertex)\n  float hash_f(float n){ return fract(sin(n) * 43758.5453); }\n  float noise_f(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f); float a = hash_f(i.x + i.y * 57.0); float b = hash_f(i.x + 1.0 + i.y * 57.0); float c = hash_f(i.x + (i.y + 1.0) * 57.0); float d = hash_f(i.x + 1.0 + (i.y + 1.0) * 57.0); return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y; }\n  float fbm_f(vec2 p){ float v = 0.0; float a = 0.5; for(int i=0;i<6;i++){ v += a * noise_f(p); p *= 2.0; a *= 0.5; } return v; }\n  vec2 curl_f(vec2 p){ float e = 0.001; float n1 = fbm_f(p + vec2(0.0, e)); float n2 = fbm_f(p - vec2(0.0, e)); float n3 = fbm_f(p + vec2(e, 0.0)); float n4 = fbm_f(p - vec2(e, 0.0)); return vec2(n1 - n2, n4 - n3); }\n  // add low-frequency large-scale wave + faster detail flow for pronounced motion\n  vec2 flowUV = uv + vec2(u_time * 0.12, u_time * 0.09) + fbm_f(uv * 10.0) * 0.06;\n  float procDisp = fbm_f(flowUV * 5.5);\n  float bigWave = fbm_f(uv * 1.2 + u_time * 0.12) * 0.8; // low-frequency swell\n  float crease = smoothstep(0.15, 0.98, procDisp);\n  float boosted = mix(procDisp, crease, 0.97);\n  vec2 c = curl_f(uv * 9.0 + u_time * 1.1);\n  boosted = clamp(boosted + bigWave * 0.85, 0.0, 1.0);\n  // stronger silhouette displacement + curl-driven tangential flow for ultrareal motion\n  transformed += normal * (boosted * 1.35 * (0.8 + 0.2 * sin(u_time * 0.6))) + vec3(c.x * 0.8, c.y * 0.8, 0.0);\n      `);

      // log the final vertex shader for debugging any compile issues
      try{
        // eslint-disable-next-line no-console
        console.warn('WaterSphere vertex shader (onBeforeCompile):', shader.vertexShader);
      }catch(e){}
      // expose shader so we can update u_time in useFrame and force recompile
      material.userData.shader = shader;
      material.needsUpdate = true;
    };
  };

  // attach onBeforeCompile once material is available (run after mount)
  React.useEffect(() => {
    if(matRef.current && !matRef.current.userData.shader){
      _setupOnBefore(matRef.current);
    }
  }, []);

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 128, 128]} />
        <meshPhysicalMaterial
        ref={matRef}
        color={new THREE.Color('#0bd1c2')}
        envMapIntensity={1.6}
        metalness={0.0}
        roughness={0.02}
        transmission={0.95}
        thickness={1.3}
        ior={1.36}
        reflectivity={0.9}
        clearcoat={0.9}
        clearcoatRoughness={0.02}
        attenuationColor={new THREE.Color('#019ea0')}
        attenuationDistance={0.8}
        map={colorMap}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(2.2,2.2)}
        // displacementMap removed — vertex displacement is procedural in the injected shader
        displacementScale={0.22}
        side={THREE.FrontSide}
        transparent={true}
      />

      {/* thin outer layer for iridescent rim (fresnel) */}
      <mesh>
        <sphereGeometry args={[1.01, 128, 128]} />
        <shaderMaterial
          blending={THREE.AdditiveBlending}
          transparent={true}
          vertexShader={
            `varying vec3 vNormal; varying vec3 vPos;
            void main(){ vNormal = normalize(normalMatrix * normal); vPos = (modelViewMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);} `
          }
          fragmentShader={
            `varying vec3 vNormal; varying vec3 vPos; void main(){ float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(-vPos)), 0.0), 2.0); vec3 col = vec3(0.02,0.9,0.86) * fres * 0.6; gl_FragColor = vec4(col, fres * 0.6); }`
          }
        />
      </mesh>
      {/* flowing detail overlay: fragment-stage sampling of procedural maps (safe) */}
      <mesh scale={[1.003,1.003,1.003]}>
        <sphereGeometry args={[1.002, 128, 128]} />
        <shaderMaterial
          ref={overlayMat}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{ u_time: { value: 0 }, u_disp: { value: dispMap }, u_color: { value: colorMap }, u_normal: { value: normalMap } }}
          vertexShader={`varying vec2 vUv; varying vec3 vNormal; vec3 safeNormalizeVec3(vec3 v){ float l = length(v); return (l > 1e-6) ? v / l : vec3(0.0,0.0,1.0); } void main(){ vUv = uv; vNormal = safeNormalizeVec3(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
          fragmentShader={`uniform float u_time; uniform sampler2D u_disp; uniform sampler2D u_color; uniform sampler2D u_normal; varying vec2 vUv; varying vec3 vNormal;
            // intensified ultrareal fragment overlay: stronger normal perturb, fresnel, thin-film, dynamic specular
            vec3 safeNormalizeVec3(vec3 v){ float l = length(v); return (l > 1e-6) ? v / l : vec3(0.0,0.0,1.0); }
            vec3 srgbToLinear(vec3 c){ return pow(c, vec3(2.2)); }
            vec3 linearToSrgb(vec3 c){ return pow(max(c, vec3(0.0)), vec3(1.0/2.2)); }
            void main(){
              // faster flowing UVs and slightly scaled sampling for pronounced veins
              vec2 flow = vUv + vec2(u_time * 0.18, u_time * 0.14);
              float h = texture2D(u_disp, fract(flow * 1.6)).r;
              vec3 base = texture2D(u_color, vUv).rgb;
              vec3 nSample = texture2D(u_normal, fract(vUv * 1.8 + vec2(u_time * 0.04))).rgb;
              vec3 n = safeNormalizeVec3(vec3(nSample.r * 2.0 - 1.0, nSample.g * 2.0 - 1.0, nSample.b * 2.0 - 1.0));
              // combine geometry normal with stronger micro-normal from normal map
              vec3 combinedNormal = safeNormalizeVec3(safeNormalizeVec3(vNormal) + n * 0.9);
              vec3 viewDir = vec3(0.0, 0.0, 1.0);
              float VdotN = max(dot(viewDir, combinedNormal), 0.0);
              float fres = pow(max(0.0, 1.0 - VdotN), 6.0);
              // stronger thin-film interference for iridescent sheen
              float thin = sin((VdotN * 6.2831) * 8.0 + u_time * 4.0) * 0.5 + 0.5;
              vec3 interference = mix(vec3(0.02,0.9,0.86), vec3(1.0,0.98,0.9), thin * 0.5);
              // intensified specular (Blinn-like) with roughness/hight modulation
              vec3 lightDir = safeNormalizeVec3(vec3(0.35, 0.68, 0.95));
              vec3 halfV = safeNormalizeVec3(viewDir + lightDir);
              float specPower = mix(18.0, 220.0, smoothstep(0.0, 1.0, 1.0 - h));
              float spec = pow(max(dot(combinedNormal, halfV), 0.0), specPower) * (0.8 + 1.8 * fres);
              vec3 specularColor = vec3(1.0) * spec * 1.8;
              // color blend: base, veins/interference, bright highlights where height is higher
              vec3 colorBlend = mix(base, interference, smoothstep(0.05, 0.95, h) * 0.98) + specularColor;
              vec3 linear = srgbToLinear(colorBlend);
              linear += vec3(0.04) * fres; // stronger rim glow
              vec3 outc = linearToSrgb(linear);
              float alpha = clamp(smoothstep(0.02, 0.98, h) * (fres * 2.0 + 0.3), 0.0, 1.0);
              gl_FragColor = vec4(outc, alpha);
            }`}
        />
      </mesh>
    </mesh>
  );
};

const Scene = (props) => {
  return (
    <div className="water-sphere-wrapper">
      <Canvas camera={{ position: [0, 0, 3], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1.0} />
        <Stars radius={50} depth={20} count={2000} factor={4} saturation={0} fade speed={0.2} />
        <Environment preset="studio" background={false} />
        <WaterMesh {...props} />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
};

export default Scene;
