uniform float uTime;
uniform float uTimeline;
uniform int uStartIndex;
uniform int uEndIndex;
uniform sampler2D uImage0;
uniform sampler2D uImage1;
uniform sampler2D uImage2;
uniform sampler2D uImage3;

varying vec2 vUv;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = p * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

vec4 sampleColor(int index, vec2 uv) {
    if (index == 0) return texture2D(uImage0, uv);
    else if (index == 1) return texture2D(uImage1, uv);
    else if (index == 2) return texture2D(uImage2, uv);
    else return texture2D(uImage3, uv);
}

void main() {
    vec2 uv = vUv;
    float wave = fbm(uv * 3.5 + uTime / 20.0);
    float strength = smoothstep(0.0, 1.0, uTimeline) - smoothstep(1.0, 2.0, uTimeline);
    float distort = mix(1.0, 1.2 + strength * wave, strength);
    
    uv -= 0.5;
    uv *= distort;
    uv += 0.5;
    
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
    
    vec4 startTexture = sampleColor(uStartIndex, uv);
    vec4 endTexture = sampleColor(uEndIndex, uv);
    
    float changeTimeline = smoothstep(0.0, 2.0, uTimeline);
    float transition = smoothstep(changeTimeline - 0.2, changeTimeline + 0.2, wave);
    
    vec4 color = mix(endTexture, startTexture, transition);
    gl_FragColor = color;
}