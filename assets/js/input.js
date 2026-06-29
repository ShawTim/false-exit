export function createInput({ domElement, joystickEl, stickEl, interactEl, mobile = false }) {
  const state = {
    move: { x: 0, y: 0 },
    run: false,
    look: { dx: 0, dy: 0 },
    interactQueued: false,
    paused: false,
  };

  const MOUSE_SENS = 0.0022;
  const TOUCH_LOOK_SENS = 0.006;

  const keys = new Set();
  let pointerLocked = false;

  const lockChangeCbs = new Set();
  function onLock(cb) {
    lockChangeCbs.add(cb);
    return () => lockChangeCbs.delete(cb);
  }

  /* ---------------- Desktop ---------------- */
  function onKeyDown(e) {
    if (e.repeat) return;
    const k = e.key.toLowerCase();
    keys.add(k);
    if (k === "e") state.interactQueued = true;
    if (k === "escape") state.paused = true;
    if (k === "shift") state.run = true;
  }
  function onKeyUp(e) {
    const k = e.key.toLowerCase();
    keys.delete(k);
    if (k === "shift") state.run = false;
  }

  function onMouseMove(e) {
    if (!pointerLocked) return;
    state.look.dx += e.movementX * MOUSE_SENS;
    state.look.dy += e.movementY * MOUSE_SENS;
  }

  function onLockChange() {
    pointerLocked = document.pointerLockElement === domElement;
    lockChangeCbs.forEach((cb) => cb(pointerLocked));
  }

  function requestLock() {
    if (mobile) return;
    if (!pointerLocked) domElement.requestPointerLock?.();
  }

  /* ---------------- Touch ---------------- */
  // touch role map: identifier -> { role, startX, startY, lastX, lastY }
  const touches = new Map();
  const JOY_MAX = 52;

  function roleForTouch(t) {
    if (joystickEl.contains(t.target)) return "joy";
    if (interactEl.contains(t.target)) return "btn";
    if (t.target.closest && t.target.closest(".overlay")) return null; // let overlay buttons work
    return "look";
  }

  function onTouchStart(e) {
    for (const t of e.changedTouches) {
      const role = roleForTouch(t);
      if (role === null || role === "btn") continue;
      touches.set(t.identifier, { role, lastX: t.clientX, lastY: t.clientY });
      if (role === "joy") updateJoy(t.clientX, t.clientY, true);
    }
    if (touches.size > 0) e.preventDefault();
  }

  function onTouchMove(e) {
    for (const t of e.changedTouches) {
      const data = touches.get(t.identifier);
      if (!data) continue;
      if (data.role === "joy") {
        updateJoy(t.clientX, t.clientY, false);
      } else if (data.role === "look") {
        state.look.dx += (t.clientX - data.lastX) * TOUCH_LOOK_SENS;
        state.look.dy += (t.clientY - data.lastY) * TOUCH_LOOK_SENS;
        data.lastX = t.clientX;
        data.lastY = t.clientY;
      }
    }
    if (touches.size > 0) e.preventDefault();
  }

  function onTouchEnd(e) {
    for (const t of e.changedTouches) {
      const data = touches.get(t.identifier);
      if (!data) continue;
      if (data.role === "joy") resetJoy();
      touches.delete(t.identifier);
    }
  }

  function updateJoy(clientX, clientY, reset) {
    const rect = joystickEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const len = Math.hypot(dx, dy) || 1;
    if (len > JOY_MAX) {
      dx = (dx / len) * JOY_MAX;
      dy = (dy / len) * JOY_MAX;
    }
    stickEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    state.move.x = dx / JOY_MAX;
    state.move.y = -dy / JOY_MAX;
  }

  function resetJoy() {
    stickEl.style.transform = "translate(-50%, -50%)";
    state.move.x = 0;
    state.move.y = 0;
  }

  function onInteractTap(e) {
    e.preventDefault();
    state.interactQueued = true;
  }

  /* ---------------- Per-frame ---------------- */
  function update() {
    if (!mobile) {
      let x = 0;
      let y = 0;
      if (keys.has("w") || keys.has("arrowup")) y += 1;
      if (keys.has("s") || keys.has("arrowdown")) y -= 1;
      if (keys.has("d") || keys.has("arrowright")) x += 1;
      if (keys.has("a") || keys.has("arrowleft")) x -= 1;
      const len = Math.hypot(x, y);
      if (len > 1) {
        x /= len;
        y /= len;
      }
      state.move.x = x;
      state.move.y = y;
    }
  }

  function drainLook() {
    const l = state.look;
    state.look = { dx: 0, dy: 0 };
    return l;
  }

  function consumeInteract() {
    const v = state.interactQueued;
    state.interactQueued = false;
    return v;
  }

  function consumePause() {
    const v = state.paused;
    state.paused = false;
    return v;
  }

  function dispose() {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("pointerlockchange", onLockChange);
    window.removeEventListener("touchstart", onTouchStart, { passive: false });
    window.removeEventListener("touchmove", onTouchMove, { passive: false });
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("touchcancel", onTouchEnd);
    interactEl.removeEventListener("touchstart", onInteractTap);
    interactEl.removeEventListener("click", onInteractTap);
  }

  /* ---------------- Bind ---------------- */
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("pointerlockchange", onLockChange);
  if (mobile) {
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);
  }
  interactEl.addEventListener("touchstart", onInteractTap, { passive: false });
  interactEl.addEventListener("click", onInteractTap);

  return {
    state,
    update,
    drainLook,
    consumeInteract,
    consumePause,
    requestLock,
    onLock,
    isLocked: () => pointerLocked,
    dispose,
  };
}
