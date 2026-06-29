import * as THREE from "three";

export function createEngine({ container } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101624);
  scene.fog = new THREE.FogExp2(0x0e1320, 0.018);

  const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.05, 200);
  camera.position.set(0, 1.7, 0);

  const clock = new THREE.Clock();
  let onFrame = () => {};
  let running = false;
  let rafId = 0;

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);

  function loop() {
    rafId = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    onFrame(dt);
    renderer.render(scene, camera);
  }

  function start(cb) {
    if (cb) onFrame = cb;
    if (running) return;
    running = true;
    clock.start();
    loop();
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  function dispose() {
    stop();
    window.removeEventListener("resize", resize);
    renderer.dispose();
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  }

  return { renderer, scene, camera, clock, start, stop, resize, dispose };
}
