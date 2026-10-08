import React, { useRef, useEffect } from "react";
import "./RealisticWaterOrb.css";

const RealisticWaterOrb = ({ audioLevel = 0, isListening = false }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const size = 800;
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 300;

    // Colores exactos de la descripción
    const colors = {
      aqua: { r: 91, g: 228, b: 233 },      // #5be4e9
      teal: { r: 50, g: 198, b: 211 },      // #32c1cc
      cyan: { r: 151, g: 244, b: 255 },     // #97f4ff
      cyanLight: { r: 200, g: 250, b: 255 }, // #c8faff
      cyanLighter: { r: 170, g: 243, b: 255 }, // #aaf3ff
      cyanBright: { r: 184, g: 248, b: 255 },  // #b8f8ff
      cyanWhite: { r: 232, g: 255, b: 255 },   // #e8ffff
      blueDeep: { r: 31, g: 110, b: 157 },     // #1f6e9d
      white: { r: 255, g: 255, b: 255 }
    };

    // Función de ruido para texturas fluidas
    const noise = (x, y) => {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      const u = xf * xf * (3.0 - 2.0 * xf);
      const v = yf * yf * (3.0 - 2.0 * yf);
      const a = (Math.sin(X + Y * 57) * 0.5 + 0.5) * 43758.5453;
      const b = (Math.sin((X + 1) + Y * 57) * 0.5 + 0.5) * 43758.5453;
      const c = (Math.sin(X + (Y + 1) * 57) * 0.5 + 0.5) * 43758.5453;
      const d = (Math.sin((X + 1) + (Y + 1) * 57) * 0.5 + 0.5) * 43758.5453;
      return a + (b - a) * u + (c - a) * v + (d - b - c + a) * u * v;
    };

    // FBM para patrones fluidos suaves
    const fbm = (x, y, octaves = 6) => {
      let value = 0.0;
      let amplitude = 0.5;
      let frequency = 1.0;
      for (let i = 0; i < octaves; i++) {
        value += amplitude * (noise(x * frequency, y * frequency) - 0.5);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    };

    const animate = () => {
      timeRef.current += 0.01;
      const t = timeRef.current;

      ctx.clearRect(0, 0, size, size);

      const imageData = ctx.createImageData(size, size);
      const data = imageData.data;

      // Renderizar la esfera pixel por pixel
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = (x - centerX) / radius;
          const dy = (y - centerY) / radius;
          const dist2D = Math.sqrt(dx * dx + dy * dy);

          // Esfera perfecta
          if (dist2D > 1.0) {
            continue; // Fuera de la esfera
          }

          // Calcular profundidad Z de la esfera
          const z = Math.sqrt(1.0 - dist2D * dist2D);
          const depth = 1.0 - z; // 0 = centro, 1 = superficie

          // Coordenadas 3D normalizadas
          const nx = dx;
          const ny = dy;
          const nz = z;

          // Patrones de líquido interno - rayas onduladas fluidas
          const u = (x / size) * 2 - 1;
          const v = (y / size) * 2 - 1;
          
          // Múltiples capas de movimiento fluido
          const flow1 = fbm(u * 2 + t * 0.3, v * 2 + t * 0.25, 4);
          const flow2 = fbm(u * 3 - t * 0.4, v * 3 - t * 0.35, 5);
          const flow3 = fbm(u * 1.5 + t * 0.2, v * 1.5 + t * 0.18, 3);
          
          // Rayas onduladas que fluyen
          const streak1 = Math.sin((u + flow1) * 8 + t * 0.5) * 0.5 + 0.5;
          const streak2 = Math.sin((v + flow2) * 6 - t * 0.4) * 0.5 + 0.5;
          const swirl = Math.sin((u * u + v * v) * 5 + flow3 * 2 + t * 0.3) * 0.5 + 0.5;
          
          const liquidPattern = (streak1 * 0.4 + streak2 * 0.3 + swirl * 0.3);

          // Iluminación - highlight superior izquierdo fuerte
          const lightDir = { x: -0.6, y: -0.8, z: 0.5 };
          const lightLen = Math.sqrt(lightDir.x ** 2 + lightDir.y ** 2 + lightDir.z ** 2);
          lightDir.x /= lightLen;
          lightDir.y /= lightLen;
          lightDir.z /= lightLen;

          const dot = nx * lightDir.x + ny * lightDir.y + nz * lightDir.z;
          const lightIntensity = Math.max(0, dot);

          // Highlight secundario superior derecho
          const lightDir2 = { x: 0.5, y: -0.7, z: 0.6 };
          const lightLen2 = Math.sqrt(lightDir2.x ** 2 + lightDir2.y ** 2 + lightDir2.z ** 2);
          lightDir2.x /= lightLen2;
          lightDir2.y /= lightLen2;
          lightDir2.z /= lightLen2;
          const dot2 = nx * lightDir2.x + ny * lightDir2.y + nz * lightDir2.z;
          const lightIntensity2 = Math.max(0, dot2 * 0.6);

          // Rim light suave en el lado derecho
          const rimLight = Math.max(0, nx * 0.7 + ny * 0.3) * 0.3;

          // Color base según profundidad y patrón de líquido
          let r, g, b, a;

          // Gradiente desde centro cyan a bordes teal
          if (depth < 0.2) {
            // Centro - cyan muy claro
            const mix = liquidPattern;
            r = colors.cyanLight.r + (colors.cyanLighter.r - colors.cyanLight.r) * mix;
            g = colors.cyanLight.g + (colors.cyanLighter.g - colors.cyanLight.g) * mix;
            b = colors.cyanLight.b + (colors.cyanLighter.b - colors.cyanLight.b) * mix;
          } else if (depth < 0.4) {
            // Medio-centro - aqua
            const mix = liquidPattern;
            r = colors.aqua.r + (colors.cyan.r - colors.aqua.r) * mix;
            g = colors.aqua.g + (colors.cyan.g - colors.aqua.g) * mix;
            b = colors.aqua.b + (colors.cyan.b - colors.aqua.b) * mix;
          } else if (depth < 0.7) {
            // Medio - teal
            const mix = liquidPattern;
            r = colors.teal.r + (colors.aqua.r - colors.teal.r) * mix;
            g = colors.teal.g + (colors.aqua.g - colors.teal.g) * mix;
            b = colors.teal.b + (colors.aqua.b - colors.teal.b) * mix;
          } else {
            // Bordes - teal oscuro con acentos azul profundo
            const mix = liquidPattern;
            const edgeFactor = (depth - 0.7) / 0.3;
            r = colors.teal.r + (colors.blueDeep.r - colors.teal.r) * edgeFactor;
            g = colors.teal.g + (colors.blueDeep.g - colors.teal.g) * edgeFactor;
            b = colors.teal.b + (colors.blueDeep.b - colors.teal.b) * edgeFactor;
            
            // Acentos azul profundo en las crestas superiores
            if (ny < -0.3 && liquidPattern > 0.6) {
              r = colors.blueDeep.r;
              g = colors.blueDeep.g;
              b = colors.blueDeep.b;
            }
          }

          // Aplicar iluminación - highlights blancos brillantes
          const specular = Math.pow(Math.max(0, dot), 32) * 0.8; // Specular muy brillante
          const specular2 = Math.pow(Math.max(0, dot2), 24) * 0.5;

          r = Math.min(255, r + lightIntensity * 60 + specular * 200 + specular2 * 150);
          g = Math.min(255, g + lightIntensity * 55 + specular * 180 + specular2 * 130);
          b = Math.min(255, b + lightIntensity * 50 + specular * 170 + specular2 * 120);

          // Rim light
          r = Math.min(255, r + rimLight * 40);
          g = Math.min(255, g + rimLight * 35);
          b = Math.min(255, b + rimLight * 30);

          // Caustics internos - reflejos tipo caustic
          if (depth > 0.5 && depth < 0.85) {
            const caustic = Math.sin((x + y) * 0.05 + t * 1.5) * 
                           Math.cos((x - y) * 0.04 + t * 1.2) * 0.2;
            r = Math.max(0, Math.min(255, r + caustic * 50));
            g = Math.max(0, Math.min(255, g + caustic * 45));
            b = Math.max(0, Math.min(255, b + caustic * 40));
          }

          // Transparencia - 40-60% según profundidad
          a = 0.4 + depth * 0.2; // Más opaco en el centro, más transparente en bordes
          
          // Subsurface scattering - brillo lechoso interno
          if (depth < 0.6) {
            const sss = (1 - depth / 0.6) * 0.3;
            r = Math.min(255, r + sss * 30);
            g = Math.min(255, g + sss * 35);
            b = Math.min(255, b + sss * 40);
          }

          // Efecto de pulso con audio
          if (isListening && audioLevel > 0) {
            const pulse = Math.sin(t * 4 + audioLevel * 8) * audioLevel * 0.15;
            r = Math.min(255, r + pulse * 25);
            g = Math.min(255, g + pulse * 30);
            b = Math.min(255, b + pulse * 35);
          }

          const idx = (y * size + x) * 4;
          data[idx] = Math.floor(r);
          data[idx + 1] = Math.floor(g);
          data[idx + 2] = Math.floor(b);
          data[idx + 3] = Math.floor(a * 255);
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Dibujar highlights especulares adicionales
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      
      // Highlight principal superior izquierdo - muy brillante
      const highlightGradient = ctx.createRadialGradient(
        centerX - radius * 0.4,
        centerY - radius * 0.5,
        0,
        centerX - radius * 0.4,
        centerY - radius * 0.5,
        radius * 0.7
      );
      highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${0.7 + Math.sin(t * 0.5) * 0.1})`);
      highlightGradient.addColorStop(0.3, `rgba(232, 255, 255, ${0.5 + Math.sin(t * 0.4) * 0.1})`);
      highlightGradient.addColorStop(0.6, `rgba(184, 248, 255, ${0.3 + Math.sin(t * 0.3) * 0.1})`);
      highlightGradient.addColorStop(1, "transparent");
      ctx.fillStyle = highlightGradient;
      ctx.beginPath();
      ctx.arc(
        centerX - radius * 0.4 + Math.sin(t * 0.2) * 10,
        centerY - radius * 0.5 + Math.cos(t * 0.15) * 8,
        radius * 0.7,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Highlight secundario superior derecho
      const highlightGradient2 = ctx.createRadialGradient(
        centerX + radius * 0.35,
        centerY - radius * 0.45,
        0,
        centerX + radius * 0.35,
        centerY - radius * 0.45,
        radius * 0.5
      );
      highlightGradient2.addColorStop(0, `rgba(255, 255, 255, ${0.5 + Math.sin(t * 0.6) * 0.1})`);
      highlightGradient2.addColorStop(0.5, `rgba(200, 250, 255, ${0.3 + Math.sin(t * 0.5) * 0.1})`);
      highlightGradient2.addColorStop(1, "transparent");
      ctx.fillStyle = highlightGradient2;
      ctx.beginPath();
      ctx.arc(
        centerX + radius * 0.35 + Math.sin(t * 0.25) * 8,
        centerY - radius * 0.45 + Math.cos(t * 0.2) * 6,
        radius * 0.5,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioLevel, isListening]);

  return (
    <div className="realistic-water-orb-wrapper">
      <canvas ref={canvasRef} className="orb-canvas" />
    </div>
  );
};

export default RealisticWaterOrb;
