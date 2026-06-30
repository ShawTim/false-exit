import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

// Vignette + film grain (cheap, custom)
const FinaleShader = {
  uniforms: {
    tDiffuse: { value: null },
    uVignette: { value: 1.0 },
    uGrain: { value: 0.04 },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uVignette;
    uniform float uGrain;
    uniform float uTime;
    varying vec2 vUv;
    float rand(vec2 co){ return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453); }
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 d = vUv - 0.5;
      float vig = smoothstep(0.85, 0.25, dot(d, d) * 2.0 * uVignette);
      c.rgb *= mix(1.0, vig, 0.55);
      float g = (rand(vUv + fract(uTime)) - 0.5) * uGrain;
      c.rgb += g;
      gl_FragColor = c;
    }
  `,
};

export function createPostFX({ renderer, scene, camera, mobile = false }) {
  let composer = null;
  let finalePass = null;
  let bloomPass = null;

  try {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const w = window.innerWidth;
    const h = window.innerHeight;
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      mobile ? 0.25 : 0.4,  // strength
      mobile ? 0.3 : 0.5,   // radius
      0.95                  // threshold (only strong emissives bloom, not lit textures)
    );
    composer.addPass(bloomPass);

    finalePass = new ShaderPass(FinaleShader);
    finalePass.material.uniforms.uGrain.value = mobile ? 0.03 : 0.045;
    composer.addPass(finalePass);

    composer.addPass(new OutputPass());
    composer.setSize(w, h);
  } catch (e) {
    console.warn("[postfx] disabled:", e.message);
    composer = null;
  }

  function render() {
    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  function setSize(w, h) {
    if (!composer) return;
    composer.setSize(w, h);
    bloomPass?.setSize(w, h);
  }

  function update(dt) {
    if (finalePass) finalePass.material.uniforms.uTime.value += dt;
  }

  return { render, setSize, update, get enabled() { return !!composer; } };
}
