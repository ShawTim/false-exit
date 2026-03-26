# STATE.md — False Exit

## Current Status
- Project initialized
- Root path: `/home/openclaw/.openclaw/workspaces/gpt-bro/false-exit/`
- GitHub repo: `https://github.com/ShawTim/false-exit/`
- Current product state: 10-chapter static playable flow（chapter 1 -> chapter 10 順序推進，Restart 可重置）

## Latest Accepted Change
- IPG-028 — 收緊 `tests/smoke.md` 結構：明確分段為 Main flow smoke / Focused regression cases / Mobile viewport smoke，focused case 統一命名為 `FC-xx`，保留 10 chapter flow + chapter 4-10 clarity + final chapter restart 驗收（docs/test hygiene only；無改 app logic）

## Current Focus
- 維持 10-chapter static playable flow 穩定，優先做 docs/test hygiene，令手動驗收順序更清晰、重覆更少
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
- 由 backlog 揀一項最小 docs/test hygiene（例如 focused smoke wording 一致化或 docs 導覽微調）做下一輪可驗收增量
