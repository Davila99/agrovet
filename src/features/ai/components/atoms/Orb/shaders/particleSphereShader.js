// Shader EXACTO del GLSL proporcionado
// Adaptado para WebGL (Three.js) con TODAS las características preservadas

export const vertexShader = `
varying vec3 vPosition;
varying vec2 vUv;

void main() {
    vPosition = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 1.0;
}
`;

export const fragmentShader = `
precision highp float;

uniform vec2 screen;
uniform float time;
uniform sampler2D audioTexture;
uniform int audio_sz;

varying vec3 vPosition;
varying vec2 vUv;

// DEFINES EXACTOS DEL SHADER ORIGINAL
#define particleSize 3.0
#define color vec3(0.0118, 0.1412, 0.3412)
#define opacity 0.05
#define colorIntensityAddStrength 0.2
#define antiAlias 5.0

#define radiusAudioMultiplier 200.0
#define fractalAudioMixing 0.50
#define fractalAudioMultiplier 9.0

#define octaveMultiplier 0.25
#define octaveScale 1.0
#define complexity 3.0
#define fScale 4.6
#define gamma 1.0
#define minVal -5.0
#define maxVal 5.0

#define offset 0.0
#define noiseMultiplier 1.0

#define isRadialDisplacement false
#define displaceX 110.0
#define displaceY 95.0
#define displaceZ 115.0

#define flowX 0.0
#define flowY 0.033
#define flowZ 0.0
#define flowEvolution 0.015

#define sphereRadius 275.0
#define feather 0.45

// Función smooth_audio (simulada)
float smooth_audio(sampler2D audioTex, int size, float index) {
    return texture2D(audioTex, vec2(index, 0.5)).r;
}

// Audio bands EXACTOS
float audioRadius;
float audioFractal1;
float audioFractal2;
float audioFractal3;
float audioFractal4;
float audioFractal5;
float audioFractal6;
float audioFractal7;
float audioFractal8;

void initAudio() {
    audioRadius = max(smooth_audio(audioTexture, audio_sz, 0.1), smooth_audio(audioTexture, audio_sz, 0.15));
    audioFractal1 = max(smooth_audio(audioTexture, audio_sz, 0.2), smooth_audio(audioTexture, audio_sz, 0.25));
    audioFractal2 = max(smooth_audio(audioTexture, audio_sz, 0.3), smooth_audio(audioTexture, audio_sz, 0.35));
    audioFractal3 = max(smooth_audio(audioTexture, audio_sz, 0.4), smooth_audio(audioTexture, audio_sz, 0.45));
    audioFractal4 = max(smooth_audio(audioTexture, audio_sz, 0.5), smooth_audio(audioTexture, audio_sz, 0.55));
    audioFractal5 = max(smooth_audio(audioTexture, audio_sz, 0.6), smooth_audio(audioTexture, audio_sz, 0.65));
    audioFractal6 = max(smooth_audio(audioTexture, audio_sz, 0.7), smooth_audio(audioTexture, audio_sz, 0.75));
    audioFractal7 = max(smooth_audio(audioTexture, audio_sz, 0.8), smooth_audio(audioTexture, audio_sz, 0.85));
    audioFractal8 = max(smooth_audio(audioTexture, audio_sz, 0.9), smooth_audio(audioTexture, audio_sz, 0.95));
}

// PERLIN NOISE 4D - EXACTO DEL SHADER ORIGINAL
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

// FBM3 - EXACTO DEL SHADER ORIGINAL
float fbm3(vec4 p, float displaceX, vec4 flow) {
    vec3 pos = p.xyz + flow.xyz * p.w;
    float value = 0.0;
    float amplitude = 1.0;
    float frequency = fScale;
    
    for(int i = 0; i < int(complexity); i++) {
        value += amplitude * cnoise(vec4(pos * frequency, time * flowEvolution), vec4(289.0));
        frequency *= octaveScale;
        amplitude *= octaveMultiplier;
    }
    
    return value * displaceX * noiseMultiplier + offset;
}

void main() {
    initAudio();
    
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 numParticles = screen;
    
    // Calcular ID de partícula
    vec2 particleID = floor(fragCoord);
    vec2 particleUV = particleID / numParticles;
    
    // Posición base de la partícula en la esfera
    float theta = particleUV.x * 6.28318530718;
    float phi = acos(2.0 * particleUV.y - 1.0);
    
    // Distribución con feather
    float featherOffset = (fract(sin(dot(particleID, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * feather;
    float radiusNormalized = 1.0 + featherOffset;
    
    // Posición 3D en la esfera
    vec3 pos;
    pos.x = sin(phi) * cos(theta);
    pos.y = sin(phi) * sin(theta);
    pos.z = cos(phi);
    
    // Flow
    vec4 flow = vec4(flowX, flowY, flowZ, flowEvolution * time);
    
    // Desplazamiento fractal con audio
    float finalAudio = audioFractal1 * 0.125 + audioFractal2 * 0.125 + audioFractal3 * 0.125 + 
                      audioFractal4 * 0.125 + audioFractal5 * 0.125 + audioFractal6 * 0.125 + 
                      audioFractal7 * 0.125 + audioFractal8 * 0.125;
    
    vec4 p = vec4(pos, time);
    float noiseX = fbm3(p, displaceX, flow);
    float noiseY = fbm3(p, displaceY, flow);
    float noiseZ = fbm3(p, displaceZ, flow);
    
    // Mezclar audio con desplazamiento
    noiseX = mix(noiseX, noiseX * finalAudio * fractalAudioMultiplier, fractalAudioMixing);
    noiseY = mix(noiseY, noiseY * finalAudio * fractalAudioMultiplier, fractalAudioMixing);
    noiseZ = mix(noiseZ, noiseZ * finalAudio * fractalAudioMultiplier, fractalAudioMixing);
    
    vec3 displaced = pos;
    if (isRadialDisplacement) {
        displaced += pos * noiseX * 0.01;
    } else {
        displaced.x += noiseX * 0.01;
        displaced.y += noiseY * 0.01;
        displaced.z += noiseZ * 0.01;
    }
    
    // Radio con audio
    float radius = sphereRadius + audioRadius * radiusAudioMultiplier;
    vec3 finalPos = displaced * radius * radiusNormalized;
    
    // Proyectar a 2D
    vec2 projected = finalPos.xy;
    
    // Distancia al pixel actual
    float dist = length(fragCoord - screen * 0.5 - projected);
    
    // Renderizar partícula si está cerca
    if (dist < particleSize) {
        // Anti-aliasing
        float alpha = 1.0 - smoothstep(particleSize - antiAlias, particleSize, dist);
        
        // Color con opacidad
        gl_FragColor = vec4(color, opacity * alpha);
    } else {
        discard;
    }
}
`;
