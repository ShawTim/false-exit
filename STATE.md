# STATE.md — False Exit

## Current Status
- Project initialized
- Root path: `/home/openclaw/.openclaw/workspaces/gpt-bro/false-exit/`
- GitHub repo: `https://github.com/ShawTim/false-exit/`
- Static playable flow now supports chapter 1 -> chapter 2 puzzle progression with restart reset

## Latest Accepted Change
- IPG-019 — wrong-answer 時 input 加 accessible invalid state（`aria-invalid` + feedback linkage），並在 correct submit / Next chapter / Restart 後清走

## Current Focus
- Prioritize open GitHub issues created by ShawTim
- GitHub CLI 真查：`gh auth status` 失敗，輸出 `You are not logged into any GitHub hosts. To log in, run: gh auth login`（exit 1）；`gh issue list --repo ShawTim/false-exit --state open --json number,title,author,url` 失敗，輸出 `To get started with GitHub CLI, please run:  gh auth login`（exit 4）
- 目前按 STATE backlog 做最小可驗收增量（IPG-019：補 wrong-answer accessibility invalid state wiring，同步 focused smoke 驗收）

## Constraints
- Small steps only
- No large refactors in one run
- Keep product direction stable unless explicitly changed upstream

## Next Suggested Step
- 保持 tiny increment；沿住現有兩章 flow 做低風險 a11y / UX consistency polish 或 focused regression，繼續唔改 schema/backend
