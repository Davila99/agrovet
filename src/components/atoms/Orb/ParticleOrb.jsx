import React, { useEffect, useRef } from "react";

// Parámetros basados en el código GLSL proporcionado
const CONFIG = {
    // 1. Particle size and number
    numParticles: 800, // Más partículas para mayor densidad
    particleSize: 3,

    // 2. Particle Color, Opacity and Glow
    color: { r: 0, g: 180, b: 255 }, // Cyan brillante para máxima visibilidad
    opacity: 0.8, // Mucho más opaco
    colorIntensityAddStrength: 0.2,
    antiAlias: 5.0,

    glowSize: 25.0, // Glow mucho más grande
    glowIntensity: 1.5, // Intensidad aumentada
    glowDirections: 16.0,
    glowQuality: 8.0, // Más calidad de glow

    // 3. Audio Influence
    radiusAudioMultiplier: 200,
    fractalAudioMixing: 0.50,
    fractalAudioMultiplier: 9.0,

    // 4. Fractal Field Controls
    octaveMultiplier: 0.25,
    octaveScale: 1.0,
    complexity: 3,
    fScale: 4.6,

    // 5. Displacement and Flow Controls
    displaceX: 110,
    displaceY: 95,
    displaceZ: 115,
    flowX: 0.0,
    flowY: 0.033,
    flowZ: 0.0,
    flowEvolution: 0.015,

    // 6. Sphere Controls
    sphereRadius: 140, // Ajustado para canvas 500x500
    feather: 0.45,
};

export default function ParticleOrb({ isListening, audioLevel = 0 }) {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animationFrameRef = useRef(null);
    const timeRef = useRef(0);

    // Función de ruido simplificado (Simplex/Perlin simulado)
    const noise = (x, y, z = 0) => {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = x * x * (3 - 2 * x);
        const v = y * y * (3 - 2 * y);
        const w = z * z * (3 - 2 * z);

        const hash = (i) => {
            i = ((i << 13) ^ i) - (i >>> 21);
            return ((i * (i * i * 15731 + 789221) + 1376312589) & 0x7fffffff) / 0x7fffffff;
        };

        const a = hash(X + hash(Y + hash(Z)));
        const b = hash(X + 1 + hash(Y + hash(Z)));
        const c = hash(X + hash(Y + 1 + hash(Z)));
        const d = hash(X + 1 + hash(Y + 1 + hash(Z)));

        const k0 = a;
        const k1 = b - a;
        const k2 = c - a;
        const k3 = d - c - b + a;

        return k0 + k1 * u + k2 * v + k3 * u * v;
    };

    // Fractal Brownian Motion (FBM) para desplazamiento orgánico
    const fbm = (x, y, z, octaves = CONFIG.complexity) => {
        let value = 0;
        let amplitude = 1;
        let frequency = CONFIG.fScale;

        for (let i = 0; i < octaves; i++) {
            value += amplitude * noise(x * frequency, y * frequency, z * frequency);
            frequency *= CONFIG.octaveScale;
            amplitude *= CONFIG.octaveMultiplier;
        }

        return value;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Inicializar partículas en una distribución esférica
        if (particlesRef.current.length === 0) {
            for (let i = 0; i < CONFIG.numParticles; i++) {
                // Distribución esférica usando coordenadas esféricas
                const theta = Math.random() * Math.PI * 2; // ángulo azimutal
                const phi = Math.acos(2 * Math.random() - 1); // ángulo polar

                // Distribución en la banda (feather) alrededor de la esfera
                const featherOffset = (Math.random() - 0.5) * CONFIG.feather;
                const radiusNormalized = 1 + featherOffset;

                particlesRef.current.push({
                    theta,
                    phi,
                    radiusNormalized,
                    size: CONFIG.particleSize * (0.5 + Math.random() * 0.5),
                    alpha: CONFIG.opacity + Math.random() * 0.03,
                    noiseOffset: Math.random() * 1000,
                    pulsePhase: Math.random() * Math.PI * 2,
                });
            }
        }

        const update = () => {
            timeRef.current += 0.016;
            const time = timeRef.current;

            // Fondo transparente - las partículas forman la esfera
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            ctx.translate(centerX, centerY);

            // Calcular influencia del audio
            const audioInfluence = isListening ? audioLevel : 0;
            const audioRadius = audioInfluence * CONFIG.radiusAudioMultiplier;
            const audioFractal = audioInfluence * CONFIG.fractalAudioMultiplier;

            // Radio base con pulsación suave
            const basePulse = Math.sin(time * 0.5) * 0.05;
            const currentRadius = CONFIG.sphereRadius * (1 + basePulse) + audioRadius;

            // Buffer para almacenar posiciones y aplicar glow después
            const particlePositions = [];

            // Dibujar partículas
            particlesRef.current.forEach((p) => {
                // Rotación lenta de las partículas
                const flowTheta = p.theta + time * CONFIG.flowY;

                // Calcular posición base en la esfera
                const x = Math.sin(p.phi) * Math.cos(flowTheta);
                const y = Math.sin(p.phi) * Math.sin(flowTheta);
                const z = Math.cos(p.phi);

                // Aplicar desplazamiento fractal
                const noiseTime = time * CONFIG.flowEvolution;
                const fractalDisplacement = fbm(
                    x * 0.5 + noiseTime + p.noiseOffset,
                    y * 0.5 + noiseTime,
                    z * 0.5 + noiseTime
                );

                // Mezclar audio con fractal
                const mixedDisplacement = fractalDisplacement * (1 - CONFIG.fractalAudioMixing) +
                    fractalDisplacement * audioFractal * CONFIG.fractalAudioMixing;

                // Aplicar desplazamiento a la posición
                const displacedX = x + mixedDisplacement * CONFIG.displaceX * 0.01;
                const displacedY = y + mixedDisplacement * CONFIG.displaceY * 0.01;
                const displacedZ = z + mixedDisplacement * CONFIG.displaceZ * 0.01;

                // Proyección 2D (simple orthographic)
                const scale = currentRadius * p.radiusNormalized;
                const px = displacedX * scale;
                const py = displacedY * scale;
                const pz = displacedZ * scale;

                // Depth-based opacity (partículas más alejadas son más tenues)
                const depthFactor = (pz + scale) / (scale * 2);
                const finalAlpha = p.alpha * (0.3 + depthFactor * 0.7) * (1 + audioInfluence * 2);

                particlePositions.push({ px, py, pz, size: p.size, alpha: finalAlpha, depthFactor });
            });

            // Ordenar por profundidad (dibujar las más lejanas primero)
            particlePositions.sort((a, b) => a.pz - b.pz);

            // Dibujar partículas con glow
            particlePositions.forEach(({ px, py, size, alpha, depthFactor }) => {
                // Color del orbe (cyan brillante y muy visible)
                const glowSize = CONFIG.glowSize * (0.8 + depthFactor * 0.5);

                for (let i = 1; i <= CONFIG.glowQuality; i++) {
                    const glowRadius = size + (glowSize * i / CONFIG.glowQuality);
                    const glowAlpha = alpha * CONFIG.glowIntensity * (1 - i / (CONFIG.glowQuality * 1.2));

                    ctx.beginPath();
                    const gradient = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
                    gradient.addColorStop(0, `rgba(100, 220, 255, ${glowAlpha})`);
                    gradient.addColorStop(0.5, `rgba(${CONFIG.color.r + 50}, ${CONFIG.color.g + 50}, ${CONFIG.color.b}, ${glowAlpha * 0.6})`);
                    gradient.addColorStop(1, `rgba(${CONFIG.color.r}, ${CONFIG.color.g}, ${CONFIG.color.b}, 0)`);
                    ctx.fillStyle = gradient;
                    ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Partícula central brillante
                ctx.beginPath();
                ctx.fillStyle = `rgba(100, 220, 255, ${alpha})`;
                ctx.shadowBlur = 20;
                ctx.shadowColor = `rgba(100, 220, 255, ${alpha})`;
                ctx.arc(px, py, size * 1.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Núcleo ultra brillante
                ctx.beginPath();
                ctx.fillStyle = `rgba(200, 240, 255, ${Math.min(1, alpha * 1.5)})`;
                ctx.arc(px, py, size * 0.7, 0, Math.PI * 2);
                ctx.fill();
            });

            // Agregar líneas de flujo que conectan partículas cercanas
            if (audioInfluence > 0.1) {
                ctx.strokeStyle = `rgba(100, 220, 255, ${0.15 * audioInfluence})`;
                ctx.lineWidth = 1;

                for (let i = 0; i < Math.min(particlePositions.length, 100); i += 5) {
                    const p1 = particlePositions[i];
                    const p2 = particlePositions[(i + 5) % particlePositions.length];

                    const dx = p1.px - p2.px;
                    const dy = p1.py - p2.py;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < currentRadius * 0.3) {
                        ctx.beginPath();
                        ctx.moveTo(p1.px, p1.py);
                        ctx.lineTo(p2.px, p2.py);
                        ctx.stroke();
                    }
                }
            }

            ctx.restore();
            animationFrameRef.current = requestAnimationFrame(update);
        };

        update();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isListening, audioLevel]);

    return (
        <canvas
            ref={canvasRef}
            width={500}
            height={500}
            style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
            }}
        />
    );
}
