import React, { useRef, useEffect, useState } from 'react';
import './OrbSpherePro.css';

export default function OrbSpherePro(){
  const canvasRef = useRef(null);
  // Live tweakable parameters (state for UI, refs for render loop)
  const [spec, setSpec] = useState(0.7);
  const [disp, setDisp] = useState(0.012);
  const [thin, setThin] = useState(1.6);
  const [foam, setFoam] = useState(1.8);
  const [warpAmt, setWarpAmt] = useState(1.0);
  const specRef = useRef(spec);
  const dispRef = useRef(disp);
  const thinRef = useRef(thin);
  const foamRef = useRef(foam);
  const warpRef = useRef(warpAmt);

  useEffect(()=>{ specRef.current = spec; }, [spec]);
  useEffect(()=>{ dispRef.current = disp; }, [disp]);
  useEffect(()=>{ thinRef.current = thin; }, [thin]);
  useEffect(()=>{ foamRef.current = foam; }, [foam]);
  useEffect(()=>{ warpRef.current = warpAmt; }, [warpAmt]);

  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: true });
    if(!gl){
      console.warn('WebGL not available');
      return;
    }

    const vs = `attribute vec2 a_position; varying vec2 v_uv; void main(){ v_uv = a_position*0.5 + 0.5; gl_Position = vec4(a_position, 0.0, 1.0); }`;

    const fs = `precision highp float;
    varying vec2 v_uv;
    uniform float u_time;
    uniform vec2 u_res;
    uniform float u_specExp;
    uniform float u_dispersion;
    uniform float u_thinPow;
    uniform float u_foamScale;
    uniform float u_silhouetteWarp;

    // hash / noise
    float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }
    float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); float a=hash(i); float b=hash(i+vec2(1.0,0.0)); float c=hash(i+vec2(0.0,1.0)); float d=hash(i+vec2(1.0,1.0)); vec2 u = f*f*(3.0-2.0*f); return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y; }
    // fbm
    float fbm(in vec2 p){ float v=0.0; float a=0.6; for(int i=0;i<8;i++){ v += a*noise(p); p = p*2.0 + vec2(5.2,1.7); a *= 0.5; } return v; }

    // domain warp + curl-like movement
    vec2 domainWarp(vec2 p){ float q = fbm(p*0.9 + u_time*0.03); p += 0.35*vec2(fbm(p*1.7 + q), fbm(p*2.0 - q)); return p; }

    // normal approx (height-field)
    vec3 getNormal(vec2 uv){ float e = 1.0 / u_res.x * 2.0; float h = fbm(uv); float hx = fbm(uv + vec2(e,0.0)); float hy = fbm(uv + vec2(0.0,e)); vec3 n = normalize(vec3((hx-h), (hy-h), 1.3)); return n; }

    // thin-film interference approximation (wavelength shift)
    vec3 thinFilm(vec3 base, float t, float powF){ vec3 film = vec3(0.6,0.95,0.9) * pow(clamp(t,0.0,1.0), powF); return mix(base, base + film*0.75, film*0.8); }

    // sample layered refraction (per-channel offset)
    vec3 sampleRefractColor(vec2 uv, vec3 normal, float disp){ vec2 off = normal.xy * disp; float r = fbm(uv + off*1.35); float g = fbm(uv + off*1.05); float b = fbm(uv + off*0.82); return vec3(r,g,b); }

    void main(){
      vec2 uv = v_uv;
      vec2 center = vec2(0.5, 0.5);
      vec2 d = uv - center; float dist = length(d);

      // silhouette deformation (soft waviness at edge)
      float warp = fbm(uv*3.0 + u_time*0.5) * 0.06 * u_silhouetteWarp; 
      float radius = 0.46 + warp;
      float mask = smoothstep(radius + 0.02, radius - 0.02, dist);

      // warp coordinates to create internal flow
      vec2 w = domainWarp((uv - center)*vec2(1.25,1.05)) + center;

      // multi-scale layers for creases and filaments
      float large = fbm(w*0.6 + u_time*0.02);
      float mid = fbm(w*2.2 + u_time*0.08);
      float fine = fbm(w*9.0 + u_time*0.6);
      float ridge = max(0.0, (mid - large) * 1.6);
      float height = clamp(large*0.55 + mid*0.35 + fine*0.25 + ridge*0.45, 0.0, 1.0);

      // normals
      vec3 normal = getNormal(w*1.3);

      // refraction + chromatic dispersion
      vec3 refr = sampleRefractColor(w*1.1, normal, u_dispersion);

      // base palette: tuned toward deep turquoise
      vec3 baseEdge = vec3(0.02,0.07,0.1);
      vec3 baseMid  = vec3(0.05,0.65,0.60);
      vec3 baseCore = vec3(0.06,0.83,0.78);
      vec3 base = mix(baseEdge, mix(baseMid, baseCore, smoothstep(0.0,0.7,height)), smoothstep(0.0,1.0,height));

      // combine base and refracted detail
      vec3 color = mix(base, refr*vec3(0.95,1.05,1.05), 0.62);

      // foam and micro-bubbles near creases
      float foam = smoothstep(0.45, 0.7, fine * u_foamScale) * smoothstep(0.2, 0.6, ridge);
      color = mix(color, vec3(0.98,0.98,0.98), clamp(foam, 0.0, 1.0)*0.85);

      // specular highlights (dual-lobe)
      vec3 light = normalize(vec3(-0.2,0.45,0.82));
      vec3 view = vec3(0.0,0.0,1.0);
      float ndv = max(dot(normal, view), 0.0);
      float fres = pow(1.0 - ndv, 2.0);
      float spec = pow(max(dot(reflect(-light, normal), view),0.0), max(8.0, u_specExp*180.0));
      float spec2 = pow(max(dot(reflect(-light*0.6, normal), view),0.0), 10.0);
      color += vec3(1.0)* (spec*0.9 + spec2*0.25) * (0.6 + fres*0.9);

      // thin-film interference subtle color shift using fine noise
      color = thinFilm(color, fine - 0.5, u_thinPow);

      // caustic-like sheen
      float caust = smoothstep(0.5,0.95, fbm(w*14.0 + u_time*0.9));
      color += vec3(0.06,0.18,0.14) * caust * 0.7;

      // rim glow: cooler cyan at edges
      color += vec3(0.0,0.92,0.85) * smoothstep(0.7, 0.5, 1.0 - dist) * fres * 0.45;

      // tone & gamma
      color *= 0.92 + 0.24 * height;
      color = pow(clamp(color, 0.0, 1.0), vec3(0.95));

      gl_FragColor = vec4(color, mask);
    }
    `;

    function compile(type, src){ const s=gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){ console.error('Shader error', gl.getShaderInfoLog(s)); gl.deleteShader(s); return null;} return s; }
    const s1 = compile(gl.VERTEX_SHADER, vs);
    const s2 = compile(gl.FRAGMENT_SHADER, fs);
    if(!s1 || !s2) return;
    const prog = gl.createProgram(); gl.attachShader(prog, s1); gl.attachShader(prog, s2); gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){ console.error('Link error', gl.getProgramInfoLog(prog)); return; }

    const pos = gl.getAttribLocation(prog, 'a_position');
    const timeLoc = gl.getUniformLocation(prog, 'u_time');
    const resLoc = gl.getUniformLocation(prog, 'u_res');
    // new tweakable uniforms
    const specLoc = gl.getUniformLocation(prog, 'u_specExp');
    const dispLoc = gl.getUniformLocation(prog, 'u_dispersion');
    const thinLoc = gl.getUniformLocation(prog, 'u_thinPow');
    const foamLoc = gl.getUniformLocation(prog, 'u_foamScale');
    const warpLoc = gl.getUniformLocation(prog, 'u_silhouetteWarp');

    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);

    let start = performance.now();
    function resize(){ const dpr = Math.min(window.devicePixelRatio||1, 2); const r = canvas.getBoundingClientRect(); const w = Math.max(1, Math.floor(r.width*dpr)); const h = Math.max(1, Math.floor(r.height*dpr)); if(canvas.width!==w||canvas.height!==h){ canvas.width=w; canvas.height=h; gl.viewport(0,0,w,h);} }
    let raf;
    function render(){ try{ resize(); const t=(performance.now()-start)/1000; gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT); gl.useProgram(prog); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0); gl.uniform1f(timeLoc, t); gl.uniform2f(resLoc, canvas.width, canvas.height);
        // set tweakable uniforms from refs
        if(specLoc) gl.uniform1f(specLoc, specRef.current);
        if(dispLoc) gl.uniform1f(dispLoc, dispRef.current);
        if(thinLoc) gl.uniform1f(thinLoc, thinRef.current);
        if(foamLoc) gl.uniform1f(foamLoc, foamRef.current);
        if(warpLoc) gl.uniform1f(warpLoc, warpRef.current);
        gl.drawArrays(gl.TRIANGLES,0,3);
      }catch(e){ console.error(e); cancelAnimationFrame(raf); } raf = requestAnimationFrame(render);} render();

    return ()=>{ cancelAnimationFrame(raf); gl.deleteBuffer(buf); gl.deleteProgram(prog); gl.deleteShader(s1); gl.deleteShader(s2); };
  }, []);

    return (
    <div className="orb-pro-wrapper">
      <canvas ref={canvasRef} className="orb-pro-canvas" aria-hidden="true" />
      <div className="orb-pro-controls" aria-hidden="true">
        <label>Specular: <input type="range" min="0.1" max="1.2" step="0.01" value={spec} onChange={e=>setSpec(parseFloat(e.target.value))} /></label>
        <label>Dispersion: <input type="range" min="0.0" max="0.04" step="0.001" value={disp} onChange={e=>setDisp(parseFloat(e.target.value))} /></label>
        <label>Thin-film: <input type="range" min="0.2" max="3.0" step="0.01" value={thin} onChange={e=>setThin(parseFloat(e.target.value))} /></label>
        <label>Foam: <input type="range" min="0.0" max="4.0" step="0.01" value={foam} onChange={e=>setFoam(parseFloat(e.target.value))} /></label>
        <label>Edge Warp: <input type="range" min="0.0" max="2.0" step="0.01" value={warpAmt} onChange={e=>setWarpAmt(parseFloat(e.target.value))} /></label>
      </div>
    </div>
  );
}
