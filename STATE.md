# STATE.md — False Exit

## Current Status
- Project initialized
- Root path: `/home/openclaw/.openclaw/workspaces/gpt-bro/false-exit/`
- GitHub repo: `https://github.com/ShawTim/false-exit/`
- Current product state: 10-chapter static playable flow（chapter 1 -> chapter 10 順序推進，Restart 可重置）

## Latest Accepted Change
- IPG-026 — 新增最小 script-level content lint：`scripts/validate-story.mjs`，鎖定 `content/story/seed.json` 的 chapter count（必須 10）與每章 required fields 非空；並同步 README/tests/STATE/RUN_LOG（不改 gameplay/answer/chapter 文案）

## Current Focus
- 維持 10-chapter static playable flow 的結構穩定，已補最小可執行驗證（content lint）避免 seed 漏欄位/章數漂移
- GitHub CLI 真查（本輪）：
  - `gh auth status` 成功（account: `vildanden-ai`；提示缺 `read:org` scope）
  - `gh issue list --repo ShawTim/false-exit --state open --json number,title,author,url` 返回 `[]`
  - 摘要：`0 open issues from ShawTim`

## Constraints
- Small steps only
- No large refactors in one run
- Keep product direction stable unless explicitly changed upstream
- Non-goals for this run: no gameplay change / no seed change / no `assets/js/main.js` logic change

## Next Suggested Step
- 由 backlog 揀一項最小 docs/test hygiene 任務（例如 smoke 結構收緊或 docs 導覽一致化）做下一輪可驗收增量
