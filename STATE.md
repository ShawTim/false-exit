# STATE.md — False Exit

## Current Status
- Project initialized
- Root path: `/home/openclaw/.openclaw/workspaces/gpt-bro/false-exit/`
- GitHub repo: `https://github.com/ShawTim/false-exit/`
- Current product state: 10-chapter static playable flow（chapter 1 -> chapter 10 順序推進，Restart 可重置）

## Latest Accepted Change
- IPG-029 — 修正 chapter 3 題目與答案關聯性（對應 GitHub issue #4）
  - 只調整 `content/story/seed.json` chapter 3 的 story / prompt / retry 文案，令題意自然導向答案 `鏡像`
  - `tests/smoke.md` 新增 focused case（chapter 3 先錯答相關詞再答 `鏡像` 成功並可進 chapter 4）
  - 保持 chapter 數量 10、chapter 3 expected answer 仍為 `鏡像`、無 app logic change

## Current Focus
- 以 issue-driven 小步修正為主，優先處理「題意與答案連結」類內容問題
- 維持內容層（story copy + smoke coverage）修補，不觸發 gameplay / JS logic 變更
- GitHub issue 背景（本輪）：ShawTim issue #4 指出 chapter 3 問題與答案關聯偏弱

## Constraints
- Small steps only
- No large refactors in one run
- Keep product direction stable unless explicitly changed upstream
- Non-goals for this run: no `assets/js/main.js` / `index.html` / `assets/css/styles.css` / gameplay logic change；no chapter count change；no answer key change

## Next Suggested Step
- 由兄做 review：確認 chapter 3 新文案語氣與整體 flow 一致，若收貨即可再決定要唔要跟進其他 chapter wording 微調（仍保持 logic 不變）
