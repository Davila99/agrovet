// Shader de GLOW - Post-procesamiento EXACTO del shader original
export const glowVertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const glowFragmentShader = `
precision highp float;

uniform vec2 screen;
uniform sampler2D prev;
uniform vec3 color;

varying vec2 vUv;

// DEFINES EXACTOS DEL SHADER ORIGINAL
#define glowSize 10.0
#define glowIntensity 0.5
#define glowDirections 16.0
#define glowQuality 6.0
#define glowColor color

float glow(float value, float strength, float dist) {
    return dist + dist / pow(value, strength);
}

const float twoPi = 6.28318530718;

void main() {
    vec2 radius = glowSize / screen;
    vec2 uv = vUv;
    vec4 Color = vec4(0);
    vec4 prevColor = texture2D(prev, uv);
    
    // Aplicar glow direccional (EXACTO del shader original)
    for(float d = 0.0; d < twoPi; d += twoPi / glowDirections) {
        for(float i = 1.0 / glowQuality; i <= 1.0; i += 1.0 / glowQuality) {
            vec2 coords = uv + radius * i * vec2(cos(d), sin(d));
            if (coords.x > 0.0 && coords.x < 1.0 && coords.y > 0.0 && coords.y < 1.0) {
                Color += texture2D(prev, coords);
            }
        }
    }
    
    Color /= glowQuality * glowDirections;
    vec3 finalColor = glowColor * glowIntensity * Color.w;
    
    if (prevColor.w != 0.0) {
        finalColor += prevColor.xyz;
    }
    
    finalColor *= glow(length(finalColor), 0.5, 0.92);
    float finalAlpha = mix(Color.w, prevColor.w, 0.5);
    
    gl_FragColor = vec4(finalColor, finalAlpha);
}
`;
