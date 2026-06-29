export function createHUD({ mobile } = {}) {
  const $ = (id) => document.getElementById(id);
  const el = {
    hud: $("hud"),
    crosshair: $("crosshair"),
    roomName: $("room-name"),
    loop: $("loop-count"),
    objective: $("objective"),
    prompt: $("interact-prompt"),
    toast: $("toast"),
    touch: $("touch"),
    intro: $("intro"),
    pause: $("pause"),
    fade: $("fade"),
    ending: $("ending"),
    endingTitle: $("ending-title"),
    endingText: $("ending-text"),
    endingStats: $("ending-stats"),
    keysDesktop: $("keys-desktop"),
    keysMobile: $("keys-mobile"),
  };

  // clue overlay (built dynamically)
  const clueOverlay = document.createElement("div");
  clueOverlay.className = "overlay hidden";
  clueOverlay.innerHTML =
    '<div class="overlay-card"><h2 id="clue-title"></h2><p id="clue-text"></p><button type="button" id="clue-close">關閉（E / Esc）</button></div>';
  document.body.appendChild(clueOverlay);
  const clueTitle = clueOverlay.querySelector("#clue-title");
  const clueText = clueOverlay.querySelector("#clue-text");
  let clueCloser = null;
  function setClueCloser(fn) { clueCloser = fn; }
  clueOverlay.querySelector("#clue-close").addEventListener("click", () => clueCloser ? clueCloser() : hideClue());
  // tap backdrop to close
  clueOverlay.addEventListener("click", (e) => { if (e.target === clueOverlay) clueCloser ? clueCloser() : hideClue(); });

  if (mobile) {
    el.keysDesktop.classList.add("hidden");
    el.keysMobile.classList.remove("hidden");
  }

  let toastTimer = 0;

  function showHUD() { el.hud.classList.remove("hidden"); }
  function hideHUD() { el.hud.classList.add("hidden"); }
  function showTouch() { el.touch.classList.remove("hidden"); }
  function hideTouch() { el.touch.classList.add("hidden"); }

  function setRoomName(t) { el.roomName.textContent = t; }
  function setLoop(n) { el.loop.textContent = `迴圈 ${n}`; el.loop.style.opacity = n > 0 ? "1" : "0.35"; }
  function setObjective(t) {
    if (!t) { el.objective.classList.add("hidden"); return; }
    el.objective.textContent = t;
    el.objective.classList.remove("hidden");
  }
  function setPrompt(t) {
    if (!t) { el.prompt.classList.add("hidden"); return; }
    el.prompt.innerHTML = `<b>${mobile ? "互動" : "E"}</b> ${t}`;
    el.prompt.classList.remove("hidden");
  }

  function toast(text, kind = "") {
    el.toast.textContent = text;
    el.toast.className = "";
    if (kind) el.toast.classList.add(kind);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.add("hidden"), 2600);
  }

  function showClue(title, text) {
    clueTitle.textContent = title || "線索";
    clueText.textContent = text || "";
    clueOverlay.classList.remove("hidden");
  }
  function hideClue() { clueOverlay.classList.add("hidden"); }

  function fadeOut(cb) {
    el.fade.classList.remove("hidden");
    requestAnimationFrame(() => el.fade.classList.add("show"));
    setTimeout(() => cb && cb(), 460);
  }
  function fadeIn(cb) {
    el.fade.classList.remove("show");
    setTimeout(() => {
      el.fade.classList.add("hidden");
      cb && cb();
    }, 460);
  }

  function showIntro() { el.intro.classList.remove("hidden"); }
  function hideIntro() { el.intro.classList.add("hidden"); }
  function showPause() { el.pause.classList.remove("hidden"); }
  function hidePause() { el.pause.classList.add("hidden"); }

  function showEnding({ title, text, stats }) {
    el.endingTitle.textContent = title;
    el.endingText.textContent = text;
    el.endingStats.textContent = stats || "";
    el.ending.classList.remove("hidden");
  }
  function hideEnding() { el.ending.classList.add("hidden"); }

  return {
    showHUD, hideHUD, showTouch, hideTouch,
    setClueCloser,
    setRoomName, setLoop, setObjective, setPrompt,
    toast, showClue, hideClue,
    fadeOut, fadeIn,
    showIntro, hideIntro, showPause, hidePause,
    showEnding, hideEnding,
    isClueOpen: () => !clueOverlay.classList.contains("hidden"),
  };
}
