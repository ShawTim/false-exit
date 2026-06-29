# STATE.md — False Exit 3D

## Current Status
- Product state: 第一身 3D 環境解謎逃脫，5 間房完整可玩（desktop + mobile）。
- Stack: 純前端 + three.js (CDN ES module via importmap)，無 build step。
- Perspective: first-person（WASD + mouse / 搖桿 + 視角拖動）。

## Latest Change
- 由文字謎題版重製為 3D 版。
  - 移除舊文字版（`assets/js/main.js`、`assets/css/styles.css`、`content/story/`、舊 docs/guards/smoke）。
  - 新增 3D 引擎模組：`engine / input / player / interact / entities / world / game / hud / main`。
  - 5 間房：迎賓室（拾取）/ 鏡廊（激光鏡）/ 貨倉（推箱壓板）/ 配電房（顏色序列）/ 假出口（唔發光嘅門通關）。
  - mobile 雙拇指控制（左搖桿 + 右視角 + 互動掣）。
  - 新 lint contract：`content/rooms.json`（5 間房）+ `scripts/validate-rooms.mjs`。
  - 更新 README / PROJECT / docs / smoke。

## Constraints
- static-first、無 framework、唔加 backend。
- 每輪只做小步改動。

## Next Suggested Step
- 加音效 / 腳步聲 / 門聲。
- 或：vendored 本地 three.js（離線可用）。
- 或：加第 6+ 間房擴充內容。
