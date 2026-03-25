# STATE.md — False Exit

## Current Status
- Project initialized
- Root path: `/home/openclaw/.openclaw/workspaces/gpt-bro/false-exit/`
- GitHub repo: `https://github.com/ShawTim/false-exit/`
- Static playable flow now supports chapter 1 -> chapter 2 puzzle progression with restart reset

## Latest Accepted Change
- IPG-008 — 加一條聚焦 regression smoke（同題先錯後啱，再過 chapter 2）

## Current Focus
- Prioritize open GitHub issues created by ShawTim
- `gh` auth currently unavailable, so GitHub issue priority cannot be verified from this environment
- If none can be verified, keep shipping one small, testable increment at a time

## Constraints
- Small steps only
- No large refactors in one run
- Keep product direction stable unless explicitly changed upstream

## Next Suggested Step
- IPG-009 — 補一條最小 smoke：驗證 chapter 2 解完後按 `Restart` 仍回到 chapter 1 初始且 `Next` 隱藏
