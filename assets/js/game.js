import * as THREE from "three";
import { buildRoom, ROOM_COUNT, ROOM_TITLES, disposeObject } from "./world.js";

export function createGame({ engine, player, interactor, input, hud, mobile }) {
  const { scene, camera } = engine;

  let state = "intro"; // intro | playing | transition | ending | paused
  let roomIndex = 0;
  let loopCount = 0;
  let prevPlaying = "playing";
  let clueOpen = false;

  const roomRoot = new THREE.Group();
  scene.add(roomRoot);

  const colliders = [];
  const interactables = [];
  const updatables = [];

  const ctx = {
    root: roomRoot,
    colliders,
    interactables,
    updatables,
    get loopCount() { return loopCount; },
    getPlayer: () => player,
    setObjective: (t) => hud.setObjective(t),
    toast: (t, kind) => hud.toast(t, kind),
    showClue: (title, text) => openClue(title, text),
    goNext: () => goNext(),
    onLoop: (msg) => onLoop(msg),
    onWin: () => onWin(),
  };

  function clearRoom() {
    interactor.clear();
    colliders.length = 0;
    interactables.length = 0;
    updatables.length = 0;
    disposeObject(roomRoot);
    while (roomRoot.children.length) roomRoot.remove(roomRoot.children[0]);
  }

  function loadRoom(index) {
    clearRoom();
    roomIndex = index;
    const desc = buildRoom(index, ctx);
    scene.updateMatrixWorld(true);
    player.reset(new THREE.Vector3(desc.spawn.x, 0, desc.spawn.z), desc.spawn.yaw);
    hud.setRoomName(`第 ${index + 1} 間　${ROOM_TITLES[index]}`);
    hud.setLoop(loopCount);
    hud.setObjective(desc.objective);
    hud.setPrompt(null);
  }

  function goNext() {
    if (state !== "playing") return;
    const next = roomIndex + 1;
    state = "transition";
    hud.setPrompt(null);
    hud.fadeOut(() => {
      if (next >= ROOM_COUNT) {
        finishWin(true);
        return;
      }
      loadRoom(next);
      hud.fadeIn(() => { state = "playing"; });
    });
  }

  function onLoop(msg) {
    if (state !== "playing") return;
    state = "transition";
    loopCount++;
    hud.setLoop(loopCount);
    hud.toast(msg, "warn");
    hud.fadeOut(() => {
      loadRoom(roomIndex); // rebuild finale with new loopCount
      hud.fadeIn(() => { state = "playing"; });
    });
  }

  function onWin() {
    if (state !== "playing") return;
    state = "transition";
    hud.fadeOut(() => finishWin(false));
  }

  function finishWin(unused) {
    state = "ending";
    interactor.clear();
    hud.hideHUD();
    hud.hideTouch();
    const tookLoop = loopCount > 0;
    hud.showEnding({
      title: tookLoop ? "你走出了循環" : "你一眼看穿",
      text: tookLoop
        ? `你行錯咗 ${loopCount} 次假出口，\n但最終，你揀咗嗰道唔發光嘅門。\n出口從來唔係一道門，\n而係一個唔再被騙嘅決定。`
        : "你冇俾任何一道發光嘅門呃到。\n你一眼就搵到真正嘅出口：\n嗰道唔發光、唔自稱出口嘅門。\n你從一開始就冇陷入循環。",
      stats: `假出口嘗試：${loopCount}　|　通關房間：${ROOM_COUNT}`,
    });
  }

  /* ---------------- lifecycle ---------------- */
  function openClue(title, text) {
    clueOpen = true;
    hud.showClue(title, text);
    if (!mobile && document.pointerLockElement) document.exitPointerLock();
  }
  function closeClue() {
    if (!clueOpen) return;
    clueOpen = false;
    hud.hideClue();
    if (!mobile) input.requestLock();
  }
  hud.setClueCloser(() => closeClue());

  function start() {
    state = "playing";
    roomIndex = 0;
    loopCount = 0;
    loadRoom(0);
    hud.hideIntro();
    hud.showHUD();
    if (mobile) hud.showTouch();
    if (!mobile) input.requestLock();
  }

  function pause() {
    if (state !== "playing") return;
    prevPlaying = state;
    state = "paused";
    hud.showPause();
    if (!mobile && document.exitPointerLock) document.exitPointerLock();
  }
  function resume() {
    if (state !== "paused") return;
    hud.hidePause();
    state = "playing";
    if (!mobile) input.requestLock();
  }

  function restart() {
    hud.hidePause();
    hud.hideEnding();
    clueOpen = false;
    hud.hideClue();
    clearRoom();
    state = "intro";
    loopCount = 0;
    roomIndex = 0;
    hud.showIntro();
    hud.hideHUD();
  }

  function playAgain() {
    hud.hideEnding();
    state = "playing";
    roomIndex = 0;
    loopCount = 0;
    loadRoom(0);
    hud.showHUD();
    if (mobile) hud.showTouch();
    if (!mobile) input.requestLock();
  }

  /* ---------------- per-frame ---------------- */
  function update(dt) {
    if (state !== "playing") return;

    if (hud.isClueOpen()) {
      input.drainLook();
      if (input.consumeInteract() || input.consumePause()) closeClue();
      return;
    }

    if (input.consumePause()) {
      pause();
      return;
    }

    input.update();
    player.update(dt, input, colliders);
    interactor.update(interactables);

    hud.setPrompt(interactor.current ? interactor.current.userData.prompt : null);

    if (input.consumeInteract()) interactor.consume();

    for (const u of updatables) u(dt);
  }

  return { start, pause, resume, restart, playAgain, update, get state() { return state; } };
}
