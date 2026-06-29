# PROJECT — False Exit 3D

## One-liner
一隻可用 static page 發佈、第一身 3D 環境解謎逃脫 game，用 three.js（CDN ES module）運作。

## 当前階段
Phase 1 — 由文字謎題重製為 3D 環境解謎。
已完成最小完整可玩 loop：5 間房，每間一個環境謎題，desktop + mobile 皆可通關，有結局。

## 設計原則
- static-first：純前端，可 GitHub Pages / Netlify 直接發佈。
- 無 framework：唔用 React / Vue；three.js 經 importmap CDN 載入。
- content-driven：房間資料集中喺 `content/rooms.json` + `world.js`。
- 桌面 + 手機並重：統一輸入層同時支援鍵盤滑鼠同觸控。
- tiny increments：每輪只收一個細改動。

## 近期里程碑
- M1: 第一身控撞 + 碰撞 + 互動 + UI loop 走通 ✅
- M2: 5 間房環境謎題（拾取 / 激光鏡 / 推箱 / 配電 / 假出口）✅
- M3: mobile 觸控 ✅
- M4: 結局 + 重玩 ✅
- Next: 音效、更多房間、可選本地 vendored three.js
