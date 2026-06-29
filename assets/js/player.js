import * as THREE from "three";

const EYE = 1.7;
const RADIUS = 0.36;
const WALK = 3.4;
const RUN = 5.4;
const ACCEL = 12;
const PITCH_LIMIT = 1.4;

export function createPlayer({ camera }) {
  const position = new THREE.Vector3(0, 0, 4);
  let yaw = Math.PI;
  let pitch = 0;
  const vel = new THREE.Vector3();

  camera.rotation.order = "YXZ";

  function reset(pos, y = Math.PI) {
    position.set(pos.x, 0, pos.z);
    yaw = y;
    pitch = 0;
    vel.set(0, 0, 0);
    syncCamera();
  }

  function syncCamera() {
    camera.position.set(position.x, EYE, position.z);
    camera.rotation.set(pitch, yaw, 0, "YXZ");
  }

  function forwardVec() {
    return new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  }
  function rightVec() {
    return new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  }

  function overlapsExpanded(px, pz, aabb) {
    return (
      px > aabb.minX - RADIUS &&
      px < aabb.maxX + RADIUS &&
      pz > aabb.minZ - RADIUS &&
      pz < aabb.maxZ + RADIUS
    );
  }

  function aabbOf(c) {
    return c.kind === "box" ? c.box.getAABB() : c;
  }

  function moveAxis(axis, amount, colliders) {
    if (amount === 0) return;
    position[axis] += amount;
    for (const c of colliders) {
      if (c.enabled === false) continue;
      const aabb = aabbOf(c);
      if (!overlapsExpanded(position.x, position.z, aabb)) continue;
      if (c.kind === "box") {
        const pushed = c.box.tryPush(axis, amount, colliders);
        const aabb2 = c.box.getAABB();
        if (!pushed && overlapsExpanded(position.x, position.z, aabb2)) {
          resolve(axis, amount, aabb2);
        }
        continue;
      }
      resolve(axis, amount, aabb);
    }
  }

  function resolve(axis, amount, aabb) {
    if (axis === "x") {
      position.x = amount > 0 ? aabb.minX - RADIUS : aabb.maxX + RADIUS;
    } else {
      position.z = amount > 0 ? aabb.minZ - RADIUS : aabb.maxZ + RADIUS;
    }
  }

  function update(dt, input, colliders) {
    const look = input.drainLook();
    yaw -= look.dx;
    pitch -= look.dy;
    pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch));

    const f = forwardVec();
    const r = rightVec();
    const mx = input.state.move.x;
    const my = input.state.move.y;
    const wish = new THREE.Vector3();
    wish.addScaledVector(f, my);
    wish.addScaledVector(r, mx);
    if (wish.lengthSq() > 1) wish.normalize();

    const speed = input.state.run ? RUN : WALK;
    const targetX = wish.x * speed;
    const targetZ = wish.z * speed;
    // smooth velocity
    vel.x += (targetX - vel.x) * Math.min(1, ACCEL * dt);
    vel.z += (targetZ - vel.z) * Math.min(1, ACCEL * dt);

    moveAxis("x", vel.x * dt, colliders);
    moveAxis("z", vel.z * dt, colliders);

    syncCamera();
  }

  return { position, reset, update, get yaw() { return yaw; } };
}
