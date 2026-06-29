# False Exit — 3D

第一身 3D 解謎逃脫 game，用純前端 + three.js（CDN ES module）運作，可直接用靜態 hosting 發佈。

你喺一座「每道發光嘅 EXIT 都係谎言」嘅設施入面醒返。五間房，每間一個環境謎題；最終你要搵出嗰道**唔發光**嘅門，先至真正離開循環。

## 目錄

- `index.html`：入口（importmap + three.js + UI overlay）
- `assets/css/style.css`：全屏 canvas、HUD、mobile 搖桿 / 視角 / 互動掣、過場與結局
- `assets/js/`
  - `main.js`：bootstrap，接駁各模組
  - `engine.js`：renderer / scene / camera / 動畫迴圈 + 冷調燈光與霧
  - `input.js`：鍵盤 + 桌面 pointer lock 視角 + 手機觸控（搖桿 / 視角 / 互動）統一輸入
  - `player.js`：第一身控撞器 + AABB 碰撞（含推箱）
  - `interact.js`：中央射線互動 + 高亮 + 提示
  - `entities.js`：門 / 拾取 / 擎 / 鏡 + 激光 / 壓板 + 推箱 / 配電 / 線索 可重用組件
  - `world.js`：5 間房低面數建模 + 房間 builder + 燈光 + 假出口 / 真門 / 線索
  - `game.js`：狀態機（intro / playing / transition / ending）、房間順序、迴圈計、結局
  - `hud.js`：HUD DOM 控制器
- `content/rooms.json`：5 間房靜態資料（lint contract）
- `scripts/`：content lint guard
- `tests/smoke.md`：手動 smoke checklist

## 玩法

| 平台 | 操作 |
| --- | --- |
| 桌面 | `WASD` 行走、滑鼠視角、`E` 互動、`Esc` 暫停 |
| 手機 | 左搖桿行走、右邊畫面拖動視角、`互動` 掣互動 |

## 房間一覽

1. **迎賓室** — 執門禁卡開門（綠色 EXIT 係假出口）
2. **鏡廊** — 旋轉鏡面將激光引到感應器
3. **貨倉** — 推箱上壓板（有重置桿）
4. **配電房** — 按線索顏色次序按亮寶石
5. **假出口** — 三道門，揀嗰道唔發光嘅先至通關

## 本地預覽

```bash
python3 -m http.server 8080
```

打開 `http://localhost:8080/`（需聯網載入 three.js CDN）。

## 固定驗收入口

```bash
node scripts/run-acceptance-guards.mjs
```

跑 `validate-rooms.mjs`：檢查 `content/rooms.json` 固定為 5 間房 + required fields 非空。全部 pass 會輸出 `[acceptance] OK: content lint (rooms.json) passed`。

## Docs

- Docs index：[`docs/README.md`](docs/README.md)

## 設計原則

- **static-first**：純前端，可 GitHub Pages / Netlify 直接發佈。
- **無 framework**：唔用 React / Vue；three.js 經 importmap CDN 載入。
- **content-driven**：房間資料集中喺 `content/rooms.json` + `world.js`。
- **桌面 + 手機並重**：統一輸入層同時支援鍵盤滑鼠同觸控。
