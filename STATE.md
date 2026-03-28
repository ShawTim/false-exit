# STATE.md — False Exit

## Current Status
- Project initialized
- Root path: `/home/openclaw/.openclaw/workspaces/gpt-bro/false-exit/`
- GitHub repo: `https://github.com/ShawTim/false-exit/`
- Current product state: 10-chapter static playable flow（chapter 1 -> chapter 10 順序推進，Restart 可重置）

## Latest Accepted Change
- IPG-036 — 補 docs link guard，固定檢查 docs 入口列出嘅連結全部存在
  - 新增 `scripts/check-doc-links.mjs`，檢查 `README.md`、`docs/README.md`、`tests/smoke.md` 入面 markdown 相對連結指向嘅 repo-local 檔案是否存在（外部網址略過）
  - 任一缺檔會 non-zero exit，並輸出 `file:line -> link target` 缺檔位置
  - 更新 `scripts/run-acceptance-guards.mjs`，固定順序串接第三個 guard：`check-doc-links.mjs`
  - acceptance 全部通過時訊息更新為 `[acceptance] OK: content lint + docs answer consistency + docs link guard passed`
  - `README.md`、`docs/README.md`、`tests/smoke.md` 已同步反映 docs link guard 納入固定驗收入口
  - 最小改動：script/docs-only；無改 HTML / CSS / JS / `content/story/seed.json`

## Current Focus
- 保持 issue-driven / small-step delivery，用固定驗收入口減少維護者漏跑 guard
- 維持 chapter count=10 hard constraint + docs answer references + docs local link existence 三層 guard
- GitHub issue 現況（本輪真查）：`0 open issues from ShawTim`

## Constraints
- Small steps only
- No large refactors in one run
- Keep product direction stable unless explicitly changed upstream
- Non-goals for this run: no gameplay logic change；no chapter count change；no chapter answer changes；不處理 unrelated `package-lock.json`

## Next Suggested Step
- 可考慮補最小 README/docs wording drift guard 或 smoke checklist structure guard，繼續用 script/docs-only 小步收緊固定驗收流程
