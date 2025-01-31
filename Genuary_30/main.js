import * as THREE from 'three';

let scene, camera, renderer;
let time = 0;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 800);
    document.getElementById('container').appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector3(400, 800, 1) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 iResolution;
            uniform float iTime;
            
            #define MAX_STEPS 100
            #define MAX_DIST 100.0
            #define SURF_DIST 0.01

            // Simplified moon function for horizon placement
            vec3 drawMoon(vec2 uv, float horizon) {
                // Moon position calculation - place it on the horizon
                vec2 moonPos = vec2(0.0, horizon);  // Center horizontally, at horizon level
                float moonSize = 0.3;               // Larger size for distance
                
                // Basic moon shape
                float d = length(uv - moonPos);
                float moonShape = 1.0 - smoothstep(moonSize - 0.01, moonSize, d);
                
                // Cut off bottom half at horizon
                moonShape *= step(horizon, uv.y);
                
                // Moon color (warm glow for distance)
                vec3 moonColor = vec3(1.0, 0.95, 0.8);
                
                // Add simple craters only to visible portion
                vec2 moonUV = (uv - moonPos) / moonSize;
                if(uv.y > horizon) {
                    float crater1 = 1.0 - smoothstep(0.2, 0.25, length(moonUV - vec2(0.2, 0.2)));
                    float crater2 = 1.0 - smoothstep(0.15, 0.2, length(moonUV - vec2(-0.3, 0.3)));
                    float crater3 = 1.0 - smoothstep(0.25, 0.3, length(moonUV - vec2(0.1, 0.4)));
                    
                    float craters = crater1 + crater2 + crater3;
                    moonColor *= (1.0 - craters * 0.3);
                }
                
                // Add distance haze
                moonColor = mix(moonColor, vec3(0.9, 0.4, 0.3), 0.3);
                
                // Add glow
                float glow = 1.0 - smoothstep(moonSize, moonSize + 0.2, d);
                vec3 glowColor = vec3(0.9, 0.5, 0.3) * 0.5;
                
                return (moonColor * moonShape + glowColor * glow) * step(d, moonSize + 0.2);
            }

            // Your existing terrain functions
            float hash(float n) { return fract(sin(n)*753.5453123); }
            
            float noise(vec3 x) {
                vec3 p = floor(x);
                vec3 f = fract(x);
                f = f*f*(3.0-2.0*f);
                float n = p.x + p.y*157.0 + 113.0*p.z;
                return mix(
                    mix(mix(hash(n+0.0), hash(n+1.0), f.x),
                        mix(hash(n+157.0), hash(n+158.0), f.x), f.y),
                    mix(mix(hash(n+113.0), hash(n+114.0), f.x),
                        mix(hash(n+270.0), hash(n+271.0), f.x), f.y), f.z);
            }

            float fbm(vec3 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                for (int i = 0; i < 7; i++) {
                    value += amplitude * noise(p * frequency);
                    amplitude *= 0.5;
                    frequency *= 2.0;
                }
                return value;
            }

            float getHeight(vec2 p) {
                float h = 0.0;
                h += fbm(vec3(p * 0.5, iTime * 0.1));
                return h;
            }

            float sceneSDF(vec3 p) {
                float ground = p.y - getHeight(p.xz) * 2.0;
                return ground;
            }

            vec3 getNormal(vec3 p) {
                float d = sceneSDF(p);
                vec2 e = vec2(0.01, 0.0);
                vec3 n = d - vec3(
                    sceneSDF(p - e.xyy),
                    sceneSDF(p - e.yxy),
                    sceneSDF(p - e.yyx));
                return normalize(n);
            }

            float rayMarch(vec3 ro, vec3 rd) {
                float dO = 0.0;
                for(int i = 0; i < MAX_STEPS; i++) {
                    vec3 p = ro + rd * dO;
                    float dS = sceneSDF(p);
                    dO += dS;
                    if(abs(dS) < SURF_DIST || dO > MAX_DIST) break;
                }
                return dO;
            }

            void main() {
                vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
                
                // Original terrain rendering
                float camHeight = 2.0;
                vec3 ro = vec3(sin(iTime * 0.5) * 3.0, camHeight, -6.0 + iTime);
                vec3 lookAt = vec3(0.0, 0.0, 4.0 + iTime);
                
                vec3 forward = normalize(lookAt - ro);
                vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
                vec3 up = cross(forward, right);
                vec3 rd = normalize(forward + right * uv.x + up * uv.y);
                
                float d = rayMarch(ro, rd);
                vec3 p = ro + rd * d;
                
                vec3 col = vec3(0.0);
                
                // Calculate horizon line for moon placement
                float horizon = 0.1; // Adjust this value to move moon up/down
                
                if(d < MAX_DIST) {
                    vec3 n = getNormal(p);
                    vec3 baseColor = vec3(0.7, 0.2, 0.1);
                    float height = p.y;
                    baseColor = mix(baseColor, vec3(0.9, 0.3, 0.2), smoothstep(0.0, 2.0, height));
                    vec3 lightDir = normalize(vec3(0.5, 0.8, 0.3));
                    float diff = max(dot(n, lightDir), 0.0);
                    float fog = 1.0 - exp(-0.1 * d);
                    vec3 fogColor = vec3(0.7, 0.3, 0.2);
                    col = baseColor * diff;
                    col = mix(col, fogColor, fog);
                } else {
                    float skyGradient = uv.y + 0.5;
                    col = mix(vec3(0.7, 0.3, 0.2), vec3(0.9, 0.4, 0.3), skyGradient);
                    
                    // Add moon only in sky area
                    vec3 moonCol = drawMoon(uv, horizon);
                    col = mix(col, moonCol, moonCol.r);
                }
                
                // Final color adjustments
                col = pow(col, vec3(0.4545));
                
                gl_FragColor = vec4(col, 1.0);
            }
        `
    });

    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    scene.children[0].material.uniforms.iTime.value = time;
    renderer.render(scene, camera);
}

init();