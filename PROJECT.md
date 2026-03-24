# PROJECT — Infinite Puzzle Game

## One-liner
一隻可用 static page 發佈、帶輕劇情連貫、可長期增量更新內容的 web 解謎 game。

## 当前階段
Phase 0 — prove the loop。
先做出最小 playable loop：
1. 顯示一段世界/劇情 text
2. 出一條 puzzle prompt
3. 玩家輸入答案
4. 即時判定對錯
5. 成功後推進到下一小節

## 設計原則
- content-driven：劇情與關卡資料應可由 JSON 擴充
- deterministic first：先做固定 seed，之後先談無限生成
- static-first：全部資產可放 GitHub Pages / Netlify static
- tiny increments：每輪只收一個細改動

## 近期里程碑
- M1: 首個 playable chapter（固定內容）
- M2: chapter JSON schema 穩定
- M3: 可追加多 chapter / pseudo-infinite content
