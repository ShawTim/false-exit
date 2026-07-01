import * as THREE from "three";

/* ------------------------------------------------------------------
 * Shared materials
 * ------------------------------------------------------------------ */
export const M = {
  metal: () => new THREE.MeshStandardMaterial({ color: 0x4a5668, metalness: 0.6, roughness: 0.45 }),
  darkMetal: () => new THREE.MeshStandardMaterial({ color: 0x2a3140, metalness: 0.5, roughness: 0.6 }),
  panel: () => new THREE.MeshStandardMaterial({ color: 0x202836, roughness: 0.8 }),
  mirror: () =>
    new THREE.MeshStandardMaterial({
      color: 0x9fd8ff,
      metalness: 0.9,
      roughness: 0.08,
      emissive: 0x102030,
      emissiveIntensity: 1,
    }),
  redLight: () =>
    new THREE.MeshStandardMaterial({ color: 0x220000, emissive: 0xff3b3b, emissiveIntensity: 1.6 }),
  greenLight: () =>
    new THREE.MeshStandardMaterial({ color: 0x002211, emissive: 0x39ff7a, emissiveIntensity: 1.6 }),
  amber: () =>
    new THREE.MeshStandardMaterial({ color: 0x2a1c00, emissive: 0xffb43b, emissiveIntensity: 1.4 }),
  dim: () =>
    new THREE.MeshStandardMaterial({ color: 0x161c28, emissive: 0x05080f, emissiveIntensity: 0.6 }),
  wood: () => new THREE.MeshStandardMaterial({ color: 0x6b4a2b, roughness: 0.85 }),
  card: () =>
    new THREE.MeshStandardMaterial({ color: 0x002233, emissive: 0x18c3ff, emissiveIntensity: 1.4 }),
  note: () =>
    new THREE.MeshStandardMaterial({ color: 0xd9e6f5, emissive: 0x222b38, emissiveIntensity: 0.5 }),
};

export function box(w, h, d, mat) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
}

/* ------------------------------------------------------------------
 * Interactable wrapper
 * ------------------------------------------------------------------ */
export function makeInteractable(object, { prompt, onInteract, enabled = true, range }) {
  object.userData.interactable = true;
  object.userData.prompt = prompt;
  object.userData.onInteract = onInteract;
  object.userData.enabled = enabled;
  if (range) object.userData.range = range;
  return object;
}

/* ------------------------------------------------------------------
 * Door (visual) — slides upward to open
 * ------------------------------------------------------------------ */
export function createDoor({ width = 1.6, height = 3.2, color = 0x2a3140, emissive = 0x000000 }) {
  const group = new THREE.Group();
  const frame = box(width + 0.4, height + 0.3, 0.5, M.darkMetal());
  frame.position.y = (height + 0.3) / 2;
  group.add(frame);

  const panel = box(width, height, 0.22, new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: emissive === 0x000000 ? 0 : 1.2,
    metalness: 0.4,
    roughness: 0.5,
  }));
  panel.position.y = height / 2;
  group.add(panel);

  const sign = box(width * 0.5, 0.26, 0.06, emissive === 0x000000 ? M.dim() : M.greenLight());
  sign.position.set(0, height - 0.4, 0.18);
  group.add(sign);

  let openAmt = 0;
  let target = 0;
  function setOpen(v) {
    target = v ? 1 : 0;
  }
  function update(dt) {
    openAmt += (target - openAmt) * Math.min(1, dt * 6);
    panel.position.y = height / 2 + openAmt * (height + 0.1);
  }
  return { group, setOpen, update, panel, sign };
}

/* ------------------------------------------------------------------
 * Keycard pickup
 * ------------------------------------------------------------------ */
export function createKeycard({ position }) {
  const group = new THREE.Group();
  group.position.copy(position);
  const card = box(0.34, 0.02, 0.22, M.card());
  card.rotation.x = -Math.PI / 2.4;
  group.add(card);
  const glow = new THREE.PointLight(0x18c3ff, 0.6, 2.5);
  glow.position.y = 0.15;
  group.add(glow);

  let picked = false;
  let bob = Math.random() * 6;
  function update(dt) {
    if (picked) return;
    bob += dt;
    group.position.y = position.y + Math.sin(bob * 2) * 0.04;
    group.rotation.y += dt * 0.8;
  }
  function pickup() {
    picked = true;
    group.visible = false;
  }
  return { group, update, pickup, get picked() { return picked; } };
}

/* ------------------------------------------------------------------
 * Clue note (read on interact)
 * ------------------------------------------------------------------ */
export function createClue({ position, rotation = 0, title = "線索", text = "" }) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.y = rotation;
  const plaque = box(0.7, 0.5, 0.04, M.note());
  plaque.position.y = 0.25;
  group.add(plaque);
  return { group, title, text };
}

/* ------------------------------------------------------------------
 * Lever — toggles between two states
 * ------------------------------------------------------------------ */
export function createLever({ position, rotation = 0, initial = false, onChange }) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.y = rotation;

  const base = box(0.3, 0.5, 0.3, M.darkMetal());
  base.position.y = 0.25;
  group.add(base);

  const pivot = new THREE.Group();
  pivot.position.set(0, 0.45, 0.12);
  group.add(pivot);
  const handle = box(0.07, 0.5, 0.07, M.metal());
  handle.position.y = 0.22;
  pivot.add(handle);
  const knob = box(0.14, 0.14, 0.14, M.amber());
  knob.position.y = 0.45;
  pivot.add(knob);

  let state = initial;
  let angle = initial ? -0.6 : 0.6;
  let targetAngle = angle;
  apply();

  function apply() {
    pivot.rotation.x = angle;
  }
  function toggle() {
    state = !state;
    targetAngle = state ? -0.6 : 0.6;
    if (onChange) onChange(state);
  }
  function update(dt) {
    angle += (targetAngle - angle) * Math.min(1, dt * 10);
    apply();
  }
  return { group, toggle, update, get state() { return state; }, setState(s) { state = s; targetAngle = s ? -0.6 : 0.6; } };
}

/* ------------------------------------------------------------------
 * Mirror — rotates 90° per interact; reflective normal in XZ plane
 * ------------------------------------------------------------------ */
export function createMirror({ position, rotation = 0, initialSlot = 0 }) {
  const group = new THREE.Group();
  group.position.copy(position);

  const stand = box(0.12, 1.3, 0.12, M.darkMetal());
  stand.position.y = 0.65;
  group.add(stand);
  const panel = box(1.1, 1.4, 0.08, M.mirror());
  panel.position.y = 1.4;
  group.add(panel);

  const baseRot = rotation + Math.PI / 4; // always land on a diagonal
  let slot = initialSlot % 4;
  group.rotation.y = baseRot + slot * (Math.PI / 2);

  function rotate90() {
    slot = (slot + 1) % 4;
  }
  function update(dt) {
    const target = baseRot + slot * (Math.PI / 2);
    group.rotation.y += (target - group.rotation.y) * Math.min(1, dt * 9);
  }
  const _q = new THREE.Quaternion();
  const _n = new THREE.Vector3();
  function getNormal() {
    group.updateMatrixWorld(true);
    group.getWorldQuaternion(_q);
    _n.set(0, 0, 1).applyQuaternion(_q);
    _n.y = 0;
    _n.normalize();
    return _n;
  }
  function getPanel() {
    return panel;
  }
  return { group, rotate90, update, getNormal, getPanel };
}

/* ------------------------------------------------------------------
 * Laser system — emitter + receptor + beam tracing through mirrors
 * ------------------------------------------------------------------ */
export function createLaser({ emitterPos, emitterDir, receptorPos, mirrors = [], solids = [], onSolved }) {
  const BEAM_Y = emitterPos.y;

  const group = new THREE.Group();
  // emitter
  const emitterMesh = box(0.3, 0.3, 0.3, M.redLight());
  emitterMesh.position.copy(emitterPos);
  group.add(emitterMesh);
  // receptor
  const receptorMesh = box(0.5, 0.5, 0.2, M.dim());
  receptorMesh.position.copy(receptorPos);
  group.add(receptorMesh);
  const receptorLight = new THREE.PointLight(0xff3b3b, 0.4, 3);
  receptorLight.position.copy(receptorPos);
  group.add(receptorLight);

  const matOff = M.dim();
  const matOn = M.greenLight();

  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xff5050,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const beamMesh = new THREE.Mesh(new THREE.BufferGeometry(), beamMat);
  beamMesh.frustumCulled = false;
  group.add(beamMesh);

  const dir = emitterDir.clone().setY(0).normalize();
  const origin = emitterPos.clone();

  let solved = false;
  let hitting = false;
  const raycaster = new THREE.Raycaster();
  raycaster.far = 40;

  const _d = new THREE.Vector3();

  function reflect(d, n) {
    return d.clone().sub(n.clone().multiplyScalar(2 * d.dot(n)));
  }

  function trace() {
    const points = [origin.clone()];
    let cur = origin.clone();
    let curDir = dir.clone();
    let hitReceptor = false;

    const targets = [];
    for (const m of mirrors) targets.push(m.getPanel());
    targets.push(receptorMesh);
    for (const s of solids) targets.push(s);

    for (let bounce = 0; bounce < 8; bounce++) {
      raycaster.set(cur, curDir);
      const hits = raycaster.intersectObjects(targets, false);
      if (!hits.length) {
        points.push(cur.clone().addScaledVector(curDir, 30));
        break;
      }
      const hit = hits[0];
      points.push(hit.point.clone());
      if (hit.object === receptorMesh) {
        hitReceptor = true;
        break;
      }
      // find mirror
      const mirror = mirrors.find((m) => m.getPanel() === hit.object);
      if (!mirror) break;
      const n = mirror.getNormal();
      // ensure we don't reflect into the surface
      curDir = reflect(curDir, n);
      curDir.y = 0;
      curDir.normalize();
      cur.copy(hit.point).addScaledVector(curDir, 0.002);
    }

    // build a solid tube beam from the trace points
    if (points.length >= 2) {
      const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.0);
      const tube = new THREE.TubeGeometry(curve, Math.max(8, points.length * 6), 0.06, 8, false);
      beamMesh.geometry.dispose();
      beamMesh.geometry = tube;
    }
    return hitReceptor;
  }

  function update(dt) {
    const was = hitting;
    hitting = trace();
    if (hitting) {
      beamMat.color.set(0x39ff7a);
      receptorMesh.material = matOn;
      receptorLight.color.set(0x39ff7a);
    } else {
      beamMat.color.set(0xff4d4d);
      receptorMesh.material = matOff;
      receptorLight.color.set(0xff3b3b);
    }
    if (hitting && !was && !solved) {
      solved = true;
      if (onSolved) onSolved();
    }
  }

  function resetSolved() {
    solved = false;
  }

  return { group, update, receptorMesh, get solved() { return solved; }, resetSolved };
}

/* ------------------------------------------------------------------
 * Pressure plate — active when a box (or player) sits on it
 * ------------------------------------------------------------------ */
export function createPlate({ position, size = 1.0, onChange }) {
  const group = new THREE.Group();
  group.position.copy(position);
  const base = box(size, 0.06, size, M.darkMetal());
  base.position.y = 0.03;
  group.add(base);
  const top = box(size * 0.86, 0.05, size * 0.86, M.dim());
  top.position.y = 0.08;
  group.add(top);

  let active = false;
  function update(dt, sources) {
    // sources: array of {x, z}
    const half = size / 2 + 0.05;
    let on = false;
    for (const s of sources) {
      if (Math.abs(s.x - position.x) < half && Math.abs(s.z - position.z) < half) {
        on = true;
        break;
      }
    }
    if (on !== active) {
      active = on;
      top.material = on ? M.greenLight() : M.dim();
      top.position.y = on ? 0.05 : 0.08;
      if (onChange) onChange(active);
    }
  }
  return { group, update, position, get active() { return active; } };
}

/* ------------------------------------------------------------------
 * Push box — Sokoban-style, AABB pushable
 * ------------------------------------------------------------------ */
export function createPushBox({ position, size = 0.9, height = 0.9, color }) {
  const group = new THREE.Group();
  group.position.set(position.x, 0, position.z);
  const mesh = box(size, height, size, color ? new THREE.MeshStandardMaterial({ color, roughness: 0.8 }) : M.wood());
  mesh.position.y = height / 2;
  group.add(mesh);

  const half = size / 2;
  function getAABB() {
    return {
      kind: "box",
      minX: group.position.x - half,
      maxX: group.position.x + half,
      minZ: group.position.z - half,
      maxZ: group.position.z + half,
    };
  }
  function tryPush(axis, amount, colliders) {
    const old = group.position[axis];
    group.position[axis] = old + amount;
    const a = getAABB();
    for (const c of colliders) {
      if (c === self) continue;
      if (c.enabled === false) continue;
      const other = c.kind === "box" ? c.box.getAABB() : c;
      if (
        a.minX < other.maxX &&
        a.maxX > other.minX &&
        a.minZ < other.maxZ &&
        a.maxZ > other.minZ
      ) {
        group.position[axis] = old;
        return false;
      }
    }
    return true;
  }
  const self = { kind: "box", box: { getAABB, tryPush, get group() { return group; } } };
  return {
    group,
    collider: self,
    getAABB,
    tryPush,
    get position() { return group.position; },
    get size() { return size; },
  };
}

/* ------------------------------------------------------------------
 * Circuit puzzle — press switches in the target order
 * ------------------------------------------------------------------ */
export function createCircuit({ switchDefs, target, onSolved, onWrong }) {
  // switchDefs: [{ position, color }]
  const group = new THREE.Group();
  const switches = [];
  const entered = [];
  let powered = false;

  function gemMat(color, lit) {
    return new THREE.MeshStandardMaterial({
      color: lit ? color : 0x14181f,
      emissive: color,
      emissiveIntensity: lit ? 2.0 : 0.35,
      roughness: 0.4,
    });
  }

  switchDefs.forEach((def, i) => {
    const sg = new THREE.Group();
    sg.position.copy(def.position);
    const plate = box(0.5, 0.6, 0.18, M.darkMetal());
    plate.position.y = 0.3;
    sg.add(plate);
    const light = box(0.34, 0.34, 0.1, gemMat(def.color, false));
    light.position.set(0, 0.62, 0.1);
    sg.add(light);
    group.add(sg);
    switches.push({ group: sg, light, index: i, color: def.color, lit: false });
  });

  function setLit(sw, on) {
    sw.lit = on;
    sw.light.material.dispose();
    sw.light.material = gemMat(sw.color, on);
  }

  function reset() {
    entered.length = 0;
    switches.forEach((s) => setLit(s, false));
  }

  function flip(i) {
    if (powered) return;
    const sw = switches[i];
    if (sw.lit) return;
    setLit(sw, true);
    entered.push(i);
    if (entered.length === target.length) {
      const ok = entered.every((v, idx) => v === target[idx]);
      if (ok) {
        powered = true;
        switches.forEach((s) => {
          s.light.material.dispose();
          s.light.material = gemMat(0x39ff7a, true);
        });
        if (onSolved) onSolved();
      } else {
        if (onWrong) onWrong();
        setTimeout(() => reset(), 450);
      }
    }
  }

  function update() {}

  return { group, switches, flip, reset, get powered() { return powered; } };
}

/* ------------------------------------------------------------------
 * Flicker helper for atmospheric lights
 * ------------------------------------------------------------------ */
export function flicker(light, { base = 0.4, amp = 0.25, speed = 8 } = {}) {
  let t = Math.random() * 10;
  return (dt) => {
    t += dt * speed;
    light.intensity = base + Math.sin(t) * amp * 0.5 + Math.random() * amp * 0.5;
  };
}

/* ==================================================================
 * MULTI-STEP PUZZLE ENTITIES
 * ================================================================== */

/* ---- Generic pickup item (battery, fuse, key, etc.) ---- */
export function createItem({ position, label = "物品", color = 0xffcc44, size = 0.18, onPickup }) {
  const group = new THREE.Group();
  group.position.copy(position);
  const mat = new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: 0.8, roughness: 0.4,
  });
  const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(size, 0), mat);
  mesh.position.y = size + 0.02;
  group.add(mesh);
  const glow = new THREE.PointLight(color, 0.5, 2.5);
  glow.position.y = size + 0.1;
  group.add(glow);

  let picked = false;
  let bob = Math.random() * 6;
  function update(dt) {
    if (picked) return;
    bob += dt;
    group.position.y = position.y + Math.sin(bob * 2.5) * 0.05;
    group.rotation.y += dt * 1.2;
  }
  function pickup() {
    if (picked) return false;
    picked = true;
    group.visible = false;
    if (onPickup) onPickup();
    return true;
  }
  return { group, update, pickup, get picked() { return picked; } };
}

/* ---- Code lock: cycle digits to match code ---- */
export function createCodeLock({ position, rotation = 0, code, length, onUnlock, onAttempt }) {
  const len = length || (code ? String(code).length : 3);
  const digits = String(code).padStart(len, "0").split("").map(Number);
  const current = new Array(len).fill(0);

  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.y = rotation;

  // panel
  const panel = box(0.1 + len * 0.36, 0.7, 0.12, M.darkMetal());
  panel.position.y = 0.35;
  group.add(panel);

  const digitMeshes = [];
  const digitGroups = [];
  const digitMatOff = new THREE.MeshStandardMaterial({ color: 0x110000, emissive: 0x330000, emissiveIntensity: 0.5 });
  const digitMatOn = new THREE.MeshStandardMaterial({ color: 0x002200, emissive: 0x39ff7a, emissiveIntensity: 1.5 });

  for (let i = 0; i < len; i++) {
    const dg = new THREE.Group();
    dg.position.set(-((len - 1) * 0.36) / 2 + i * 0.36, 0.42, 0.08);
    group.add(dg);
    // digit display (small box that shows number via color count trick — use text canvas)
    const display = makeDigitCanvas(0);
    display.position.z = 0.02;
    dg.add(display);
    digitMeshes.push(display);
    digitGroups.push(dg);
  }

  let unlocked = false;

  function makeDigitCanvas(val) {
    const canvas = document.createElement("canvas");
    canvas.width = 64; canvas.height = 80;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#020a00";
    ctx.fillRect(0, 0, 64, 80);
    ctx.fillStyle = "#39ff7a";
    ctx.font = "bold 56px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(val), 32, 42);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.35), mat);
    mesh._canvas = canvas;
    mesh._ctx = ctx;
    mesh._tex = tex;
    return mesh;
  }

  function updateDigit(i) {
    const m = digitMeshes[i];
    m._ctx.fillStyle = "#020a00";
    m._ctx.fillRect(0, 0, 64, 80);
    m._ctx.fillStyle = unlocked ? "#39ff7a" : "#ffaa33";
    m._ctx.fillText(String(current[i]), 32, 42);
    m._tex.needsUpdate = true;
  }

  function cycleDigit(i) {
    if (unlocked) return;
    current[i] = (current[i] + 1) % 10;
    updateDigit(i);
    const ok = current.every((v, idx) => v === digits[idx]);
    if (ok) {
      unlocked = true;
      digitMeshes.forEach((_, idx) => updateDigit(idx));
      if (onUnlock) onUnlock();
    } else {
      if (onAttempt) onAttempt(current);
    }
  }

  // each digit group is individually interactable
  function getDigitInteractables() {
    return digitGroups.map((dg, i) => {
      makeInteractable(dg, {
        prompt: `轉數字 ${i + 1}`,
        onInteract: () => cycleDigit(i),
      });
      return dg;
    });
  }

  function update() {}

  return { group, cycleDigit, getDigitInteractables, get unlocked() { return unlocked; }, update };
}

/* ---- Fuse slot: accepts a fuse item ---- */
export function createSlot({ position, rotation = 0, accepts, label = "插入", onInsert }) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.y = rotation;
  const frame = box(0.28, 0.28, 0.14, M.darkMetal());
  frame.position.y = 0.14;
  group.add(frame);
  const socket = box(0.16, 0.16, 0.08, M.dim());
  socket.position.set(0, 0.14, 0.05);
  group.add(socket);

  let filled = false;
  function fill() {
    if (filled) return false;
    filled = true;
    socket.material = M.greenLight();
    if (onInsert) onInsert();
    return true;
  }
  return { group, fill, get filled() { return filled; } };
}

/* ---- Locked container: opens when unlocked, reveals contents ---- */
export function createContainer({ position, rotation = 0, color = 0x3a4252, onOpen }) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.y = rotation;
  const body = box(0.8, 0.7, 0.5, new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.3 }));
  body.position.y = 0.35;
  group.add(body);
  const lid = box(0.82, 0.08, 0.52, new THREE.MeshStandardMaterial({ color: 0x2a3040, roughness: 0.6, metalness: 0.4 }));
  lid.position.y = 0.74;
  group.add(lid);

  let opened = false;
  let lidTarget = 0;
  function open() {
    if (opened) return;
    opened = true;
    lidTarget = 0.5;
    if (onOpen) onOpen();
  }
  function update(dt) {
    lid.position.y += (0.74 + lidTarget - lid.position.y) * Math.min(1, dt * 5);
  }
  return { group, open, update, get opened() { return opened; } };
}

/* ---- Valve: rotate to open/close a mechanism ---- */
export function createValve({ position, rotation = 0, turns = 2, onOpen }) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.y = rotation;
  const pipe = box(0.1, 0.4, 0.1, M.metal());
  pipe.position.y = 0.2;
  group.add(pipe);
  const wheel = new THREE.Group();
  wheel.position.y = 0.45;
  group.add(wheel);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 6, 12), M.metal());
  wheel.add(ring);
  for (let i = 0; i < 4; i++) {
    const spoke = box(0.36, 0.04, 0.04, M.metal());
    spoke.rotation.z = (i * Math.PI) / 2;
    wheel.add(spoke);
  }

  let count = 0;
  let angle = 0;
  let targetAngle = 0;
  let done = false;
  function turn() {
    if (done) return;
    count++;
    targetAngle -= Math.PI / 2;
    if (count >= turns * 4) {
      done = true;
      if (onOpen) onOpen();
    }
  }
  function update(dt) {
    angle += (targetAngle - angle) * Math.min(1, dt * 8);
    wheel.rotation.z = angle;
  }
  return { group, turn, update, get done() { return done; }, get progress() { return count; }, get needed() { return turns * 4; } };
}

/* ---- Keypad button (single press, for generic keypads) ---- */
export function createKeypadButton({ position, label, onPress, color = 0x3a4458 }) {
  const group = new THREE.Group();
  group.position.copy(position);
  const btn = box(0.14, 0.14, 0.05, new THREE.MeshStandardMaterial({ color, roughness: 0.5 }));
  btn.position.y = 0.07;
  group.add(btn);
  let pressed = false;
  function press() {
    if (pressed) return;
    pressed = true;
    btn.material = M.greenLight();
    if (onPress) onPress();
  }
  return { group, press, get pressed() { return pressed; } };
}

/* ---- Status light (visual indicator for puzzle state) ---- */
export function createStatusLight({ position, color = 0xff0000 }) {
  const group = new THREE.Group();
  group.position.copy(position);
  const mat = new THREE.MeshStandardMaterial({ color: 0x110000, emissive: color, emissiveIntensity: 1.2 });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), mat);
  group.add(mesh);
  function setState(on) {
    mat.emissiveIntensity = on ? 1.5 : 0.2;
  }
  return { group, setState };
}
