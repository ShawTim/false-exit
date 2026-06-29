import { createEngine } from "./engine.js";
import { createInput } from "./input.js";
import { createPlayer } from "./player.js";
import { createInteractor } from "./interact.js";
import { createGame } from "./game.js";
import { createHUD } from "./hud.js";

const mobile = window.matchMedia("(pointer: coarse)").matches;

function init() {
  const container = document.getElementById("game");

  const engine = createEngine({ container });
  const hud = createHUD({ mobile });

  const input = createInput({
    domElement: engine.renderer.domElement,
    joystickEl: document.getElementById("joystick"),
    stickEl: document.getElementById("stick"),
    interactEl: document.getElementById("btn-interact"),
    mobile,
  });

  const player = createPlayer({ camera: engine.camera });
  const interactor = createInteractor({ camera: engine.camera });

  const game = createGame({ engine, player, interactor, input, hud, mobile });

  // buttons
  document.getElementById("btn-start").addEventListener("click", () => game.start());
  document.getElementById("btn-resume").addEventListener("click", () => game.resume());
  document.getElementById("btn-restart-game").addEventListener("click", () => game.restart());
  document.getElementById("btn-replay").addEventListener("click", () => game.playAgain());

  // desktop: click canvas to re-lock pointer while playing
  engine.renderer.domElement.addEventListener("click", () => {
    if (!mobile && game.state === "playing" && !input.isLocked()) input.requestLock();
  });

  // desktop: pointer unlock while playing => pause (but not when a clue is open)
  input.onLock((locked) => {
    if (!locked && !mobile && game.state === "playing" && !hud.isClueOpen()) game.pause();
  });

  engine.start((dt) => game.update(dt));
}

init();
