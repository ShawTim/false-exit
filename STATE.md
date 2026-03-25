# STATE.md — False Exit

## Current Status
- Project initialized
- Root path: `/home/openclaw/.openclaw/workspaces/gpt-bro/false-exit/`
- GitHub repo: `https://github.com/ShawTim/false-exit/`
- Static playable flow now supports chapter 1 -> chapter 2 puzzle progression with restart reset

## Latest Accepted Change
- IPG-015 — unsolved state input helper + submit copy polish（helper hint + clearer submit label + focused smoke）

## Current Focus
- Prioritize open GitHub issues created by ShawTim
- GitHub CLI 真查：`gh auth status` 成功（account: `vildanden-ai`，token scope 缺 `read:org` 但不阻塞本 repo issue 查詢）；`gh issue list --repo ShawTim/false-exit --state open --json number,title,author,url` 返回 `[]`，即 `0 open issues from ShawTim`
- 目前按 STATE backlog 做最小可驗收增量（IPG-015：unsolved helper + `提交答案` 文案）

## Constraints
- Small steps only
- No large refactors in one run
- Keep product direction stable unless explicitly changed upstream

## Next Suggested Step
- 保持 tiny increment；沿住現有兩章 flow 做低風險 polish / focused regression（例如 helper 微文案可讀性、狀態切換一致性），繼續唔改 schema/backend
