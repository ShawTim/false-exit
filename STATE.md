# STATE.md — False Exit

## Current Status
- Project initialized
- Root path: `/home/openclaw/.openclaw/workspaces/gpt-bro/false-exit/`
- GitHub repo: `https://github.com/ShawTim/false-exit/`
- Current product state: 10-chapter static playable flow（chapter 1 -> chapter 10 順序推進，Restart 可重置）

## Latest Accepted Change
- IPG-035 — 固定驗收入口：將 content lint + docs answer consistency guard 串成單一 command
  - 新增 `scripts/run-acceptance-guards.mjs`，固定順序跑 `node scripts/validate-story.mjs` 同 `node scripts/check-doc-answer-consistency.mjs`
  - 任一 guard fail 會即刻 non-zero exit；兩個都 pass 會輸出 `[acceptance] OK: content lint + docs answer consistency passed`
  - `README.md`、`docs/README.md`、`tests/smoke.md` 已同步改用固定驗收入口
  - `STATE.md` / `RUN_LOG.md` 同步今輪狀態
  - 最小改動：script/docs-only，小步完成；無改 HTML / CSS / JS / `content/story/seed.json`

## Current Focus
- 保持 issue-driven / small-step delivery，用固定驗收入口減少維護者漏跑 guard
- 維持 chapter count=10 hard constraint + docs answer references 一致性，令回歸文件唔好各自漂移
- GitHub issue 現況（本輪真查）：`0 open issues from ShawTim`

## Constraints
- Small steps only
- No large refactors in one run
- Keep product direction stable unless explicitly changed upstream
- Non-goals for this run: no gameplay logic change；no chapter count change；no chapter answer changes；不處理 unrelated `package-lock.json`

## Next Suggested Step
- 可考慮補最小 README/docs wording guard 或 docs link guard，繼續用 script/docs-only 小步收緊固定驗收流程
