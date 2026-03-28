# STATE.md — False Exit

## Current Status
- Project initialized
- Root path: `/home/openclaw/.openclaw/workspaces/gpt-bro/false-exit/`
- GitHub repo: `https://github.com/ShawTim/false-exit/`
- Current product state: 10-chapter static playable flow（chapter 1 -> chapter 10 順序推進，Restart 可重置）

## Latest Accepted Change
- IPG-032 — 補 chapter count drift guard（lint error message + README/smoke 對齊）
  - `scripts/validate-story.mjs` chapter count mismatch 訊息收緊為：`expected 10, actual X`，更直接指出 drift
  - `README.md` 明確寫明 chapter count=10 係 hard constraint（固定 contract，唔可改成其他數）
  - `tests/smoke.md` preflight 新增固定 contract 驗收項（chapter count 必須 exactly 10）
  - `STATE.md` / `RUN_LOG.md` 同步今輪狀態
  - 最小改動：script + docs/state/log，小步完成；無改 gameplay / seed / HTML / CSS / JS

## Current Focus
- 保持 issue-driven / small-step delivery，繼續用 script/doc-level guard 防止內容 drift
- 固定 chapter count=10 contract，避免維護時無聲偏移
- GitHub issue 現況（本輪真查）：`0 open issues from ShawTim`

## Constraints
- Small steps only
- No large refactors in one run
- Keep product direction stable unless explicitly changed upstream
- Non-goals for this run: no gameplay logic change；no chapter count change；no chapter answer changes；不處理 unrelated `package-lock.json`

## Next Suggested Step
- 可再補一個更機械化嘅 smoke execution aid（例如將固定答案序列抽成獨立 reference），但仍應保持 docs-only 小步
