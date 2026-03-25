# Smoke Checklist — IPG-001 / IPG-002 / IPG-003 / IPG-004 / IPG-005 / IPG-006 / IPG-009

- [ ] Run `python3 -m http.server 8080` from repo root.
- [ ] Open `http://localhost:8080/`.
- [ ] Page shows `False Exit` and chapter title `Chapter 1 — The Hall That Remembers`.
- [ ] Chapter 1 shows story text, puzzle prompt, answer input, submit button, and `Restart` button.
- [ ] Before solving chapter 1, `Next` is hidden.
- [ ] Enter a wrong chapter 1 answer (example: `出口`) and submit; chapter 1 retry message appears.
- [ ] After wrong chapter 1 answer, player stays on chapter 1 and `Next` remains hidden.
- [ ] Enter chapter 1 correct answer (`回答`) and submit; chapter 1 success message appears and `Next` becomes visible.
- [ ] Click `Next`; screen switches to chapter title `Chapter 2 — The Room That Asks Back` with chapter 2 prompt.
- [ ] On chapter 2, enter a wrong answer (example: `出口`) and submit; chapter 2 retry message appears and player stays on chapter 2.
- [ ] On chapter 2, enter correct answer (`問題`) and submit; chapter 2 success message appears.
- [ ] After chapter 2 is solved (no third chapter), `Next` is hidden/disabled and state does not break.
- [ ] Click `Restart` while on unsolved chapter 2; app returns to chapter 1 initial state with empty input, no feedback, unsolved state, and hidden `Next`.
- [ ] Solve chapter 1 and chapter 2 again, then click `Restart`; app still resets to chapter 1 initial state and clears progress.
- [ ] Browser console shows `[false-exit] playable loop ready` and no errors.

## IPG-008 regression case（focused）

- [ ] Chapter 1: first submit wrong answer `出口`; retry feedback appears, still on chapter 1, `Next` hidden.
- [ ] Chapter 1: same puzzle, change answer to `回答` and submit again; feedback flips to success and `Next` becomes visible.
- [ ] Click `Next` to enter chapter 2.
- [ ] Chapter 2: first submit wrong answer `出口`; retry feedback appears and still on chapter 2.
- [ ] Chapter 2: same puzzle, change answer to `問題` and submit again; feedback flips to success.
- [ ] After final chapter is solved, `Next` is hidden/disabled.

## IPG-009 regression case（focused：restart after chapter 2 solved）

- [ ] Chapter 1: submit correct answer `回答`; chapter 1 success feedback appears and `Next` becomes visible.
- [ ] Click `Next` to enter chapter 2.
- [ ] Chapter 2: submit correct answer `問題`; chapter 2 success feedback appears.
- [ ] After final chapter is solved, `Next` is hidden/disabled.
- [ ] Click `Restart`; app returns to chapter 1 initial state.
- [ ] After reset, chapter title/text/prompt are chapter 1 initial content (`Chapter 1 — The Hall That Remembers`).
- [ ] After reset, answer input is empty.
- [ ] After reset, feedback area is empty.
- [ ] After reset, `Next` is hidden/disabled.
