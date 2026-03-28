# STATE.md — False Exit

## Current Status
- Project initialized
- Root path: `/home/openclaw/.openclaw/workspaces/gpt-bro/false-exit/`
- GitHub repo: `https://github.com/ShawTim/false-exit/`
- Current product state: 10-chapter static playable flow（chapter 1 -> chapter 10 順序推進，Restart 可重置）

## Latest Accepted Change
- IPG-037 — 補 docs index consistency guard（README/docs wording drift 最小防線）
  - 新增 `scripts/check-doc-index-consistency.mjs`，自動比對 `README.md` `## Docs` 同 `docs/README.md` `## 文件導覽` 指定四項（Docs index / Chapter schema / Chapter answer reference / Smoke answer sequence reference）名稱+link target 一致
  - missing / mismatch 會 non-zero exit，錯誤訊息包含 section/item 或 `file:line` 位置，方便直接定位修正
  - 更新 `scripts/run-acceptance-guards.mjs`，固定順序串接第四個 guard：`check-doc-index-consistency.mjs`
  - acceptance 全部通過訊息更新為 `[acceptance] OK: content lint + docs answer consistency + docs link guard + docs index consistency guard passed`
  - `README.md`、`docs/README.md`、`tests/smoke.md` 已同步反映新 guard；`docs/README.md` `## 文件導覽` 明確補回 `Docs index` 項目
  - 最小改動：script/docs/state/log-only；無改 HTML / CSS / JS / `content/story/seed.json`

## Current Focus
- 保持 issue-driven / small-step delivery，用固定驗收入口減少維護者漏跑 guard
- 維持 chapter count=10 hard constraint + docs answer consistency + docs local link existence + docs index wording/link consistency 四層 guard
- GitHub issue 現況（本輪真查）：`0 open issues from ShawTim`

## Constraints
- Small steps only
- No large refactors in one run
- Keep product direction stable unless explicitly changed upstream
- Non-goals for this run: no gameplay logic change；no chapter count change；no chapter answer changes；不處理 unrelated `package-lock.json`

## Next Suggested Step
- 可考慮補最小 smoke checklist structure drift guard（例如固定 preflight checklist keys），延續 script/docs-only 小步收緊維護一致性
