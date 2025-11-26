import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { fragmentShader, vertexShader } from "./shaders/particleSphereShader";
import { glowFragmentShader, glowVertexShader } from "./shaders/glowShader";

/**
 * Atom: ParticleSphere
 * Esfera de partículas EXACTA del shader GLSL proporcionado
 * Con desplazamiento fractal, audio reactivity, y glow post-processing
 */

function ParticleSphereInner({ analyser, audioLevel }) {
    const meshRef = useRef();
    const glowRef = useRef();
    const audioTextureRef = useRef(null);
    const renderTargetRef = useRef(null);
    const { gl, scene, camera, size } = useThree();

    // Crear textura de audio
    useEffect(() => {
        const audioData = new Float32Array(256);
        audioTextureRef.current = new THREE.DataTexture(
            audioData,
            256,
            1,
            THREE.RedFormat,
            THREE.FloatType
        );
        audioTextureRef.current.needsUpdate = true;

        // Crear render target para el efecto de glow
        renderTargetRef.current = new THREE.WebGLRenderTarget(size.width, size.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
        });

        return () => {
            if (renderTargetRef.current) {
                renderTargetRef.current.dispose();
            }
        };
    }, [size]);

    // Actualizar audio data
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
            const binSize = Math.floor(dataArray.length / 256);

            for (let i = 0; i < 256; i++) {
                let sum = 0;
                for (let j = 0; j < binSize && i * binSize + j < dataArray.length; j++) {
                    sum += dataArray[i * binSize + j];
                }
                audioData[i] = sum / binSize / 255.0;
            }

            audioTextureRef.current.needsUpdate = true;
            requestAnimationFrame(updateAudio);
        };

        updateAudio();
    }, [analyser]);

    const uniforms = useMemo(
        () => ({
            screen: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            time: { value: 0 },
            audioTexture: { value: audioTextureRef.current },
            audio_sz: { value: 256 },
        }),
        []
    );

    const glowUniforms = useMemo(
        () => ({
            screen: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            prev: { value: null },
            color: { value: new THREE.Vector3(0.0118, 0.1412, 0.3412) },
        }),
        []
    );

    // Actualizar tamaño de pantalla
    useEffect(() => {
        const handleResize = () => {
            uniforms.screen.value.set(window.innerWidth, window.innerHeight);
            glowUniforms.screen.value.set(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [uniforms, glowUniforms]);

    // Animar tiempo y aplicar post-processing
    useFrame((state) => {
        if (meshRef.current && audioTextureRef.current) {
            uniforms.time.value = state.clock.elapsedTime;
            uniforms.audioTexture.value = audioTextureRef.current;

            // Renderizar partículas a render target
            const currentRenderTarget = gl.getRenderTarget();
            gl.setRenderTarget(renderTargetRef.current);
            gl.clear();
            gl.render(scene, camera);

            // Aplicar glow pass
            gl.setRenderTarget(currentRenderTarget);
            if (glowRef.current) {
                glowUniforms.prev.value = renderTargetRef.current.texture;
            }
        }
    });

    // Crear geometría de pantalla completa para las partículas
    const geometry = useMemo(() => {
        return new THREE.PlaneGeometry(2, 2);
    }, []);

    return (
        <>
            {/* Mesh de partículas */}
            <mesh ref={meshRef} geometry={geometry}>
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    transparent={true}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Glow post-processing */}
            <mesh ref={glowRef} geometry={geometry}>
                <shaderMaterial
                    vertexShader={glowVertexShader}
                    fragmentShader={glowFragmentShader}
                    uniforms={glowUniforms}
                    transparent={true}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
        </>
    );
}

export default function ParticleSphere({ analyser, audioLevel = 0 }) {
    return (
        <div style={{ width: "100%", height: "100vh", background: "#FFFFFF" }}>
            <Canvas camera={{ position: [0, 0, 1], fov: 50 }}>
                <ParticleSphereInner analyser={analyser} audioLevel={audioLevel} />
            </Canvas>
        </div>
    );
}
