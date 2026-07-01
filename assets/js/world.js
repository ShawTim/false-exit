import * as THREE from "three";
import {
  box,
  M,
  makeInteractable,
  createDoor,
  createKeycard,
  createClue,
  createLever,
  createMirror,
  createLaser,
  createPlate,
  createPushBox,
  createCircuit,
  flicker,
  createItem,
  createCodeLock,
  createSlot,
  createContainer,
  createValve,
  createKeypadButton,
  createStatusLight,
} from "./entities.js";
import { makeNormalMap, makeRoughnessMap } from "./textures.js";
import { prop } from "./models.js";

const WIDTH = 15;
const DEPTH = 13;
const HEIGHT = 4.6;
const DOOR_W = 2.0;

const _floorN = makeNormalMap({ size: 256, scale: 10, strength: 1.1, octaves: 2, seed: 3 });
_floorN.repeat.set(3, 3);
const _wallN = makeNormalMap({ size: 256, scale: 14, strength: 0.8, octaves: 2, seed: 11 });
_wallN.repeat.set(2, 1.2);
const _floorR = makeRoughnessMap({ size: 128, scale: 8, seed: 5 });
_floorR.repeat.set(3, 3);

const FLOOR_MAT = new THREE.MeshStandardMaterial({
  color: 0x46506a, roughness: 0.6, metalness: 0.12,
  normalMap: _floorN, normalScale: new THREE.Vector2(0.6, 0.6),
  roughnessMap: _floorR,
});
const CEIL_MAT = new THREE.MeshStandardMaterial({ color: 0x2c3548, roughness: 1 });
const WALL_MAT = new THREE.MeshStandardMaterial({
  color: 0x556480, roughness: 0.75,
  normalMap: _wallN, normalScale: new THREE.Vector2(0.4, 0.4),
});
const TRIM_MAT = new THREE.MeshStandardMaterial({ color: 0x2a3548, roughness: 0.7 });

/* ---------------- helpers ---------------- */
function addWall(ctx, x, z, w, d, h = HEIGHT, mat = WALL_MAT, yBase = 0) {
  const mesh = box(w, h, d, mat);
  mesh.position.set(x, yBase + h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  ctx.root.add(mesh);
  ctx.colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
  return mesh;
}

function addShell(ctx, { frontGaps = [0] } = {}) {
  // floor + ceiling
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(WIDTH, DEPTH), FLOOR_MAT);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  ctx.root.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(WIDTH, DEPTH), CEIL_MAT);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = HEIGHT;
  ceil.receiveShadow = true;
  ctx.root.add(ceil);

  // grid overlay
  const grid = new THREE.GridHelper(Math.max(WIDTH, DEPTH), Math.max(WIDTH, DEPTH), 0x2a3a55, 0x18202e);
  grid.position.y = 0.02;
  ctx.root.add(grid);

  const halfW = WIDTH / 2;
  const halfD = DEPTH / 2;
  const t = 0.4;

  // back wall (+Z) full
  addWall(ctx, 0, halfD, WIDTH, t);
  // side walls
  addWall(ctx, -halfW, 0, t, DEPTH);
  addWall(ctx, halfW, 0, t, DEPTH);
  // front wall (-Z) with gaps
  const gaps = [-halfW, ...frontGaps.sort((a, b) => a - b).flatMap((g) => [g - DOOR_W / 2, g + DOOR_W / 2]), halfW];
  for (let i = 0; i < gaps.length; i += 2) {
    const x0 = gaps[i];
    const x1 = gaps[i + 1];
    const w = x1 - x0;
    if (w <= 0.01) continue;
    addWall(ctx, (x0 + x1) / 2, -halfD, w, t);
  }
  for (const gx of frontGaps) {
    const lintel = box(DOOR_W, HEIGHT - 3.1, t, TRIM_MAT);
    lintel.position.set(gx, 3.1 + (HEIGHT - 3.1) / 2, -halfD);
    lintel.castShadow = true;
    lintel.receiveShadow = true;
    ctx.root.add(lintel);
  }
}

function addLight(ctx, color, intensity, x, y, z, range = 8, shadow = false) {
  const p = new THREE.PointLight(color, intensity, range);
  p.position.set(x, y, z);
  if (shadow && !ctx.mobile) {
    p.castShadow = true;
    p.shadow.mapSize.set(1024, 1024);
    p.shadow.camera.near = 0.4;
    p.shadow.camera.far = 26;
    p.shadow.bias = -0.0009;
    p.shadow.radius = 3;
  }
  ctx.root.add(p);
  return p;
}

function addAmbient(ctx) {
  const a = new THREE.AmbientLight(0xb8c8e8, 1.0);
  ctx.root.add(a);
  const hemi = new THREE.HemisphereLight(0xc8d8f0, 0x404a60, 0.9);
  ctx.root.add(hemi);
}

// atmospheric dust motes drifting in the room volume
function addDust(ctx, count) {
  const n = ctx.mobile ? Math.min(count, 120) : count;
  const positions = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    positions[i * 3] = (Math.random() - 0.5) * (WIDTH - 1);
    positions[i * 3 + 1] = Math.random() * (HEIGHT - 0.3) + 0.2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * (DEPTH - 1);
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xbfd8ff,
    size: 0.025,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geom, mat);
  ctx.root.add(points);
  const vels = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    vels[i * 3] = (Math.random() - 0.5) * 0.02;
    vels[i * 3 + 1] = Math.random() * 0.03 + 0.005;
    vels[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
  }
  ctx.updatables.push((dt) => {
    const arr = geom.attributes.position.array;
    for (let i = 0; i < n; i++) {
      arr[i * 3] += vels[i * 3] * dt;
      arr[i * 3 + 1] += vels[i * 3 + 1] * dt;
      arr[i * 3 + 2] += vels[i * 3 + 2] * dt;
      if (arr[i * 3 + 1] > HEIGHT - 0.2) arr[i * 3 + 1] = 0.2;
      if (Math.abs(arr[i * 3]) > (WIDTH - 1) / 2) vels[i * 3] *= -1;
      if (Math.abs(arr[i * 3 + 2]) > (DEPTH - 1) / 2) vels[i * 3 + 2] *= -1;
    }
    geom.attributes.position.needsUpdate = true;
  });
}


function clueNote(ctx, { x, z, rot, title, text }) {
  const c = createClue({ position: new THREE.Vector3(x, 1.1, z), rotation: rot, title, text });
  ctx.root.add(c.group);
  ctx.interactables.push(
    makeInteractable(c.group, {
      prompt: "閱讀線索",
      onInteract: () => ctx.showClue(title, text),
    })
  );
}

function makeExitDoor(ctx, { atX = 0, color = 0x2a3140, emissive = 0x000000, signText }) {
  const door = createDoor({ width: DOOR_W - 0.2, height: 3.0, color, emissive });
  door.group.position.set(atX, 0, -DEPTH / 2 + 0.15);
  ctx.root.add(door.group);
  const blocker = {
    minX: atX - DOOR_W / 2,
    maxX: atX + DOOR_W / 2,
    minZ: -DEPTH / 2 - 0.3,
    maxZ: -DEPTH / 2 + 0.3,
    enabled: true,
  };
  ctx.colliders.push(blocker);
  door.update(0);
  ctx.updatables.push((dt) => door.update(dt));
  return { door, blocker, open() { door.setOpen(true); blocker.enabled = false; } };
}

function exitZoneMet(player, atX = 0) {
  return (
    Math.abs(player.position.x - atX) < DOOR_W / 2 + 0.2 &&
    player.position.z < -DEPTH / 2 + 0.1
  );
}

function disposeObject(obj) {
  obj.traverse((child) => {
    if (child.userData && child.userData._shared) return; // shared cached-model resources
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => m.dispose());
    }
  });
}

/* ==================================================================
 * DECOY system — red-herring furniture / decor with meaningless chatter
 * ================================================================== */
function makePainting(c) {
  const g = new THREE.Group();
  g.add(box(0.95, 1.15, 0.06, TRIM_MAT));
  const cv = box(0.78, 0.98, 0.03, new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }));
  cv.position.z = 0.05;
  g.add(cv);
  return g;
}
function makeChair() {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0x6b4a2b, roughness: 0.8 });
  const seat = box(0.46, 0.07, 0.46, m);
  seat.position.y = 0.46;
  g.add(seat);
  const back = box(0.46, 0.5, 0.07, m);
  back.position.set(0, 0.72, -0.2);
  g.add(back);
  return g;
}
function makeTable() {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0x5a4023, roughness: 0.8 });
  const top = box(1.3, 0.08, 0.75, m);
  top.position.y = 0.74;
  g.add(top);
  [[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]].forEach(([x, z]) => {
    const leg = box(0.09, 0.74, 0.09, m);
    leg.position.set(x, 0.37, z);
    g.add(leg);
  });
  return g;
}
function makeCrate(c = 0x7a5a32) {
  const g = new THREE.Group();
  const cr = box(0.8, 0.8, 0.8, new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }));
  cr.position.y = 0.4;
  g.add(cr);
  return g;
}
function makePlant() {
  const g = new THREE.Group();
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.18, 0.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x3a3030, roughness: 0.8 })
  );
  pot.position.y = 0.2;
  g.add(pot);
  const fol = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.42, 0),
    new THREE.MeshStandardMaterial({ color: 0x2e5d3a, roughness: 0.9, flatShading: true })
  );
  fol.position.y = 0.68;
  g.add(fol);
  return g;
}
function makeClock() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 18), M.darkMetal());
  body.rotation.x = Math.PI / 2;
  g.add(body);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.26, 18), M.note());
  face.position.z = 0.045;
  g.add(face);
  return g;
}
function makeShelf() {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0x4a3a28, roughness: 0.85 });
  const frame = box(1.5, 2.0, 0.42, m);
  frame.position.y = 1.0;
  g.add(frame);
  const cols = [0x884422, 0x224488, 0x448844, 0x884488, 0x888844];
  for (let s = 0; s < 3; s++) {
    for (let b = 0; b < 5; b++) {
      if (Math.random() < 0.3) continue;
      const bk = box(0.1, 0.3 + Math.random() * 0.08, 0.24,
        new THREE.MeshStandardMaterial({ color: cols[(s + b) % cols.length], roughness: 0.8 }));
      bk.position.set(-0.6 + b * 0.26 + Math.random() * 0.04, 0.45 + s * 0.6, 0.05);
      g.add(bk);
    }
  }
  return g;
}
function makeIntercom() {
  const g = new THREE.Group();
  const body = box(0.3, 0.5, 0.12, M.darkMetal());
  body.position.y = 0.25;
  g.add(body);
  const btn = box(0.08, 0.08, 0.04, M.amber());
  btn.position.set(0, 0.32, 0.08);
  g.add(btn);
  return g;
}
function makeVase() {
  const g = new THREE.Group();
  const v = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.2, 0.5, 10),
    new THREE.MeshStandardMaterial({ color: 0x335577, roughness: 0.5 })
  );
  v.position.y = 0.25;
  g.add(v);
  return g;
}

/* ---- room-2 optics decoys ---- */
function makePrism() {
  const g = new THREE.Group();
  const p = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 0.5, 3),
    new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.7, roughness: 0.1, metalness: 0.3 })
  );
  p.position.y = 0.25;
  p.rotation.y = Math.PI / 6;
  g.add(p);
  const base = box(0.4, 0.06, 0.4, M.darkMetal());
  base.position.y = 0.03;
  g.add(base);
  return g;
}
function makeLens() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.04, 8, 18),
    M.darkMetal()
  );
  ring.position.y = 0.7;
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  const stand = box(0.05, 0.7, 0.05, M.darkMetal());
  stand.position.y = 0.35;
  g.add(stand);
  const foot = box(0.3, 0.05, 0.18, M.darkMetal());
  foot.position.y = 0.03;
  g.add(foot);
  return g;
}
function makeInstrument() {
  const g = new THREE.Group();
  const body = box(0.5, 0.4, 0.4, M.darkMetal());
  body.position.y = 0.2;
  g.add(body);
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12), M.amber());
  dial.rotation.x = Math.PI / 2;
  dial.position.set(0, 0.32, 0.21);
  g.add(dial);
  return g;
}
function makeFakeMirrorPanel() {
  const g = new THREE.Group();
  const f = box(0.9, 1.2, 0.08, TRIM_MAT);
  f.position.y = 0.6;
  g.add(f);
  const pane = box(0.74, 1.04, 0.04, new THREE.MeshStandardMaterial({ color: 0x222a38, roughness: 0.3 }));
  pane.position.set(0, 0.6, 0.05);
  g.add(pane);
  return g;
}

/* ---- room-3 warehouse decoys ---- */
function makeBarrel(c = 0x445566) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.9, 14),
    new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0.3 })
  );
  b.position.y = 0.45;
  g.add(b);
  return g;
}
function makePallet() {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.9 });
  for (let i = 0; i < 3; i++) {
    const slat = box(1.1, 0.12, 0.18, m);
    slat.position.set(0, 0.06, -0.4 + i * 0.4);
    g.add(slat);
  }
  return g;
}
function makeTagBoard() {
  const g = new THREE.Group();
  const board = box(0.9, 0.7, 0.05, M.note());
  board.position.y = 1.5;
  g.add(board);
  for (let i = 0; i < 5; i++) {
    const tag = box(0.08, 0.05, 0.01, M.amber());
    tag.position.set(-0.3 + (i % 3) * 0.3, 1.35 - Math.floor(i / 3) * 0.25, 0.04);
    g.add(tag);
  }
  return g;
}
function makeMachine(c = 0x3a4252) {
  const g = new THREE.Group();
  const body = box(0.9, 1.6, 0.7, new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 }));
  body.position.y = 0.8;
  g.add(body);
  const gauge = box(0.3, 0.3, 0.04, M.amber());
  gauge.position.set(0, 1.3, 0.37);
  g.add(gauge);
  const lever = box(0.06, 0.3, 0.06, M.metal());
  lever.position.set(0.3, 1.1, 0.37);
  g.add(lever);
  return g;
}

/* ---- room-4 electrical decoys ---- */
function makeJunctionBox() {
  const g = new THREE.Group();
  const body = box(0.6, 0.8, 0.25, M.darkMetal());
  body.position.y = 1.4;
  g.add(body);
  for (let i = 0; i < 4; i++) {
    const screw = box(0.05, 0.05, 0.03, M.metal());
    screw.position.set(-0.22 + (i % 2) * 0.44, 1.7 - Math.floor(i / 2) * 0.6, 0.14);
    g.add(screw);
  }
  return g;
}
function makeWarningSign(c = 0xffcc33) {
  const g = new THREE.Group();
  const tri = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 0.48, 3),
    new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, emissive: c, emissiveIntensity: 0.3 })
  );
  tri.position.y = 0.24;
  g.add(tri);
  return g;
}
function makeSpool() {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 });
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8), m);
  core.rotation.z = Math.PI / 2;
  core.position.y = 0.2;
  g.add(core);
  [[-1], [1]].forEach(([s]) => {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.04, 12), m);
    disc.rotation.z = Math.PI / 2;
    disc.position.set(s * 0.25, 0.2, 0);
    g.add(disc);
  });
  return g;
}
function makeFuseBin() {
  const g = new THREE.Group();
  const bin = box(0.4, 0.5, 0.3, M.darkMetal());
  bin.position.y = 0.25;
  g.add(bin);
  return g;
}

/* ---- room-5 finale decoys ---- */
function makeReception() {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.7 });
  const top = box(2.4, 0.1, 0.7, m);
  top.position.y = 1.0;
  g.add(top);
  const front = box(2.4, 1.0, 0.1, m);
  front.position.set(0, 0.5, 0.3);
  g.add(front);
  [[-1.1, -0.3], [1.1, -0.3]].forEach(([x, z]) => {
    const leg = box(0.08, 1.0, 0.08, m);
    leg.position.set(x, 0.5, z);
    g.add(leg);
  });
  return g;
}
function makeTurnstile() {
  const g = new THREE.Group();
  const post = box(0.1, 1.0, 0.1, M.metal());
  post.position.y = 0.5;
  g.add(post);
  const arms = new THREE.Group();
  arms.position.y = 1.0;
  for (let i = 0; i < 3; i++) {
    const arm = box(0.7, 0.06, 0.12, M.darkMetal());
    arm.rotation.y = (i * Math.PI * 2) / 3;
    arm.position.x = 0.35;
    arms.add(arm);
  }
  g.add(arms);
  return g;
}
function makeBanner() {
  const g = new THREE.Group();
  const b = box(2.2, 0.5, 0.04, new THREE.MeshStandardMaterial({ color: 0x1a4a2a, roughness: 0.8, emissive: 0x0a2a14, emissiveIntensity: 0.5 }));
  g.add(b);
  return g;
}
function makeExitArrow() {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0x39ff7a, emissive: 0x39ff7a, emissiveIntensity: 1.4 });
  const shaft = box(0.6, 0.22, 0.04, m);
  shaft.position.x = -0.2;
  g.add(shaft);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.3, 3), m);
  head.rotation.z = -Math.PI / 2;
  head.position.x = 0.35;
  g.add(head);
  return g;
}
function makeRope() {
  const g = new THREE.Group();
  const post1 = box(0.08, 1.0, 0.08, M.metal());
  post1.position.set(-0.5, 0.5, 0);
  g.add(post1);
  const post2 = box(0.08, 1.0, 0.08, M.metal());
  post2.position.set(0.5, 0.5, 0);
  g.add(post2);
  const rope = box(1.0, 0.03, 0.03, new THREE.MeshStandardMaterial({ color: 0x8a2222, roughness: 0.8 }));
  rope.position.y = 0.85;
  g.add(rope);
  return g;
}

/* ---- procedural fallbacks for new model types ---- */
function makeCouch() {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0x4a5a6a, roughness: 0.85 });
  const base = box(1.5, 0.5, 0.8, m);
  base.position.y = 0.25;
  g.add(base);
  const back = box(1.5, 0.6, 0.2, m);
  back.position.set(0, 0.55, -0.3);
  g.add(back);
  for (const sx of [-0.45, 0.45]) {
    const arm = box(0.2, 0.5, 0.8, m);
    arm.position.set(sx, 0.35, 0);
    g.add(arm);
  }
  return g;
}
function makeArmchair() {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.85 });
  const base = box(0.9, 0.5, 0.8, m);
  base.position.y = 0.25;
  g.add(base);
  const back = box(0.9, 0.6, 0.2, m);
  back.position.set(0, 0.55, -0.3);
  g.add(back);
  for (const sx of [-0.45, 0.45]) {
    const arm = box(0.15, 0.45, 0.8, m);
    arm.position.set(sx, 0.32, 0);
    g.add(arm);
  }
  return g;
}
function makeBooks() {
  const g = new THREE.Group();
  const cols = [0x884422, 0x224488, 0x448844, 0x884488, 0x888844];
  for (let i = 0; i < 5; i++) {
    const bk = box(0.1, 0.28 + Math.random() * 0.06, 0.2,
      new THREE.MeshStandardMaterial({ color: cols[i % cols.length], roughness: 0.8 }));
    bk.position.set(-0.22 + i * 0.1, 0.14, 0);
    g.add(bk);
  }
  return g;
}
function makeRug() {
  const g = new THREE.Group();
  const rug = box(2.8, 0.02, 1.8, new THREE.MeshStandardMaterial({ color: 0x3a2a3a, roughness: 0.95 }));
  rug.position.y = 0.01;
  g.add(rug);
  const border = box(2.6, 0.025, 1.6, new THREE.MeshStandardMaterial({ color: 0x5a4a5a, roughness: 0.9 }));
  border.position.y = 0.015;
  g.add(border);
  return g;
}
function makeLampStanding() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.06, 12), M.darkMetal());
  base.position.y = 0.03;
  g.add(base);
  const pole = box(0.04, 2.0, 0.04, M.darkMetal());
  pole.position.y = 1.0;
  g.add(pole);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 0.3, 12), M.amber());
  shade.position.y = 2.15;
  g.add(shade);
  return g;
}
function makeLampTable() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.04, 10), M.darkMetal());
  base.position.y = 0.02;
  g.add(base);
  const pole = box(0.03, 0.6, 0.03, M.darkMetal());
  pole.position.y = 0.3;
  g.add(pole);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.18, 0.16, 10), M.amber());
  shade.position.y = 0.65;
  g.add(shade);
  return g;
}
function makePaintingStand() {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.85 });
  for (const sx of [-0.15, 0.15]) {
    const leg = box(0.03, 1.4, 0.03, m);
    leg.position.set(sx, 0.7, 0);
    leg.rotation.z = sx > 0 ? 0.1 : -0.1;
    g.add(leg);
  }
  const canvas = box(0.4, 0.5, 0.02, M.note());
  canvas.position.y = 0.9;
  g.add(canvas);
  return g;
}

function decoy(ctx, { group, model, position, rotation = 0, footprint, label, flavor }) {
  // if a model is registered & cached, prefer it over the procedural fallback
  const visual = model ? prop(model, () => group) : group;
  visual.traverse((o) => {
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
  });
  const p = position instanceof THREE.Vector3 ? position : new THREE.Vector3(position.x, position.y || 0, position.z);
  visual.position.copy(p);
  visual.rotation.y = rotation;
  ctx.root.add(visual);
  if (footprint) {
    ctx.colliders.push({
      minX: p.x - footprint.w / 2, maxX: p.x + footprint.w / 2,
      minZ: p.z - footprint.d / 2, maxZ: p.z + footprint.d / 2,
    });
  }
  const lines = Array.isArray(flavor) ? flavor : [flavor];
  makeInteractable(visual, {
    prompt: label,
    onInteract: () => ctx.toast(lines[Math.floor(Math.random() * lines.length)]),
  });
  ctx.interactables.push(visual);
}

/* ==================================================================
 * SCATTER SYSTEM — mass-place small decorative objects for density
 * ================================================================== */
const SCATTER_COLORS = [0x884422, 0x224488, 0x448844, 0x884488, 0x888844, 0x446688, 0x664422];

function rand(rng, min, max) { return min + rng() * (max - min); }

function makeCup(c) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.1, 8), new THREE.MeshStandardMaterial({ color: c || 0xdddddd, roughness: 0.4 }));
  m.position.y = 0.05;
  g.add(m);
  return g;
}
function makePaper(c) {
  const g = new THREE.Group();
  const m = box(0.15, 0.005, 0.21, new THREE.MeshStandardMaterial({ color: c || 0xd0d8e0, roughness: 0.9, side: THREE.DoubleSide }));
  m.position.y = 0.003;
  m.rotation.z = (Math.random() - 0.5) * 0.3;
  g.add(m);
  return g;
}
function makeCable(c) {
  const g = new THREE.Group();
  const pts = [];
  for (let i = 0; i <= 6; i++) pts.push(new THREE.Vector3((i / 6 - 0.5) * 0.4, Math.sin(i * 1.5) * 0.03, 0));
  const curve = new THREE.CatmullRomCurve3(pts);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.012, 5, false), new THREE.MeshStandardMaterial({ color: c || 0x222222, roughness: 0.7 }));
  g.add(tube);
  return g;
}
function makeTool(c) {
  const g = new THREE.Group();
  const handle = box(0.03, 0.18, 0.03, new THREE.MeshStandardMaterial({ color: 0x6b4a2b, roughness: 0.8 }));
  handle.position.y = 0.09;
  g.add(handle);
  const head = box(0.08, 0.04, 0.04, M.metal());
  head.position.y = 0.2;
  g.add(head);
  return g;
}
function makeDebris(c) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const s = 0.03 + Math.random() * 0.05;
    const m = box(s, s, s, new THREE.MeshStandardMaterial({ color: c || 0x556677, roughness: 0.9 }));
    m.position.set((Math.random() - 0.5) * 0.15, s / 2, (Math.random() - 0.5) * 0.15);
    m.rotation.set(Math.random(), Math.random(), Math.random());
    g.add(m);
  }
  return g;
}
function makeBottle(c) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 8), new THREE.MeshStandardMaterial({ color: c || 0x335577, roughness: 0.3, transparent: true, opacity: 0.7 }));
  body.position.y = 0.07;
  g.add(body);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.035, 0.05, 8), body.material);
  neck.position.y = 0.165;
  g.add(neck);
  return g;
}
function makePlate(c) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.02, 12), new THREE.MeshStandardMaterial({ color: c || 0xcccccc, roughness: 0.3 }));
  m.position.y = 0.01;
  g.add(m);
  return g;
}
function makeBox(c) {
  const g = new THREE.Group();
  const s = 0.1 + Math.random() * 0.08;
  const m = box(s, s * 0.6, s, new THREE.MeshStandardMaterial({ color: c || 0x6b5a3a, roughness: 0.85 }));
  m.position.y = s * 0.3;
  g.add(m);
  return g;
}

const SCATTER_TYPES = [makeCup, makePaper, makeCable, makeTool, makeDebris, makeBottle, makePlate, makeBox, makeBooks];

function scatter(ctx, { zones, count, flavor, label = "查看雜物", models }) {
  const placed = [];
  let seed = 12345;
  const rng = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const flavors = Array.isArray(flavor) ? flavor : [flavor];

  for (let i = 0; i < count; i++) {
    const zone = zones[Math.floor(rng() * zones.length)];
    const x = zone.x + (rng() - 0.5) * zone.w;
    const z = zone.z + (rng() - 0.5) * zone.d;
    const y = zone.y || 0;

    // use a model sometimes
    let group;
    if (models && rng() < 0.3) {
      const modelName = models[Math.floor(rng() * models.length)];
      group = prop(modelName, () => {
        const T = SCATTER_TYPES[Math.floor(rng() * SCATTER_TYPES.length)];
        return T(SCATTER_COLORS[Math.floor(rng() * SCATTER_COLORS.length)]);
      });
    } else {
      const T = SCATTER_TYPES[Math.floor(rng() * SCATTER_TYPES.length)];
      group = T(SCATTER_COLORS[Math.floor(rng() * SCATTER_COLORS.length)]);
    }

    group.position.set(x, y, z);
    group.rotation.y = rng() * Math.PI * 2;
    group.scale.setScalar(0.7 + rng() * 0.6);
    group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    ctx.root.add(group);
    makeInteractable(group, {
      prompt: label,
      onInteract: () => ctx.toast(flavors[Math.floor(rng() * flavors.length)]),
    });
    ctx.interactables.push(group);
    placed.push(group);
  }
  return placed;
}

/* ==================================================================
 * ARCHITECTURAL DETAIL — adds richness to every room shell
 * ================================================================== */
function detailArchitecture(ctx) {
  const halfW = WIDTH / 2;
  const halfD = DEPTH / 2;

  // baseboards along all walls
  const bb = box(0.06, 0.18, 1, new THREE.MeshStandardMaterial({ color: 0x1a2030, roughness: 0.7 }));
  const bbMat = bb.material;
  function baseboard(x, z, w, d) {
    const m = box(w, 0.18, d, bbMat);
    m.position.set(x, 0.09, z);
    m.receiveShadow = true;
    ctx.root.add(m);
  }
  baseboard(0, halfD - 0.03, WIDTH, 0.06);
  baseboard(0, -halfD + 0.03, WIDTH, 0.06);
  baseboard(-halfW + 0.03, 0, 0.06, DEPTH);
  baseboard(halfW - 0.03, 0, 0.06, DEPTH);

  // wall trim / wainscoting cap line (mid-height horizontal bands)
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x3a4458, roughness: 0.6 });
  function trim(x, z, w, d) {
    const m = box(w, 0.05, d, trimMat);
    m.position.set(x, 1.1, z);
    m.receiveShadow = true;
    ctx.root.add(m);
  }
  trim(0, halfD - 0.04, WIDTH, 0.04);
  trim(0, -halfD + 0.04, WIDTH, 0.04);
  trim(-halfW + 0.04, 0, 0.04, DEPTH);
  trim(halfW - 0.04, 0, 0.04, DEPTH);

  // crown molding near ceiling
  function crown(x, z, w, d) {
    const m = box(w, 0.12, d, trimMat);
    m.position.set(x, HEIGHT - 0.18, z);
    m.receiveShadow = true;
    ctx.root.add(m);
  }
  crown(0, halfD - 0.06, WIDTH, 0.06);
  crown(0, -halfD + 0.06, WIDTH, 0.06);
  crown(-halfW + 0.06, 0, 0.06, DEPTH);
  crown(halfW - 0.06, 0, 0.06, DEPTH);

  // floor border inlay
  const inlayMat = new THREE.MeshStandardMaterial({ color: 0x2a3548, roughness: 0.5, metalness: 0.3 });
  const inlay = new THREE.Mesh(new THREE.RingGeometry(0, 0.001, 4), inlayMat); // placeholder
  // 4 border strips
  const bw = 0.08;
  function floorBorder(x, z, w, d) {
    const m = box(w, 0.02, d, inlayMat);
    m.position.set(x, 0.03, z);
    m.receiveShadow = true;
    ctx.root.add(m);
  }
  floorBorder(0, halfD - 0.4, WIDTH - 1, bw);
  floorBorder(0, -halfD + 0.4, WIDTH - 1, bw);
  floorBorder(-halfW + 0.4, 0, bw, DEPTH - 1);
  floorBorder(halfW - 0.4, 0, bw, DEPTH - 1);

  // ceiling light fixtures (hanging) at a few points
  const fixMat = new THREE.MeshStandardMaterial({ color: 0x2a3040, metalness: 0.6, roughness: 0.4 });
  const shadeMat = new THREE.MeshStandardMaterial({ color: 0x4a4030, emissive: 0x3a2a10, emissiveIntensity: 0.4 });
  for (const [fx, fz] of [[-3.5, 2.5], [3.5, 2.5], [-3.5, -3], [3.5, -3]]) {
    const rod = box(0.04, 0.5, 0.04, fixMat);
    rod.position.set(fx, HEIGHT - 0.25, fz);
    ctx.root.add(rod);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.18, 12), shadeMat);
    shade.position.set(fx, HEIGHT - 0.55, fz);
    shade.castShadow = true;
    ctx.root.add(shade);
  }

  // corner pillars (decorative, thin)
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x333c4e, roughness: 0.65 });
  for (const [px, pz] of [[-halfW + 0.3, halfD - 0.3], [halfW - 0.3, halfD - 0.3], [-halfW + 0.3, -halfD + 0.3], [halfW - 0.3, -halfD + 0.3]]) {
    const p = box(0.3, HEIGHT, 0.3, pillarMat);
    p.position.set(px, HEIGHT / 2, pz);
    p.castShadow = true;
    p.receiveShadow = true;
    ctx.root.add(p);
  }

  // air vents high on walls
  const ventMat = new THREE.MeshStandardMaterial({ color: 0x1a1e28, metalness: 0.7, roughness: 0.3 });
  for (const [vx, vz, vr] of [[-halfW + 0.06, 0, 0], [halfW - 0.06, -2, Math.PI], [-2, halfD - 0.06, Math.PI / 2]]) {
    const v = box(0.5, 0.3, 0.03, ventMat);
    v.position.set(vx, HEIGHT - 0.9, vz);
    v.rotation.y = vr;
    ctx.root.add(v);
    // slats
    for (let i = 0; i < 4; i++) {
      const slat = box(0.42, 0.03, 0.01, ventMat);
      slat.position.set(vx, HEIGHT - 1.0 + i * 0.07, vz);
      slat.rotation.y = vr;
      ctx.root.add(slat);
    }
  }
}

function placeRoom1Decoys(ctx) {
  // wall paintings (no collider)
  decoy(ctx, { group: makePainting(0x2a4a6a), model: "painting", position: { x: -WIDTH / 2 + 0.1, y: 2.3, z: 0.5 }, rotation: Math.PI / 2, label: "細看油畫", flavor: [
    "畫入面係一道門。望得耐，好似識呼吸。",
    "畫框後面有空位，但乜都冇。",
    "顏料未乾。畫咗好耐，但永遠未乾。",
  ] });
  decoy(ctx, { group: makePainting(0x5a3a2a), model: "painting", position: { x: WIDTH / 2 - 0.1, y: 2.3, z: -4.8 }, rotation: -Math.PI / 2, label: "細看油畫", flavor: [
    "畫嘅係一個走廊。好似一直延伸落去。",
    "你覺得畫入面有嘢郁咗一下。",
    "簽名嗰欄，寫住你個名。但 你 冇畫過畫。",
  ] });
  decoy(ctx, { group: makePainting(0x3a5a3a), model: "painting", position: { x: 2.6, y: 2.3, z: DEPTH / 2 - 0.1 }, rotation: 0, label: "細看油畫", flavor: [
    "畫嘅係一個出口。但只係畫。",
    "色彩剝落。下面仲係畫。",
  ] });

  // furniture (with collider)
  decoy(ctx, { group: makeChair(), position: { x: -4.2, y: 0, z: 3.6 }, footprint: { w: 0.5, d: 0.5 }, label: "檢查座椅", flavor: [
    "張椅凍冰冰。好似啱啱有人坐過。",
    "坐落去，乜都唔會發生。",
    "椅腳刮花咗地板。",
  ] });
  decoy(ctx, { group: makeChair(), model: "chair", position: { x: -5.0, y: 0, z: 3.6 }, rotation: 0.3, footprint: { w: 0.5, d: 0.5 }, label: "檢查座椅", flavor: [
    "椅墊下面，乜都冇。",
    "坐過呢張椅嘅人，留低咗一個凹位。",
  ] });
  decoy(ctx, { group: makeTable(), model: "table", position: { x: -4.6, y: 0, z: 4.6 }, footprint: { w: 1.3, d: 0.75 }, label: "搜查桌面", flavor: [
    "枱面有杯漬，但冇杯。",
    "抽屜鎖住咗。入面應該乜都冇。",
    "枱底下面，係更多枱底。",
  ] });

  decoy(ctx, { group: makeCrate(0x7a5a32), model: "crate", position: { x: 4.6, y: 0, z: 3.8 }, footprint: { w: 0.8, d: 0.8 }, label: "撬開木箱", flavor: [
    "箱入面得一把鎖。鎖住咗乜？乜都冇。",
    "好重。推唔郁。",
    "掀開，入面係另一個空箱。",
  ] });
  decoy(ctx, { group: makeCrate(0x5a4a3a), model: "crate", position: { x: 5.4, y: 0, z: 3.0 }, footprint: { w: 0.8, d: 0.8 }, label: "撬開木箱", flavor: [
    "入面得一張紙屑：寫住「冇用」。",
    "空嘅。回音好大。",
  ] });

  decoy(ctx, { group: makePlant(), model: "plant", position: { x: 6.2, y: 0, z: 4.8 }, footprint: { w: 0.5, d: 0.5 }, label: "查看盆栽", flavor: [
    "盆栽嘅葉係塑膠。",
    "泥土係畫上去嘅。",
    "澆水落去，水會漏穿個盆。",
  ] });

  decoy(ctx, { group: makeShelf(), model: "bookshelf", position: { x: -6.4, y: 0, z: -3.6 }, footprint: { w: 1.5, d: 0.42 }, label: "翻閱書架", flavor: [
    "書脊全部空白。",
    "抽一本出嚟，係黏死咗嘅。",
    "每本書嘅內容都一樣：空白。",
    "其中一本書，每一頁都寫住「出去」。但冇用。",
  ] });

  decoy(ctx, { group: makeVase(), position: { x: 6.2, y: 0, z: -4.5 }, footprint: { w: 0.4, d: 0.4 }, label: "查看花瓶", flavor: [
    "花瓶入面冇花。",
    "跌落去，冇爛。呢度嘅嘢唔會爛。",
  ] });

  // wall-mounted (no collider)
  decoy(ctx, { group: makeClock(), position: { x: -3.2, y: 3.0, z: DEPTH / 2 - 0.1 }, rotation: 0, label: "睇個鐘", flavor: [
    "個鐘停咗喺 3:33。",
    "指針唔肯行。",
    "秒針倒轉行。",
  ] });
  decoy(ctx, { group: makeIntercom(), position: { x: 3.6, y: 1.5, z: DEPTH / 2 - 0.1 }, rotation: 0, label: "按對講機", flavor: [
    "對講機冇聲。",
    "你講嘢，只有自己嘅回音。",
    "有人應咗一句，但答非所問。",
  ] });

  // ---- second wave: denser furniture ----
  decoy(ctx, { group: makeCouch(), model: "couch", position: { x: 4.0, y: 0, z: -4.0 }, rotation: -Math.PI / 2, footprint: { w: 1.6, d: 3.0 }, label: "搜查梳化", flavor: [
    "梳化係凍嘅。冇人坐過，但有摺痕。",
    "罅隙入面得塵。同埋一張冇用嘅飛。",
    "坐落去，好舒服。但冇嘢發生。",
  ] });
  decoy(ctx, { group: makeTable(), model: "table", position: { x: 5.5, y: 0, z: -1.5 }, footprint: { w: 2.0, d: 2.0 }, label: "搜查圓枱", flavor: [
    "枱面有花瓶。花瓶入面冇花。",
    "枱底有張椅，但拉唔出。",
    "枱面平滑到可以照鏡。但照唔到你。",
  ] });
  decoy(ctx, { group: makeBooks(), model: "books", position: { x: -4.6, y: 0.75, z: 4.6 }, footprint: null, label: "翻閱書堆", flavor: [
    "書堆每本都冇封面。",
    "抽一本：每一頁都係「出去」。冇用。",
    "書脊摸落去係暖嘅。",
  ] });
  decoy(ctx, { group: makeRug(), model: "rug", position: { x: 0, y: 0, z: 0 }, footprint: null, label: "查看地毯", flavor: [
    "地毯下面，同地毯上面，一樣凍。",
    "地毯嘅花紋，係一個迷宮。走唔到出嚟。",
    "踩上去冇聲。呢度乜都冇聲。",
  ] });
  decoy(ctx, { group: makeLampStanding(), model: "lampStanding", position: { x: -5.5, y: 0, z: 5.2 }, footprint: { w: 0.4, d: 0.4 }, label: "查看座地燈", flavor: [
    "座地燈冇插電，但燈泡係暖嘅。",
    "燈罩上面有飛蛾嘅影，但冇飛蛾。",
    "撳個掣。冇反應。",
  ] });
  decoy(ctx, { group: makeLampTable(), model: "lampTable", position: { x: -4.6, y: 0.75, z: 4.0 }, footprint: null, label: "查看枱燈", flavor: [
    "枱燈嘅光，只係畫上去嘅。",
    "燈罩入面，係另一個燈罩。",
  ] });
  decoy(ctx, { group: makePaintingStand(), model: "paintingStand", position: { x: 2.0, y: 0, z: 4.5 }, footprint: { w: 0.5, d: 0.4 }, label: "細看畫架", flavor: [
    "畫架上面係空白畫布。但係濕嘅。",
    "畫布背面寫住：『重複』。",
  ] });
  decoy(ctx, { group: makeVase(), position: { x: 5.5, y: 0, z: -1.5 }, footprint: null, label: "查看花瓶", flavor: [
    "花瓶上面有裂紋，但唔會爛。",
  ] });
  decoy(ctx, { group: makeClock(), position: { x: 3.2, y: 3.0, z: DEPTH / 2 - 0.1 }, label: "睇另一個鐘", flavor: [
    "呢個鐘得針，冇字。",
    "兩根針重疊。永遠重疊。",
  ] });
}

function placeRoom2Decoys(ctx) {
  // non-functional decorative mirrors / optics clutter (beam path is along z=-2 line + emitter col)
  decoy(ctx, { group: makeFakeMirrorPanel(), position: { x: -WIDTH / 2 + 0.15, y: 0, z: 1.5 }, rotation: Math.PI / 2, footprint: { w: 0.9, d: 0.3 }, label: "細看鏡面", flavor: [
    "呢塊鏡唔反光。係畫出嚟嘅。",
    "鏡入面嘅你，慢咗半拍。",
    "摸落去，係凍嘅，但唔滑。",
  ] });
  decoy(ctx, { group: makeFakeMirrorPanel(), position: { x: WIDTH / 2 - 0.15, y: 0, z: -5 }, rotation: -Math.PI / 2, footprint: { w: 0.9, d: 0.3 }, label: "細看鏡面", flavor: [
    "呢塊係普通玻璃，後面係牆。",
    "鏡面有條裂紋，但唔會斷。",
  ] });
  decoy(ctx, { group: makePrism(), position: { x: 5.5, y: 0, z: 4.5 }, footprint: { w: 0.4, d: 0.4 }, label: "查看三稜鏡", flavor: [
    "三稜鏡冇將光拆開。光都冇經過佢。",
    "好靚，但同謎題無關。",
    "擺位擺咗好耐，從來冇用過。",
  ] });
  decoy(ctx, { group: makeLens(), position: { x: -5.5, y: 0, z: 4.5 }, footprint: { w: 0.3, d: 0.2 }, label: "查看透鏡", flavor: [
    "透鏡乜都冇放大。",
    "透過佢望，世界一樣咁模糊。",
  ] });
  decoy(ctx, { group: makeInstrument(), position: { x: 5.8, y: 0, z: 0.5 }, footprint: { w: 0.5, d: 0.4 }, label: "查看儀器", flavor: [
    "錶針指住紅色，但冇插電。",
    "轉個旋鈕，乜都冇發生。",
    "儀器標籤寫住：『僅供裝飾』。",
  ] });
  decoy(ctx, { group: makeInstrument(), position: { x: -5.8, y: 0, z: 0.5 }, footprint: { w: 0.5, d: 0.4 }, label: "查看儀器", flavor: [
    "螢幕顯示『NO SIGNAL』。",
    "按咗所有掣，仲係 NO SIGNAL。",
  ] });
  decoy(ctx, { group: makeShelf(), model: "bookshelf", position: { x: 6.4, y: 0, z: -3 }, rotation: -Math.PI / 2, footprint: { w: 0.42, d: 1.5 }, label: "翻閱光學手冊", flavor: [
    "手冊每一頁都係空白。",
    "其中一本寫住『光唔會呃人』，但下一頁撕走咗。",
  ] });
  decoy(ctx, { group: makePainting(0x1a3a5a), model: "painting", position: { x: 0, y: 2.6, z: DEPTH / 2 - 0.1 }, label: "細看掛圖", flavor: [
    "掛圖畫咗光線折射圖，但標錯咗角度。",
    "圖入面嘅光，唔遵守物理。",
  ] });
  decoy(ctx, { group: makeClock(), position: { x: 3.2, y: 3.2, z: -DEPTH / 2 + 0.1 }, rotation: Math.PI, label: "睇個鐘", flavor: [
    "個鐘倒轉行。",
    "3:33。永遠 3:33。",
  ] });

  // ---- second wave ----
  decoy(ctx, { group: makeTable(), model: "table", position: { x: -5.5, y: 0, z: -4.5 }, footprint: { w: 2.0, d: 2.0 }, label: "搜查實驗枱", flavor: [
    "枱面有焦痕，但冇火源。",
    "抽屜入面得一塊碎鏡。照唔到你。",
    "枱腳有刻痕：『第三次失敗』。",
  ] });
  decoy(ctx, { group: makeBooks(), model: "books", position: { x: -5.5, y: 0.75, z: -4.5 }, footprint: null, label: "翻閱筆記", flavor: [
    "筆記記錄咗每次鏡面角度。但最後一頁撕走咗。",
    "每頁都係同一句：『角度唔啱』。",
  ] });
  decoy(ctx, { group: makeLampStanding(), model: "lampStanding", position: { x: 5.5, y: 0, z: -5.5 }, footprint: { w: 0.4, d: 0.4 }, label: "查看座地燈", flavor: [
    "座地燈嘅光，同激光一樣紅。但冇用。",
    "燈罩入面有塊鏡碎片。",
  ] });
  decoy(ctx, { group: makeRug(), model: "rug", position: { x: 0, y: 0, z: 1 }, footprint: null, label: "查看地毯", flavor: [
    "地毯下面有條裂縫，但乜都冇。",
    "花紋係光線圖。全部指住錯嘅方向。",
  ] });
  decoy(ctx, { group: makeLens(), position: { x: 2.5, y: 0, z: 4.5 }, footprint: { w: 0.3, d: 0.2 }, label: "查看透鏡", flavor: [
    "呢塊透鏡有刮痕。透過佢睇到重影。",
    "摸落去係暖嘅。",
  ] });
  decoy(ctx, { group: makeInstrument(), position: { x: -2.5, y: 0, z: 4.5 }, footprint: { w: 0.5, d: 0.4 }, label: "查看儀器", flavor: [
    "螢幕閃住『CALIBRATING』，永遠 CALIBRATING。",
  ] });
  decoy(ctx, { group: makeFakeMirrorPanel(), position: { x: -WIDTH / 2 + 0.15, y: 0, z: -5 }, rotation: Math.PI / 2, footprint: { w: 0.9, d: 0.3 }, label: "細看鏡面", flavor: [
    "呢塊鏡反射唔到你。只反射牆。",
    "鏡面有霧氣，但摸唔到。",
  ] });
}

function placeRoom3Decoys(ctx) {
  // warehouse clutter (avoid the two push-box paths near z=2.5 and plates at z=-3.5)
  decoy(ctx, { group: makeBarrel(0x335577), position: { x: -6.2, y: 0, z: 5.2 }, footprint: { w: 0.6, d: 0.6 }, label: "查看油桶", flavor: [
    "桶面寫住『易燃』，但入面係空嘅。",
    "搖下，冇聲。完全空。",
    "桶底有個窿，一直都漏緊空氣。",
  ] });
  decoy(ctx, { group: makeBarrel(0x554433), position: { x: -6.2, y: 0, z: 4.0 }, footprint: { w: 0.6, d: 0.6 }, label: "查看油桶", flavor: [
    "入面係泥。",
    "打開，一陣霉味。",
  ] });
  decoy(ctx, { group: makeBarrel(0x553322), position: { x: 6.2, y: 0, z: 5.2 }, footprint: { w: 0.6, d: 0.6 }, label: "查看油桶", flavor: [
    "桶面貼住『出口鑰匙』，但入面乜都冇。",
    "又一個陷阱。",
  ] });
  decoy(ctx, { group: makeCrate(0x666666), model: "crate", position: { x: 6.0, y: 0, z: -4.8 }, footprint: { w: 0.8, d: 0.8 }, label: "撬開固定箱", flavor: [
    "呢個箱釘死咗喺地下，推唔郁。",
    "撬開，入面係水泥。",
    "箱面刻住：『呢個唔係你需要嘅箱』。",
  ] });
  decoy(ctx, { group: makePallet(), position: { x: -5.8, y: 0, z: -4.6 }, footprint: { w: 1.1, d: 0.6 }, label: "查看貨板", flavor: [
    "貨板上得返一層灰。",
    "下面有隻死咗嘅甲蟲。",
  ] });
  decoy(ctx, { group: makeMachine(), position: { x: -6.4, y: 0, z: -1 }, footprint: { w: 0.9, d: 0.7 }, label: "檢查機器", flavor: [
    "機器嗡嗡響，但冇插電。",
    "拉個桿，機器行咗，但乜都冇推動。",
    "螢幕閃住『STANDBY』，永遠 STANDBY。",
  ] });
  decoy(ctx, { group: makeTagBoard(), position: { x: WIDTH / 2 - 0.1, y: 0, z: 0 }, rotation: -Math.PI / 2, label: "查看標籤板", flavor: [
    "所有標籤都寫住『待處理』。",
    "其中一張寫住『出口』，但釘死喺板度。",
    "標籤數目，同你嘅迴圈次數一樣。",
  ] });
  decoy(ctx, { group: makeShelf(), model: "bookshelf", position: { x: -WIDTH / 2 + 0.2, y: 0, z: -4.5 }, rotation: Math.PI / 2, footprint: { w: 0.42, d: 1.5 }, label: "翻閱倉存紀錄", flavor: [
    "紀錄全部空白。",
    "每頁只寫住一個字：『重』。",
    "其中一本係存貨手冊，但所有內容被塗黑。",
  ] });
  decoy(ctx, { group: makeIntercom(), position: { x: 0, y: 1.5, z: DEPTH / 2 - 0.1 }, label: "按對講機", flavor: [
    "對講機傳出風聲。",
    "有人講：『推錯方向喇』，但唔知邊個方向啱。",
  ] });
  decoy(ctx, { group: makeWarningSign(0xffcc33), position: { x: 4.5, y: 0, z: 5.2 }, label: "查看警示牌", flavor: [
    "牌寫住『小心地滑』。地下乾到反光。",
    "另一面乜都冇寫。",
  ] });

  // ---- second wave ----
  decoy(ctx, { group: makeBarrel(0x444444), position: { x: 6.2, y: 0, z: 4.0 }, footprint: { w: 0.6, d: 0.6 }, label: "查看油桶", flavor: [
    "入面係水。但飲唔到——似幻覺。",
  ] });
  decoy(ctx, { group: makeCrate(0x4a3a2a), model: "crate", position: { x: -6.0, y: 0, z: -3.5 }, footprint: { w: 0.8, d: 0.8 }, label: "撬開固定箱", flavor: [
    "入面係另一個箱嘅鎖。無限套娃。",
  ] });
  decoy(ctx, { group: makeMachine(), position: { x: 6.4, y: 0, z: -1 }, footprint: { w: 0.9, d: 0.7 }, label: "檢查機器", flavor: [
    "呢部機噴氣。但噉出嚟嘅係暖嘅。",
    "螢幕閃住『ERROR 404』。",
  ] });
  decoy(ctx, { group: makePallet(), position: { x: 5.8, y: 0, z: 4.6 }, footprint: { w: 1.1, d: 0.6 }, label: "查看貨板", flavor: [
    "貨板上面有水漬。但冇落過雨。",
  ] });
  decoy(ctx, { group: makeLampStanding(), model: "lampStanding", position: { x: -5.5, y: 0, z: 5.5 }, footprint: { w: 0.4, d: 0.4 }, label: "查看座地燈", flavor: [
    "座地燈閃下閃下，好似摩斯密碼。但你唔識解。",
  ] });
  decoy(ctx, { group: makeTable(), model: "table", position: { x: 2.5, y: 0, z: 5.0 }, footprint: { w: 2.0, d: 2.0 }, label: "搜查工作枱", flavor: [
    "枱面有鉛筆痕，寫住『點解出唔到去』。",
    "枱底有把爛咗嘅鎖。",
  ] });
  decoy(ctx, { group: makeBooks(), model: "books", position: { x: 2.5, y: 0.75, z: 5.0 }, footprint: null, label: "翻閱貨單", flavor: [
    "每張貨單都係同一個號碼：你嘅迴圈數。",
  ] });
  decoy(ctx, { group: makeWarningSign(0xff3b3b), position: { x: -4.5, y: 0, z: 5.2 }, label: "查看警示牌", flavor: [
    "牌寫住『禁止離開』。幾好笑。",
  ] });
}

function placeRoom4Decoys(ctx) {
  // electrical room clutter (gems are along z=-5.6 front wall; keep middle/sides free)
  decoy(ctx, { group: makeJunctionBox(), position: { x: -WIDTH / 2 + 0.15, y: 0, z: 1 }, rotation: Math.PI / 2, label: "打開接線箱", flavor: [
    "入面得一條斷咗嘅電線。",
    "螺絲扭唔郁。",
    "電線駁返，乜都冇發生。",
  ] });
  decoy(ctx, { group: makeJunctionBox(), position: { x: WIDTH / 2 - 0.15, y: 0, z: 1 }, rotation: -Math.PI / 2, label: "打開接線箱", flavor: [
    "入面嘅電線全部同一隻色。",
    "你分唔到邊條打邊條。",
  ] });
  decoy(ctx, { group: makeMachine(0x2a3242), position: { x: -5.5, y: 0, z: 3.5 }, footprint: { w: 0.9, d: 0.7 }, label: "檢查配電盤", flavor: [
    "配電盤冇電。",
    "推所有掣，仲係冇電。呢個唔關呢關事。",
    "螢幕寫住『OFFLINE』。",
  ] });
  decoy(ctx, { group: makeSpool(), position: { x: 5.5, y: 0, z: 3.8 }, footprint: { w: 0.5, d: 0.3 }, label: "查看電線轆", flavor: [
    "拉條電線，愈拉愈多，冇盡頭。",
    "電線另一端，乜都冇接。",
  ] });
  decoy(ctx, { group: makeFuseBin(), position: { x: 5.5, y: 0, z: 1.5 }, footprint: { w: 0.4, d: 0.3 }, label: "查看保險絲盒", flavor: [
    "入面全部係燒斷咗嘅保險絲。",
    "換一條新嘅，即刻又燒斷。",
  ] });
  decoy(ctx, { group: makeWarningSign(0xff3b3b), position: { x: -3.5, y: 0, z: 5.2 }, label: "查看警示牌", flavor: [
    "牌寫住『高壓危險』。但你摸到都冇事。",
    "另一面寫住『其實唔危險』。",
  ] });
  decoy(ctx, { group: makeWarningSign(0xffcc33), position: { x: 3.5, y: 0, z: 5.2 }, label: "查看警示牌", flavor: [
    "牌寫住『請勿觸摸』。你摸咗。冇事。",
    "靜電令你頭髮豎起。但門冇開。",
  ] });
  decoy(ctx, { group: makeClock(), position: { x: 0, y: 3.4, z: -DEPTH / 2 + 0.1 }, rotation: Math.PI, label: "睇個電鐘", flavor: [
    "數碼鐘閃住 00:00。",
    "計時倒轉，但跳到 99 就停。",
  ] });
  decoy(ctx, { group: makeShelf(), model: "bookshelf", position: { x: -6.4, y: 0, z: -1 }, rotation: Math.PI / 2, footprint: { w: 0.42, d: 1.5 }, label: "翻閱電工手冊", flavor: [
    "手冊講嘅顏色，同牆上嗰啲唔同。",
    "其中一頁寫住：『唔好信顏色，信次序』。",
    "每本都係過期十年嘅規範。",
  ] });
  decoy(ctx, { group: makeVase(), position: { x: 0, y: 0, z: 4 }, footprint: { w: 0.4, d: 0.4 }, label: "查看花瓶", flavor: [
    "花瓶入面有條保險絲。插咗落去，乜都冇發生。",
    "花瓶同電，無任何關係。",
  ] });

  // ---- second wave ----
  decoy(ctx, { group: makeMachine(0x2a2a3a), position: { x: 5.5, y: 0, z: -2.5 }, footprint: { w: 0.9, d: 0.7 }, label: "檢查變壓器", flavor: [
    "變壓器嗡嗡響。摸落去係震嘅。",
    "上面貼住：『高壓——但唔係你需要嘅高壓』。",
  ] });
  decoy(ctx, { group: makeLampStanding(), model: "lampStanding", position: { x: -5.5, y: 0, z: -3.5 }, footprint: { w: 0.4, d: 0.4 }, label: "查看座地燈", flavor: [
    "座地燈隨密碼閃。但你按錯佢就熄。",
    "燈泡係黑色嘅，但仲係發光。",
  ] });
  decoy(ctx, { group: makeCrate(0x333344), model: "crate", position: { x: -5.0, y: 0, z: 4.5 }, footprint: { w: 0.8, d: 0.8 }, label: "撬開工具箱", flavor: [
    "入面全部係燒斷咗嘅保險絲。",
    "箱底有張電路圖，但係錯嘅。",
  ] });
  decoy(ctx, { group: makeSpool(), position: { x: -3.5, y: 0, z: 4.5 }, footprint: { w: 0.5, d: 0.3 }, label: "查看電線轆", flavor: [
    "電線打咗個結。解唔開。",
  ] });
  decoy(ctx, { group: makeBooks(), model: "books", position: { x: -6.4, y: 0.75, z: -1 }, footprint: null, label: "翻閱規格書", flavor: [
    "每頁都寫住『請參照第 __ 頁』。頁數係空嘅。",
  ] });
  decoy(ctx, { group: makeFuseBin(), position: { x: 3.5, y: 0, z: 4.5 }, footprint: { w: 0.4, d: 0.3 }, label: "查看保險絲盒", flavor: [
    "入面得灰。",
  ] });
  decoy(ctx, { group: makeWarningSign(0x33ddff), position: { x: 0, y: 0, z: 5.2 }, label: "查看藍牌", flavor: [
    "牌寫住『資訊』。下面乜都冇。",
  ] });
}

function placeRoom5Decoys(ctx) {
  // grand finale hall clutter — extra EXIT propaganda + reception clutter
  decoy(ctx, { group: makeReception(), position: { x: 0, y: 0, z: 3.5 }, footprint: { w: 2.4, d: 0.7 }, label: "搜查接待處", flavor: [
    "接待處冇人。鐘響，但冇人應。",
    "枱面有個登記簿，所有名都係你個名。",
    "抽屜鎖住。撬開，入面係另一條鎖。",
  ] });
  decoy(ctx, { group: makeTurnstile(), position: { x: -2.6, y: 0, z: 1.5 }, footprint: { w: 0.3, d: 0.3 }, label: "推轉閘", flavor: [
    "轉閘卡住咗。推唔郁。",
    "入閘機閂咗，但從來冇人收過飛。",
  ] });
  decoy(ctx, { group: makeTurnstile(), position: { x: 2.6, y: 0, z: 1.5 }, footprint: { w: 0.3, d: 0.3 }, label: "推轉閘", flavor: [
    "轉閘轉得動，但行完一圈返返原位。",
    "入面乜都冇。",
  ] });
  decoy(ctx, { group: makeBanner(), position: { x: 0, y: 3.6, z: -2.5 }, label: "細看橫額", flavor: [
    "橫額寫住『恭喜你抵達出口』。你未出去過。",
    "橫額反轉，後面寫住『再試多次』。",
  ] });
  decoy(ctx, { group: makeExitArrow(), position: { x: 4.5, y: 2.6, z: -DEPTH / 2 + 0.2 }, label: "望住箭嘴", flavor: [
    "箭嘴指住道發光嘅門。你已經知道結果。",
    "箭嘴閃下閃下，好似好緊急。但唔係。",
  ] });
  decoy(ctx, { group: makeExitArrow(), position: { x: 0, y: 2.6, z: -DEPTH / 2 + 0.2 }, label: "望住箭嘴", flavor: [
    "三個箭嘴，全部指住發光嘅門。冇一個指住暗門。",
    "箭嘴係畫嚟呃你嘅。",
  ] });
  decoy(ctx, { group: makeRope(), position: { x: -1.5, y: 0, z: 0.5 }, footprint: { w: 1.0, d: 0.1 }, label: "查看排隊繩", flavor: [
    "繩後面冇隊。從來冇人排過。",
    "繩係絲絨，掛住灰。",
  ] });
  decoy(ctx, { group: makeRope(), position: { x: 1.5, y: 0, z: 0.5 }, footprint: { w: 1.0, d: 0.1 }, label: "查看排隊繩", flavor: [
    "柱頂有個銅牌，寫住『出口』。空話。",
    "繩下面，乜都冇。",
  ] });
  decoy(ctx, { group: makePlant(), model: "plant", position: { x: -6.4, y: 0, z: 5 }, footprint: { w: 0.5, d: 0.5 }, label: "查看盆栽", flavor: [
    "盆栽係假嘅。連個盆都係假嘅。",
    "葉上面有層蠟。",
  ] });
  decoy(ctx, { group: makePlant(), model: "plant", position: { x: 6.4, y: 0, z: 5 }, footprint: { w: 0.5, d: 0.5 }, label: "查看盆栽", flavor: [
    "盆栽旁邊有塊牌：『出口方向』。指住天花板。",
  ] });
  decoy(ctx, { group: makeIntercom(), position: { x: -6.4, y: 1.5, z: -2 }, rotation: Math.PI / 2, label: "按對講機", flavor: [
    "對講機傳出一段廣播：『請向著光行。』呃你嘅。",
    "有人應：『你仲未走？』，跟住斷線。",
  ] });
  decoy(ctx, { group: makeChair(), model: "chair", position: { x: -4.5, y: 0, z: 4.5 }, footprint: { w: 0.5, d: 0.5 }, label: "檢查座椅", flavor: [
    "等候區嘅椅。坐落去，乜都唔會發生。",
    "椅背刻住：『坐到出口出現為止』。出口唔會出現。",
  ] });
  decoy(ctx, { group: makeClock(), position: { x: 0, y: 3.6, z: DEPTH / 2 - 0.1 }, label: "睇大鐘", flavor: [
    "鐘面冇指針。得一個字：『等』。",
    "永遠都係等候時間。",
  ] });

  // ---- second wave: extra EXIT propaganda + furniture ----
  decoy(ctx, { group: makeCouch(), model: "couch", position: { x: -4.0, y: 0, z: 2.0 }, footprint: { w: 1.6, d: 3.0 }, label: "搜查梳化", flavor: [
    "梳化上面有條毯。毯下面乜都冇。",
    "坐落去，你好想瞓。但瞓唔著。",
  ] });
  decoy(ctx, { group: makeTable(), model: "table", position: { x: 4.0, y: 0, z: 2.0 }, footprint: { w: 2.0, d: 2.0 }, label: "搜查茶几", flavor: [
    "茶几上面有本雜誌。每一頁都係出口廣告。",
    "枱面有刮痕：『我試過所有門』。",
  ] });
  decoy(ctx, { group: makeBooks(), model: "books", position: { x: 4.0, y: 0.75, z: 2.0 }, footprint: null, label: "翻閱雜誌", flavor: [
    "雜誌封面寫住『逃離指南』。入面全部係白頁。",
  ] });
  decoy(ctx, { group: makeRug(), model: "rug", position: { x: 0, y: 0, z: 0 }, footprint: null, label: "查看地毯", flavor: [
    "地毯嘅花紋係箭嘴。全部指住發光嘅門。",
    "踩上去，有好似行緊嘅錯覺。",
  ] });
  decoy(ctx, { group: makeLampStanding(), model: "lampStanding", position: { x: 5.5, y: 0, z: -1.5 }, footprint: { w: 0.4, d: 0.4 }, label: "查看座地燈", flavor: [
    "座地燈嘅光同 EXIT 門一樣綠。係呼應？定係嘲諷？",
  ] });
  decoy(ctx, { group: makeLampTable(), model: "lampTable", position: { x: 4.0, y: 0.75, z: 2.0 }, footprint: null, label: "查看枱燈", flavor: [
    "枱燈一閃一閃。節奏同你嘅心跳一樣。",
  ] });
  decoy(ctx, { group: makeArmchair(), model: "armchair", position: { x: -4.5, y: 0, z: -1.5 }, rotation: Math.PI / 2, footprint: { w: 1.6, d: 1.8 }, label: "坐落單人椅", flavor: [
    "好舒服。舒服到你唔想走。呢個可能就係陷阱。",
    "扶手上面刻住：『留低啦』。",
  ] });
  decoy(ctx, { group: makeExitArrow(), position: { x: -4.5, y: 2.0, z: -DEPTH / 2 + 0.2 }, label: "望住箭嘴", flavor: [
    "呢個箭嘴指住天花板。上面乜都冇。",
    "所有箭嘴都指住發光嘅門。冇一個指住暗門。",
  ] });
  decoy(ctx, { group: makeBanner(), position: { x: 3.0, y: 3.6, z: -2.5 }, label: "細看細橫額", flavor: [
    "細橫額寫住『即將到達出口』。你已經到過好多次。",
  ] });
  decoy(ctx, { group: makePaintingStand(), model: "paintingStand", position: { x: -2.0, y: 0, z: -3.0 }, footprint: { w: 0.5, d: 0.4 }, label: "細看畫架", flavor: [
    "畫架上嘅畫，畫住三道門。兩道發光，一道唔發光。",
    "畫布背面寫住：『你已經知道答案』。",
  ] });
}


/* ==================================================================
 * ROOM 1 — 迎賓室 (multi-step: code → cabinet → battery → power → card → door)
 * ================================================================== */
function buildRoom1(ctx) {
  addAmbient(ctx);
  addShell(ctx, { frontGaps: [0] });
  detailArchitecture(ctx);
  addLight(ctx, 0xbfd8ff, 1.4, 0, HEIGHT - 0.5, 0, 34, true);
  addDust(ctx, 360);

  // puzzle state
  let hasBattery = false;
  let powerOn = false;
  let hasCard = false;
  let doorOpen = false;
  const CODE = 735; // clues: clock=7, painting=3, books=5

  // ---- real door ----
  const exit = makeExitDoor(ctx, { atX: 0 });
  const doorStatus = createStatusLight({ position: new THREE.Vector3(-1.3, 1.6, -DEPTH / 2 + 0.2), color: 0xff3b3b });
  ctx.root.add(doorStatus.group);

  // ---- power slot near door ----
  const slot = createSlot({
    position: new THREE.Vector3(1.3, 0, -DEPTH / 2 + 0.5),
    rotation: Math.PI,
    onInsert: () => {
      powerOn = true;
      doorStatus.setState(true);
      doorStatus.group.children[0].material.emissive.set(0x39ff7a);
      ctx.setObjective("執起門禁卡，再開門");
      ctx.toast("電力恢復。感應器亮起綠燈。", "good");
    },
  });
  ctx.root.add(slot.group);
  makeInteractable(slot.group, {
    prompt: "插入電池",
    enabled: false,
    onInteract: () => {
      if (!hasBattery) { ctx.toast("需要一粒電池。", "warn"); return; }
      slot.fill();
      slot.group.userData.enabled = false;
    },
  });
  ctx.interactables.push(slot.group);

  // ---- locked cabinet with code lock ----
  const cabinet = createContainer({
    position: new THREE.Vector3(-5.5, 0, 3),
    rotation: Math.PI / 2,
    color: 0x3a4252,
    onOpen: () => {
      ctx.toast("櫃門打開。入面有嘢發光。", "good");
      // spawn battery inside cabinet
      battery.group.position.set(-5.5, 0.4, 2.8);
      battery.group.visible = true;
      battery.group.userData.enabled = true;
    },
  });
  ctx.root.add(cabinet.group);
  ctx.colliders.push({ minX: -6.0, maxX: -5.0, minZ: 2.5, maxZ: 3.5 });
  ctx.updatables.push((dt) => cabinet.update(dt));

  const codeLock = createCodeLock({
    position: new THREE.Vector3(-5.5, 0, 2.74),
    rotation: Math.PI,
    code: CODE,
    onUnlock: () => {
      ctx.toast("密碼正確。", "good");
      cabinet.open();
      codeLock.group.userData.enabled = false;
      codeLock.getDigitInteractables().forEach((d) => { d.userData.enabled = false; });
    },
    onAttempt: () => {},
  });
  ctx.root.add(codeLock.group);
  codeLock.getDigitInteractables().forEach((d) => ctx.interactables.push(d));

  // ---- battery (hidden inside cabinet until opened) ----
  const battery = createItem({
    position: new THREE.Vector3(-5.5, 0.4, 2.8),
    label: "執起電池",
    color: 0x44ddff,
    size: 0.14,
    onPickup: () => {
      hasBattery = true;
      slot.group.userData.enabled = true;
      ctx.setObjective("將電池插入門旁嘅插槽");
      ctx.toast("你執到一粒電池。", "good");
    },
  });
  battery.group.visible = false; // hidden until cabinet opens
  battery.group.userData.enabled = false;
  ctx.root.add(battery.group);
  ctx.updatables.push((dt) => battery.update(dt));
  makeInteractable(battery.group, {
    prompt: "執起電池",
    enabled: false,
    onInteract: () => battery.pickup(),
  });
  ctx.interactables.push(battery.group);

  // ---- keycard on pedestal (locked until power on) ----
  const pedestal = box(0.8, 0.9, 0.8, TRIM_MAT);
  pedestal.position.set(0, 0.45, 1.5);
  pedestal.castShadow = true;
  ctx.root.add(pedestal);
  ctx.colliders.push({ minX: -0.4, maxX: 0.4, minZ: 1.1, maxZ: 1.9 });
  // glass dome over keycard (disappears when powered)
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x88aacc, transparent: true, opacity: 0.2, roughness: 0.1, metalness: 0.3, side: THREE.DoubleSide })
  );
  dome.position.set(0, 0.9, 1.5);
  ctx.root.add(dome);
  const card = createKeycard({ position: new THREE.Vector3(0, 1.05, 1.5) });
  ctx.root.add(card.group);
  ctx.updatables.push((dt) => card.update(dt));
  makeInteractable(card.group, {
    prompt: "執起門禁卡",
    onInteract: () => {
      if (card.picked) return;
      if (!powerOn) { ctx.toast("玻璃罩鎖住咗。需要先恢復電力。", "warn"); return; }
      card.pickup();
      dome.visible = false;
      hasCard = true;
      exit.door.sign.material = M.amber();
      ctx.setObjective("用門禁卡開門");
      ctx.toast("你執到一張門禁卡。", "good");
    },
  });
  ctx.interactables.push(card.group);

  // ---- real door interact ----
  makeInteractable(exit.door.group, {
    prompt: "開門",
    onInteract: () => {
      if (doorOpen) return;
      if (!hasCard) {
        ctx.toast(powerOn ? "門鎖住了。你需要一張卡。" : "冇電。乜都唔郁。", "warn");
        return;
      }
      doorOpen = true;
      exit.open();
      ctx.toast("門開了。行出去。", "good");
      ctx.setObjective("穿過門口");
    },
  });
  ctx.interactables.push(exit.door.group);

  // ---- FALSE exit ----
  const fake = createDoor({ width: 1.8, height: 3.0, color: 0x11331a, emissive: 0x39ff7a });
  fake.group.position.set(WIDTH / 2 - 0.3, 0, -2.5);
  fake.group.rotation.y = -Math.PI / 2;
  ctx.root.add(fake.group);
  fake.update(0);
  ctx.updatables.push((dt) => fake.update(dt));
  const fakeLight = addLight(ctx, 0x39ff7a, 1.2, WIDTH / 2 - 1.2, 2.4, -2.5, 5);
  ctx.updatables.push(flicker(fakeLight, { base: 1.1, amp: 0.3, speed: 6 }));
  makeInteractable(fake.group, {
    prompt: "行入 EXIT",
    onInteract: () => ctx.onLoop("綠色嘅『EXIT』將你送返起點。呢度唔係出口。"),
  });
  ctx.interactables.push(fake.group);

  // ---- CLUE OBJECTS (digits hidden in flavor text) ----
  // clock → digit 7
  decoy(ctx, { group: makeClock(), position: { x: -3.2, y: 3.0, z: DEPTH / 2 - 0.1 }, label: "睇個鐘", flavor: [
    "時針凝住喺 7 字。唔肯郁。",
    "秒針行到 7 就停。",
    "鐘面有 7 道裂紋。",
  ] });
  // painting → digit 3
  decoy(ctx, { group: makePainting(0x3a5a3a), model: "painting", position: { x: 2.6, y: 2.3, z: DEPTH / 2 - 0.1 }, label: "細看油畫", flavor: [
    "畫入面有 3 個人影，全部背住你。",
    "3 隻烏鴉停喺畫中嘅樹上。",
    "畫框上有 3 道刮痕。",
  ] });
  // books → digit 5
  decoy(ctx, { group: makeBooks(), model: "books", position: { x: 4.6, y: 0.75, z: 3.8 }, footprint: null, label: "數書本", flavor: [
    "數咗下，總共 5 本書疊埋一齊。",
    "其中 5 本嘅書脊有刮痕。",
    "5 頁紙從書入面跌咗出嚟。",
  ] });

  // ---- decoys ----
  placeRoom1Decoys(ctx);

  // ---- mass scatter for density ----
  scatter(ctx, {
    zones: [
      { x: -4.5, z: 4.5, w: 2, d: 2, y: 0.75 },
      { x: 4.5, z: 4.5, w: 2, d: 2, y: 0 },
      { x: 0, z: 0, w: 3, d: 3, y: 0 },
      { x: -4, z: -3, w: 2, d: 2, y: 0 },
      { x: 4, z: -1, w: 2, d: 2, y: 0 },
    ],
    count: 45,
    models: ["book", "books"],
    label: "查看雜物",
    flavor: [
      "乜都冇。只係垃圾。",
      "一張紙屑，寫住唔完整嘅字。",
      "杯漬。但冇杯。",
      "一條電線，兩端都冇插頭。",
      "碎片。唔知係乜嘢嘅碎片。",
      "一粒螺絲。擰唔返入去。",
      "一張相。相入面係呢間房。但冇你。",
      "一張飛。過期咗。目的地寫住『出口』。",
      "灰塵。只係灰塵。",
      "一個空樽。標籤寫住『希望』。",
    ],
  });

  ctx.updatables.push(() => {
    if (doorOpen && exitZoneMet(ctx.getPlayer())) ctx.goNext();
  });

  return { spawn: { x: 0, z: DEPTH / 2 - 1.4, yaw: 0 }, objective: "探索房間。櫃鎖住咗——搵出密碼。" };
}

/* ==================================================================
 * ROOM 2 — 鏡廊 (mirrors + laser)
 * ================================================================== */
function buildRoom2(ctx) {
  addAmbient(ctx);
  addShell(ctx, { frontGaps: [0] });
  detailArchitecture(ctx);
  addLight(ctx, 0xbfd8ff, 1.3, 0, HEIGHT - 0.5, 0, 34, true);
  addDust(ctx, 360);

  const exit = makeExitDoor(ctx, { atX: 0 });
  let opened = false;
  let laserOn = false;

  // ---- 3 mirrors, one behind a gate ----
  const m1 = createMirror({ position: new THREE.Vector3(-4, 0, -2), initialSlot: 1 });
  const m2 = createMirror({ position: new THREE.Vector3(0, 0, -2), initialSlot: 3 });
  const m3 = createMirror({ position: new THREE.Vector3(4, 0, -2), initialSlot: 0 }); // behind gate
  const mirrors = [m1, m2, m3];

  for (const m of mirrors) {
    ctx.root.add(m.group);
    ctx.updatables.push((dt) => m.update(dt));
  }
  ctx.colliders.push({ minX: -4.6, maxX: -3.4, minZ: -2.6, maxZ: -1.4 });
  ctx.colliders.push({ minX: -0.6, maxX: 0.6, minZ: -2.6, maxZ: -1.4 });

  // mirror 1 & 2 interactable immediately
  makeInteractable(m1.group, { prompt: "轉動鏡面", onInteract: () => m1.rotate90() });
  ctx.interactables.push(m1.group);
  makeInteractable(m2.group, { prompt: "轉動鏡面", onInteract: () => m2.rotate90() });
  ctx.interactables.push(m2.group);

  // mirror 3 behind a gate (collider wall, removed when plate pressed)
  const gate = box(0.1, 2.0, 3.0, new THREE.MeshStandardMaterial({ color: 0x2a3340, metalness: 0.7, roughness: 0.4, transparent: true, opacity: 0.7 }));
  gate.position.set(4, 1.0, -2);
  gate.castShadow = true;
  ctx.root.add(gate);
  const gateCollider = { minX: 3.7, maxX: 4.3, minZ: -3.6, maxZ: -0.4 };
  ctx.colliders.push(gateCollider);
  const m3Collider = { minX: 3.4, maxX: 4.6, minZ: -2.6, maxZ: -1.4, enabled: false };
  ctx.colliders.push(m3Collider);

  // ---- pressure plate to open gate (push box onto it) ----
  const pushBox = createPushBox({ position: new THREE.Vector3(2, 0, 3), size: 0.9, height: 0.9, color: 0x8a5a2b });
  ctx.root.add(pushBox.group);
  ctx.colliders.push(pushBox.collider);

  const plate = createPlate({
    position: new THREE.Vector3(5.5, 0, 3),
    size: 1.2,
    onChange: (active) => {
      if (active && gate.visible) {
        gate.visible = false;
        gateCollider.enabled = false;
        m3Collider.enabled = true;
        makeInteractable(m3.group, { prompt: "轉動鏡面", onInteract: () => m3.rotate90() });
        ctx.interactables.push(m3.group);
        ctx.toast("閘門升起。後面有一塊鏡。", "good");
      }
    },
  });
  plate.group.position.y = 0;
  ctx.root.add(plate.group);

  // ---- laser (off until battery inserted) ----
  // collect wall meshes for beam termination
  const solids = [];
  ctx.root.traverse((o) => {
    if (o.isMesh && o.geometry && o.geometry.type === "BoxGeometry" && o.material === WALL_MAT) solids.push(o);
  });

  const laser = createLaser({
    emitterPos: new THREE.Vector3(-4, 1.4, DEPTH / 2 - 0.8),
    emitterDir: new THREE.Vector3(0, 0, -1),
    receptorPos: new THREE.Vector3(0, 1.4, -DEPTH / 2 + 1.4),
    mirrors,
    solids,
    onSolved: () => {
      if (opened) return;
      opened = true;
      exit.open();
      ctx.toast("感應器收到光。門開咗。", "good");
      ctx.setObjective("穿過門口");
    },
  });
  laser.group.visible = false; // off until powered
  ctx.root.add(laser.group);

  // laser power slot
  const laserSlot = createSlot({
    position: new THREE.Vector3(-WIDTH / 2 + 0.5, 0, DEPTH / 2 - 1.5),
    rotation: 0,
    onInsert: () => {
      laserOn = true;
      laser.group.visible = true;
      ctx.updatables.push((dt) => laser.update(dt));
      ctx.setObjective("轉動鏡面，將光送到門上感應器");
      ctx.toast("激光啟動。紅光射出。", "good");
    },
  });
  ctx.root.add(laserSlot.group);
  makeInteractable(laserSlot.group, {
    prompt: "插入電池",
    enabled: false,
    onInteract: () => {
      if (!hasBattery2) { ctx.toast("需要一粒電池。", "warn"); return; }
      laserSlot.fill();
      laserSlot.group.userData.enabled = false;
    },
  });
  ctx.interactables.push(laserSlot.group);

  // ---- battery hidden in a container (find it among decoys) ----
  let hasBattery2 = false;
  const batteryBox = createContainer({
    position: new THREE.Vector3(5.5, 0, -4.5),
    rotation: 0,
    color: 0x4a3a2a,
    onOpen: () => {
      battery2.group.visible = true;
      battery2.group.userData.enabled = true;
      ctx.toast("箱入面有嘢發光。", "good");
    },
  });
  ctx.root.add(batteryBox.group);
  ctx.colliders.push({ minX: 5.0, maxX: 6.0, minZ: -5.0, maxZ: -4.0 });
  ctx.updatables.push((dt) => batteryBox.update(dt));
  makeInteractable(batteryBox.group, {
    prompt: "打開箱",
    onInteract: () => batteryBox.open(),
  });
  ctx.interactables.push(batteryBox.group);

  const battery2 = createItem({
    position: new THREE.Vector3(5.5, 0.4, -4.5),
    label: "執起電池",
    color: 0x44ddff,
    size: 0.14,
    onPickup: () => {
      hasBattery2 = true;
      laserSlot.group.userData.enabled = true;
      ctx.setObjective("將電池插入激光發射器旁嘅插槽");
      ctx.toast("你執到一粒電池。", "good");
    },
  });
  battery2.group.visible = false;
  battery2.group.userData.enabled = false;
  ctx.root.add(battery2.group);
  ctx.updatables.push((dt) => battery2.update(dt));
  makeInteractable(battery2.group, {
    prompt: "執起電池",
    enabled: false,
    onInteract: () => battery2.pickup(),
  });
  ctx.interactables.push(battery2.group);

  // ---- clue objects (mirror angles hinted in environment) ----
  decoy(ctx, { group: makePainting(0x1a3a5a), model: "painting", position: { x: 0, y: 2.6, z: DEPTH / 2 - 0.1 }, label: "細看掛圖", flavor: [
    "掛圖畫咗一道光，折咗兩次，最後射中一個圓圈。",
    "光嘅路徑畫成摺線。每個轉角都有個鏡嘅圖案。",
  ] });

  // ---- decoys + scatter ----
  placeRoom2Decoys(ctx);
  scatter(ctx, {
    zones: [
      { x: -5, z: 3, w: 2, d: 2, y: 0 },
      { x: 2, z: 4.5, w: 2, d: 2, y: 0 },
      { x: -2, z: 0, w: 2, d: 2, y: 0 },
      { x: 5, z: 0, w: 2, d: 2, y: 0 },
    ],
    count: 40,
    models: ["book", "books", "lampTable"],
    label: "查看雜物",
    flavor: [
      "一塊鏡碎片。反射唔到你。",
      "一張圖紙，畫住光線折射。但角度俾人塗黑咗。",
      "一個透鏡，有裂紋。",
      "碎片。反射出無數個你。",
      "一張紙寫住：『反射嘅嘢唔一定真實』。",
      "一個三稜鏡。但冇光經過佢。",
      "一條電線。唔知通去邊。",
    ],
  });

  // update plate each frame
  ctx.updatables.push((dt) => {
    const sources = [
      { x: pushBox.group.position.x, z: pushBox.group.position.z },
      { x: ctx.getPlayer().position.x, z: ctx.getPlayer().position.z },
    ];
    plate.update(dt, sources);
  });

  ctx.updatables.push(() => {
    if (opened && exitZoneMet(ctx.getPlayer())) ctx.goNext();
  });

  return { spawn: { x: 0, z: DEPTH / 2 - 1.4, yaw: 0 }, objective: "激光熄咗。搵電池啟動佢。" };
}

/* ==================================================================
 * ROOM 3 — 貨倉 (multi-step: 3 boxes → 3 colored plates → valve → key)
 * ================================================================== */
function buildRoom3(ctx) {
  addAmbient(ctx);
  addShell(ctx, { frontGaps: [0] });
  detailArchitecture(ctx);
  addLight(ctx, 0xbfd8ff, 1.3, 0, HEIGHT - 0.5, 0, 34, true);
  addDust(ctx, 360);

  const exit = makeExitDoor(ctx, { atX: 0 });
  let opened = false;

  // internal walls to shape the sokoban space
  addWall(ctx, -3.5, 1, 0.4, 4, 2.4);
  addWall(ctx, 3.5, -1, 0.4, 4, 2.4);

  // ---- 3 colored boxes ----
  const boxDefs = [
    { start: new THREE.Vector3(-1.5, 0, 2.5), color: 0xcc4444 },
    { start: new THREE.Vector3(0, 0, 3.0), color: 0x44cc66 },
    { start: new THREE.Vector3(1.5, 0, 2.5), color: 0x4488ee },
  ];
  const boxes = boxDefs.map((d) => {
    const b = createPushBox({ position: d.start, size: 0.9, height: 0.9, color: d.color });
    ctx.root.add(b.group);
    ctx.colliders.push(b.collider);
    return b;
  });

  // ---- 3 colored plates (clue: match color to plate via painting/décor) ----
  const plateDefs = [
    { pos: new THREE.Vector3(-3.5, 0, -3.5), color: 0x4488ee },
    { pos: new THREE.Vector3(0, 0, -4.0), color: 0xcc4444 },
    { pos: new THREE.Vector3(3.5, 0, -3.5), color: 0x44cc66 },
  ];
  let platesActive = 0;
  const plates = plateDefs.map((pd) => {
    const plate = createPlate({
      position: pd.pos,
      size: 1.2,
      onChange: (active) => {
        platesActive += active ? 1 : -1;
        if (platesActive >= 3 && !valveUnlocked) {
          valveUnlocked = true;
          valve.group.userData.enabled = true;
          ctx.setObjective("轉動閥門釋放鑰匙");
          ctx.toast("三塊壓板都壓住咗。管道有聲。", "good");
        }
      },
    });
    plate.group.position.y = 0;
    plate.group.children[1].material = new THREE.MeshStandardMaterial({ color: pd.color, emissive: pd.color, emissiveIntensity: 0.3, roughness: 0.6 });
    ctx.root.add(plate.group);
    return plate;
  });

  // ---- valve (unlocked when all plates pressed) → drops key from ceiling pipe ----
  let valveUnlocked = false;

  const valve = createValve({
    position: new THREE.Vector3(-WIDTH / 2 + 0.5, 0, -2),
    rotation: 0,
    turns: 2,
    onOpen: () => {
      ctx.toast("管道打開。有嘢跌落嚟。", "good");
      keyItem.group.position.set(-WIDTH / 2 + 0.8, 0, -1.5);
      keyItem.group.visible = true;
      keyItem.group.userData.enabled = true;
    },
  });
  ctx.root.add(valve.group);
  ctx.updatables.push((dt) => valve.update(dt));
  makeInteractable(valve.group, {
    prompt: "轉動閥門",
    enabled: false,
    onInteract: () => {
      if (!valveUnlocked) { ctx.toast("閥門鎖死。需要先壓住所有壓板。", "warn"); return; }
      valve.turn();
      ctx.toast(`閥門轉咗 ${valve.progress}/${valve.needed}`, "");
    },
  });
  ctx.interactables.push(valve.group);

  // ---- key item (drops from pipe) ----
  let hasKey = false;
  const keyItem = createItem({
    position: new THREE.Vector3(-WIDTH / 2 + 0.8, 0, -1.5),
    label: "執起鑰匙",
    color: 0xffcc33,
    size: 0.16,
    onPickup: () => {
      hasKey = true;
      ctx.setObjective("用鑰匙開門");
      ctx.toast("你執到一條鑰匙。", "good");
    },
  });
  keyItem.group.visible = false;
  keyItem.group.userData.enabled = false;
  ctx.root.add(keyItem.group);
  ctx.updatables.push((dt) => keyItem.update(dt));
  makeInteractable(keyItem.group, { prompt: "執起鑰匙", enabled: false, onInteract: () => keyItem.pickup() });
  ctx.interactables.push(keyItem.group);

  // ---- door interact ----
  makeInteractable(exit.door.group, {
    prompt: "開門",
    onInteract: () => {
      if (opened) return;
      if (!hasKey) { ctx.toast("門鎖住了。需要一條鑰匙。", "warn"); return; }
      opened = true;
      exit.open();
      ctx.toast("門開了。", "good");
      ctx.setObjective("穿過門口");
    },
  });
  ctx.interactables.push(exit.door.group);

  // ---- reset lever ----
  const reset = createLever({
    position: new THREE.Vector3(0, 0, DEPTH / 2 - 1.2),
    rotation: Math.PI,
    onChange: (on) => {
      if (!on) return;
      boxDefs.forEach((d, i) => boxes[i].group.position.set(d.start.x, 0, d.start.z));
      ctx.toast("箱已重置。", "warn");
    },
  });
  reset.group.position.y = 0;
  ctx.root.add(reset.group);
  ctx.updatables.push((dt) => reset.update(dt));
  makeInteractable(reset.group, { prompt: "拉動重置桿", onInteract: () => reset.toggle() });
  ctx.interactables.push(reset.group);

  // ---- hidden clues: color matching hints in objects ----
  decoy(ctx, { group: makePainting(0x4a2a2a), model: "painting", position: { x: -WIDTH / 2 + 0.1, y: 2.3, z: 0.5 }, rotation: Math.PI / 2, label: "細看油畫", flavor: [
    "畫中三個箱：藍喺左，紅喺中，綠喺右。",
    "油畫描繪三塊彩色板，由左至右：藍、紅、綠。",
  ] });
  decoy(ctx, { group: makeClock(), position: { x: 0, y: 3.4, z: DEPTH / 2 - 0.1 }, label: "睇個鐘", flavor: [
    "鐘面刻住三種顏色嘅刻度：藍、紅、綠。",
    "三根指針，分別係藍、紅、綠色。",
  ] });

  // ---- decoys + scatter ----
  placeRoom3Decoys(ctx);
  scatter(ctx, {
    zones: [
      { x: -5, z: 4, w: 2, d: 2, y: 0 },
      { x: 5, z: 4, w: 2, d: 2, y: 0 },
      { x: 0, z: 0, w: 2, d: 2, y: 0 },
      { x: -5, z: -3.5, w: 2, d: 2, y: 0 },
      { x: 5, z: -3.5, w: 2, d: 2, y: 0 },
    ],
    count: 50,
    models: ["book", "crate", "books"],
    label: "翻查雜物",
    flavor: [
      "一個爛木箱。入面係木屑。",
      "一張貨單，寫住：藍→左、紅→中、綠→右。",
      "一塊碎片，髹咗紅色油漆。",
      "一個空油桶。倒唔出嘢。",
      "一條鐵鏈，鎖住一個箱。但係空嘅。",
      "一張紙寫住：『顏色要配對』。",
      "一個扳手，但太爛用唔到。",
    ],
  });

  // update plates each frame
  ctx.updatables.push((dt) => {
    const sources = boxes.map((b) => ({ x: b.group.position.x, z: b.group.position.z }));
    sources.push({ x: ctx.getPlayer().position.x, z: ctx.getPlayer().position.z });
    for (const plate of plates) plate.update(dt, sources);
  });

  ctx.updatables.push(() => {
    if (opened && exitZoneMet(ctx.getPlayer())) ctx.goNext();
  });

  return { spawn: { x: 0, z: DEPTH / 2 - 1.4, yaw: 0 }, objective: "探索貨倉。每個箱都有顏色。" };
}

/* ==================================================================
 * ROOM 4 — 配電房 (multi-step: find fuse → hidden sequence → circuit → door)
 * ================================================================== */
function buildRoom4(ctx) {
  addAmbient(ctx);
  addShell(ctx, { frontGaps: [0] });
  detailArchitecture(ctx);
  addLight(ctx, 0xbfd8ff, 1.3, 0, HEIGHT - 0.5, 0, 34, true);
  addDust(ctx, 360);

  const exit = makeExitDoor(ctx, { atX: 0 });
  let opened = false;

  // ---- hidden sequence: 4 paintings on walls tell the order ----
  // order clue: painting positions/numbers hidden in flavor text
  // target: blue(1), red(0), green(2), amber(3) => [1,0,2,3]
  const COLORS = [0xff3b3b, 0x3b8bff, 0x39ff7a, 0xffb43b];
  const NAMES = ["紅", "藍", "綠", "琥珀"];
  const target = [1, 0, 2, 3];

  // ---- circuit panel (locked until fuse inserted) ----
  const defs = [-2.4, -0.8, 0.8, 2.4].map((x, i) => ({
    position: new THREE.Vector3(x, 1.1, -DEPTH / 2 + 0.9),
    color: COLORS[i],
  }));
  const circuit = createCircuit({
    switchDefs: defs,
    target,
    onSolved: () => {
      opened = true;
      exit.open();
      ctx.toast("電路接通。門開咗。", "good");
      ctx.setObjective("穿過門口");
    },
    onWrong: () => ctx.toast("次序錯。重新觀察。", "warn"),
  });
  circuit.group.visible = false; // hidden until powered
  ctx.root.add(circuit.group);
  circuit.switches.forEach((sw) => {
    makeInteractable(sw.group, { prompt: "按寶石", enabled: false, onInteract: () => circuit.flip(sw.index) });
    ctx.interactables.push(sw.group);
  });

  // ---- fuse slot (powers the circuit panel) ----
  let hasFuse = false;
  let panelPowered = false;
  const fuseSlot = createSlot({
    position: new THREE.Vector3(WIDTH / 2 - 0.5, 0, 0),
    rotation: -Math.PI / 2,
    onInsert: () => {
      panelPowered = true;
      circuit.group.visible = true;
      circuit.switches.forEach((sw) => { sw.group.userData.enabled = true; });
      ctx.setObjective("按正確次序按下寶石");
      ctx.toast("保險絲插入。配電盤亮起。", "good");
    },
  });
  ctx.root.add(fuseSlot.group);
  makeInteractable(fuseSlot.group, {
    prompt: "插入保險絲",
    enabled: false,
    onInteract: () => {
      if (!hasFuse) { ctx.toast("需要一條保險絲。", "warn"); return; }
      fuseSlot.fill();
      fuseSlot.group.userData.enabled = false;
    },
  });
  ctx.interactables.push(fuseSlot.group);

  // ---- fuse hidden in a locked container (code lock) ----
  const FUSE_CODE = 462;
  const fuseCabinet = createContainer({
    position: new THREE.Vector3(-WIDTH / 2 + 0.5, 0, -3),
    rotation: Math.PI / 2,
    color: 0x3a3a4a,
    onOpen: () => {
      fuseItem.group.visible = true;
      fuseItem.group.userData.enabled = true;
      ctx.toast("櫃門打開。入面有一條保險絲。", "good");
    },
  });
  ctx.root.add(fuseCabinet.group);
  ctx.colliders.push({ minX: -6.0, maxX: -5.0, minZ: -3.5, maxZ: -2.5 });
  ctx.updatables.push((dt) => fuseCabinet.update(dt));

  const fuseCodeLock = createCodeLock({
    position: new THREE.Vector3(-WIDTH / 2 + 0.26, 0, -3.24),
    rotation: 0,
    code: FUSE_CODE,
    onUnlock: () => {
      ctx.toast("密碼正確。", "good");
      fuseCabinet.open();
      fuseCodeLock.getDigitInteractables().forEach((d) => { d.userData.enabled = false; });
    },
  });
  ctx.root.add(fuseCodeLock.group);
  fuseCodeLock.getDigitInteractables().forEach((d) => ctx.interactables.push(d));

  const fuseItem = createItem({
    position: new THREE.Vector3(-WIDTH / 2 + 0.5, 0.4, -3),
    label: "執起保險絲",
    color: 0xff6600,
    size: 0.12,
    onPickup: () => {
      hasFuse = true;
      fuseSlot.group.userData.enabled = true;
      ctx.setObjective("將保險絲插入配電盤");
      ctx.toast("你執到一條保險絲。", "good");
    },
  });
  fuseItem.group.visible = false;
  fuseItem.group.userData.enabled = false;
  ctx.root.add(fuseItem.group);
  ctx.updatables.push((dt) => fuseItem.update(dt));
  makeInteractable(fuseItem.group, { prompt: "執起保險絲", enabled: false, onInteract: () => fuseItem.pickup() });
  ctx.interactables.push(fuseItem.group);

  // ---- hidden clues for code 462: clock=4, barrel=6, painting=2 ----
  decoy(ctx, { group: makeClock(), position: { x: 3.5, y: 3.2, z: DEPTH / 2 - 0.1 }, label: "睇個鐘", flavor: [
    "時針停喺 4。分針停喺 12。4:00。",
    "鐘面有 4 個羅馬數字被圈住。",
  ] });
  decoy(ctx, { group: makeBarrel(0x554433), position: { x: 4.5, y: 0, z: 3.5 }, footprint: { w: 0.6, d: 0.6 }, label: "查看油桶", flavor: [
    "桶面噴咗一個大數字：6。",
    "桶身貼住標籤：容量 6 升。",
  ] });
  decoy(ctx, { group: makePainting(0x3a4a6a), model: "painting", position: { x: 2.6, y: 2.3, z: DEPTH / 2 - 0.1 }, label: "細看油畫", flavor: [
    "畫中有 2 隻鳥，向住同一個方向飛。",
    "畫框上有 2 個掛鉤。",
  ] });

  // ---- hidden clues for gem sequence: colors referenced across objects ----
  decoy(ctx, { group: makePainting(0x1a2a4a), model: "painting", position: { x: -WIDTH / 2 + 0.1, y: 2.3, z: 1 }, rotation: Math.PI / 2, label: "細看油畫", flavor: [
    "畫中四顆寶石排成一行：藍、紅、綠、琥珀。",
    "油畫左側寫住顏色順序：藍→紅→綠→琥珀。",
  ] });
  decoy(ctx, { group: makeBooks(), model: "books", position: { x: -5.5, y: 0.75, z: 4.5 }, footprint: null, label: "翻閱書堆", flavor: [
    "一本書嘅書脊按顏色排列：藍、紅、綠、黃。",
    "書中夾著一張紙條：『藍紅綠琥珀』。",
  ] });

  // ---- decoys + scatter ----
  placeRoom4Decoys(ctx);
  scatter(ctx, {
    zones: [
      { x: -4, z: 4, w: 2, d: 2, y: 0 },
      { x: 4, z: 4, w: 2, d: 2, y: 0 },
      { x: 0, z: 2, w: 2, d: 2, y: 0 },
      { x: -3, z: -2, w: 2, d: 2, y: 0 },
      { x: 3, z: -2, w: 2, d: 2, y: 0 },
    ],
    count: 50,
    models: ["book", "books", "lampTable"],
    label: "搜查雜物",
    flavor: [
      "一條燒斷嘅保險絲。冇用。",
      "一張電路圖。但顏色俾人塗黑。",
      "一個螺絲批。但擰唔到任何螺絲。",
      "一張紙寫住『4-6-2』，但下面撕走咗。",
      "一個電錶。讀數係 0。",
      "灰塵同金屬碎屑。",
      "一個接線端子。空嘅。",
    ],
  });

  ctx.updatables.push(() => {
    if (opened && exitZoneMet(ctx.getPlayer())) ctx.goNext();
  });

  return { spawn: { x: 0, z: DEPTH / 2 - 1.4, yaw: 0 }, objective: "配電盤熄咗。搵出密碼開櫃。" };
}

/* ==================================================================
 * ROOM 5 — 假出口 (finale: 5 doors, only the unmarked one is real)
 * ================================================================== */
function buildRoom5(ctx) {
  addAmbient(ctx);
  addShell(ctx, { frontGaps: [-4.5, -1.5, 1.5, 4.5, 6.0] });
  detailArchitecture(ctx);
  addLight(ctx, 0xbfd8ff, 1.4, 0, HEIGHT - 0.5, 0, 40, true);
  addDust(ctx, 500);

  const halfD = DEPTH / 2;

  // 5 doors along the front wall. Positions: -4.5, -1.5, 1.5, 4.5, and a side door at +X wall
  // TRUE door: position 6.0 on the +X side wall (not on the front wall line), unmarked/dim
  const trueDoor = createDoor({ width: DOOR_W - 0.2, height: 3.0, color: 0x2a3140, emissive: 0x000000 });
  trueDoor.group.position.set(WIDTH / 2 - 0.3, 0, 2);
  trueDoor.group.rotation.y = -Math.PI / 2;
  ctx.root.add(trueDoor.group);
  trueDoor.update(0);
  ctx.updatables.push((dt) => trueDoor.update(dt));
  makeInteractable(trueDoor.group, { prompt: "推開嗰道暗門", onInteract: () => ctx.onWin() });
  ctx.interactables.push(trueDoor.group);

  // 4 FALSE doors (all glowing EXIT)
  const fakePositions = [-4.5, -1.5, 1.5, 4.5];
  for (const fx of fakePositions) {
    const f = createDoor({ width: DOOR_W - 0.2, height: 3.0, color: 0x11331a, emissive: 0x39ff7a });
    f.group.position.set(fx, 0, -halfD + 0.15);
    ctx.root.add(f.group);
    f.update(0);
    ctx.updatables.push((dt) => f.update(dt));
    const light = addLight(ctx, 0x39ff7a, 1.3, fx, 2.4, -halfD + 1.6, 6);
    ctx.updatables.push(flicker(light, { base: 1.2, amp: 0.25 + Math.min(ctx.loopCount, 6) * 0.08, speed: 7 }));
    makeInteractable(f.group, {
      prompt: "行入 EXIT",
      onInteract: () => ctx.onLoop("發光嘅『EXIT』又將你送返嚟。真正嘅出口，從來唔發光。"),
    });
    ctx.interactables.push(f.group);
  }

  // hidden clues embedded in decor (not direct notes)
  decoy(ctx, { group: makePainting(0x1a3a5a), model: "painting", position: { x: -2.5, y: 2.3, z: halfD - 0.1 }, label: "細看油畫", flavor: [
    "畫中畫咗一排發光嘅門。但旁邊有一道暗色嘅門，畫得好淡。",
    "畫家似乎想話：答案唔喺光裡面。",
  ] });
  decoy(ctx, { group: makeBooks(), model: "books", position: { x: 2.5, y: 0.75, z: 3.5 }, footprint: null, label: "翻閱書堆", flavor: [
    "一本書嘅封面寫住：『出口唔發光』。",
    "其中一頁畫咗一個箭嘴，指住右邊牆壁。",
  ] });
  decoy(ctx, { group: makeClock(), position: { x: 0, y: 3.6, z: halfD - 0.1 }, label: "睇大鐘", flavor: [
    "鐘面冇指針。得一個字：『側』。",
    "鐘嘅位置，對住右邊牆壁。",
  ] });

  placeRoom5Decoys(ctx);
  scatter(ctx, {
    zones: [
      { x: -3, z: 2, w: 2, d: 2, y: 0 },
      { x: 3, z: 2, w: 2, d: 2, y: 0 },
      { x: 0, z: 0, w: 3, d: 2, y: 0 },
      { x: -4, z: -2, w: 2, d: 2, y: 0 },
      { x: 4, z: -2, w: 2, d: 2, y: 0 },
    ],
    count: 55,
    models: ["book", "books", "paintingSmall", "lampTable"],
    label: "搜查雜物",
    flavor: [
      "一張傳單：『向著光行』。但字好模糊。",
      "一本冊子，每頁都係『EXIT』。但後頁寫住：『唔係 EXIT』。",
      "一個發光嘅牌。同門一樣綠。但冇用。",
      "一張地圖。所有路線都指向發光嘅門。但地圖邊緣有一條暗線。",
      "一面鏡。反射出嘅畫面，暗門特別清晰。",
      "一張紙條：『留意牆壁，唔係門面』。",
    ],
  });

  return {
    spawn: { x: 0, z: halfD - 1.4, yaw: 0 },
    objective: ctx.loopCount > 0 ? `你已迴圈 ${ctx.loopCount} 次。答案唔喺光裡面。` : "尋找真正嘅出口。",
  };
}

/* ---------------- public API ---------------- */
const BUILDERS = [buildRoom1, buildRoom2, buildRoom3, buildRoom4, buildRoom5];
export const ROOM_COUNT = BUILDERS.length;
export const ROOM_TITLES = ["迎賓室", "鏡廊", "貨倉", "配電房", "假出口"];

export function buildRoom(index, ctx) {
  const builder = BUILDERS[index];
  if (!builder) throw new Error(`No room at index ${index}`);
  return builder(ctx);
}

export { disposeObject, WIDTH, DEPTH, HEIGHT };
