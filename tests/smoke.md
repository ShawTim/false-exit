# Smoke Checklist — False Exit 3D

## 0) Preflight

- [ ] Run `python3 -m http.server 8080` from repo root.
- [ ] Run `node scripts/run-acceptance-guards.mjs`; confirm output `[acceptance] OK: content lint (rooms.json) passed`.
- [ ] Open `http://localhost:8080/` on a desktop browser (Chrome/Firefox/Safari).
- [ ] Intro overlay shows title `False Exit` + control hints + `點擊開始`.
- [ ] Browser console shows no errors; three.js loads from CDN.

## 1) Desktop main flow

### 1.1 Controls & tutorial (Room 1 — 迎賓室)

- [ ] Click `點擊開始` → pointer locks, HUD appears, room name `第 1 間　迎賓室`, objective `執起門禁卡，再開門`.
- [ ] WASD moves; mouse looks; Esc unlocks pointer and shows pause overlay; `繼續` re-locks.
- [ ] Walk to the glowing card on the pedestal; crosshair highlights it, prompt `E 執起門禁卡` shows.
- [ ] Press E → card disappears, toast `你執到一張門禁卡。`, objective updates to `用門禁卡開門`.
- [ ] Face the (locked) door; press E → toast `門鎖住了。你需要一張卡。` (before pickup) / opens (after pickup).
- [ ] Walk into the green EXIT door on the side; press E → fade, `迴圈 1`, toast `綠色嘅『EXIT』將你送返起點。`, respawn at start.

### 1.2 Room 2 — 鏡廊 (laser)

- [ ] Reach room 2; a red beam emits; rotating a mirror (E) changes the beam path.
- [ ] Rotating both mirrors so the beam hits the receptor turns it green and opens the door.
- [ ] Stepping through the open door fades to room 3.

### 1.3 Room 3 — 貨倉 (push boxes)

- [ ] Push each crate onto a pressure plate (plate turns green when occupied).
- [ ] Both plates covered → door opens. Box stuck in corner → pull the central reset lever.

### 1.4 Room 4 — 配電房 (circuit)

- [ ] Read the clue note to learn the gem press order.
- [ ] Press gems in the wrong order → toast `次序錯。` + reset.
- [ ] Press in the correct order → all green, door opens.

### 1.5 Room 5 — 假出口 (finale)

- [ ] Three doors on the far wall; two glow green `EXIT`, one is dim.
- [ ] Use a glowing door → `迴圈 +1`, respawn in finale, clue text updates with count.
- [ ] Use the dim (non-glowing) door → ending screen.

## 2) Ending

- [ ] Ending overlay shows title + narrative text + `假出口嘗試：N　|　通關房間：5`.
- [ ] `再玩一次` returns to room 1 with loop count reset to 0.

## 3) Mobile (touch device, coarse pointer)

- [ ] Intro shows touch hints (左搖桿 / 右邊畫面 / 互動掣); `#touch` controls appear after start.
- [ ] Left joystick moves; dragging right side of screen looks; `互動` button interacts.
- [ ] No page scroll / pinch-zoom; viewport stays fixed.
- [ ] Each room completable via touch only.
