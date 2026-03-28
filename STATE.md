# STATE.md — False Exit

## Current Status
- Project initialized
- Root path: `/home/openclaw/.openclaw/workspaces/gpt-bro/false-exit/`
- GitHub repo: `https://github.com/ShawTim/false-exit/`
- Current product state: 10-chapter static playable flow（chapter 1 -> chapter 10 順序推進，Restart 可重置）

## Latest Accepted Change
- IPG-038 — 補 smoke preflight structure guard（固定 smoke preflight checklist contract）
  - 新增 `scripts/check-smoke-preflight-structure.mjs`，自動檢查 `tests/smoke.md` `## 0) Preflight` 固定六項 checklist 文字完全存在
  - missing item 會 non-zero exit，錯誤訊息直接列出缺咗邊條 checklist，方便維護時即刻定位修正
  - 更新 `scripts/run-acceptance-guards.mjs`，固定順序串接第五個 guard：`check-smoke-preflight-structure.mjs`
  - acceptance 全部通過訊息更新為 `[acceptance] OK: content lint + docs answer consistency + docs link guard + docs index consistency guard + smoke preflight structure guard passed`
  - `README.md`、`docs/README.md`、`tests/smoke.md` 已同步反映新 guard 同新 acceptance 訊息
  - 最小改動：script/docs/state/log-only；無改 HTML / CSS / JS / `content/story/seed.json`

## Current Focus
- 保持 issue-driven / small-step delivery，用固定驗收入口減少維護者漏跑 guard
- 維持 chapter count=10 hard constraint + docs answer consistency + docs local link existence + docs index wording/link consistency + smoke preflight structure 五層 guard
- GitHub issue 現況（本輪真查）：`0 open issues from ShawTim`

## Constraints
- Small steps only
- No large refactors in one run
- Keep product direction stable unless explicitly changed upstream
- Non-goals for this run: no gameplay logic change；no chapter count change；no chapter answer changes；不處理 unrelated `package-lock.json`

## Next Suggested Step
- 可考慮補 focused regression case 結構 guard（例如固定 FC-01 / FC-02 / FC-03 heading），延續 script/docs-only 小步收緊維護一致性
