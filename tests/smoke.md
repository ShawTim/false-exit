# Smoke Checklist — IPG-001 / IPG-002 / IPG-003 / IPG-004 / IPG-005 / IPG-006 / IPG-009 / IPG-010 / IPG-011 / IPG-012 / IPG-013 / IPG-014 / IPG-015

- [ ] Run `python3 -m http.server 8080` from repo root.
- [ ] Open `http://localhost:8080/`.
- [ ] Page shows `False Exit` and chapter title `Chapter 1 — The Hall That Remembers`.
- [ ] Chapter card shows progress indicator `Chapter 1 / 2` (or equivalent chapter count wording).
- [ ] Chapter 1 shows story text, puzzle prompt, answer input, submit button (`提交答案`), and `Restart` button.
- [ ] Before solving chapter 1, `Next` is hidden.
- [ ] Chapter 1 unsolved: helper hint appears near answer controls: `提示：答案係兩個字。`.
- [ ] Enter a wrong chapter 1 answer (example: `出口`) and submit; chapter 1 retry message appears.
- [ ] After wrong chapter 1 answer, player stays on chapter 1, `Next` remains hidden, answer input stays enabled, and wrong answer text is auto-focused + selected for quick overwrite.
- [ ] Enter chapter 1 correct answer (`回答`) and submit; chapter 1 success message appears and `Next` becomes visible.
- [ ] After chapter 1 is solved, answer input and submit button are disabled while success feedback stays visible.
- [ ] After chapter 1 is solved, a subtle solved/locked hint appears near answer controls.
- [ ] Click `Next`; screen switches to chapter title `Chapter 2 — The Room That Asks Back` with chapter 2 prompt.
- [ ] On chapter 2 initial state (unsolved), answer input and submit button (`提交答案`) are enabled again.
- [ ] On chapter 2 initial state (unsolved), solved/locked hint is not shown, and helper hint appears: `提示：答案係兩個字。`.
- [ ] On chapter 2, enter a wrong answer (example: `出口`) and submit; chapter 2 retry message appears, player stays on chapter 2, answer input stays enabled, and wrong answer text is auto-focused + selected for quick overwrite.
- [ ] On chapter 2, enter correct answer (`問題`) and submit; chapter 2 success message appears.
- [ ] After chapter 2 is solved (no third chapter), answer input and submit button are disabled.
- [ ] After chapter 2 is solved (no third chapter), solved/locked hint appears and can coexist with final-state copy.
- [ ] After chapter 2 is solved (no third chapter), `Next` is hidden/disabled and state does not break.
- [ ] After clicking `Next` into chapter 2, chapter progress updates to `Chapter 2 / 2` (or equivalent).
- [ ] Click `Restart` while on unsolved chapter 2; app returns to chapter 1 initial state with empty input, no feedback, unsolved state, hidden `Next`, and progress reset to `Chapter 1 / 2`.
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

## IPG-010 regression case（focused：restart while chapter 2 unsolved）

- [ ] Chapter 1: submit correct answer `回答`; chapter 1 success feedback appears and `Next` becomes visible.
- [ ] Click `Next` to enter chapter 2.
- [ ] Chapter 2: submit a wrong answer (example: `出口`); retry feedback appears and chapter 2 remains unsolved.
- [ ] Without solving chapter 2, click `Restart`; app returns to chapter 1 initial state.
- [ ] After reset, chapter title/text/prompt are chapter 1 initial content (`Chapter 1 — The Hall That Remembers`).
- [ ] After reset, answer input is empty.
- [ ] After reset, feedback area is empty.
- [ ] After reset, `Next` is hidden/disabled.

## IPG-011 focused smoke（final-state copy on final chapter solved）

- [ ] Chapter 1: submit correct answer `回答`; chapter 1 success feedback appears and `Next` becomes visible.
- [ ] Click `Next` to enter chapter 2.
- [ ] Before solving chapter 2, final-state copy is not visible.
- [ ] Chapter 2: submit correct answer `問題`; chapter 2 success feedback appears.
- [ ] After final chapter is solved, final-state copy appears: `你已完成目前全部章節。暫時到此。`.
- [ ] After final chapter is solved, `Next` remains hidden/disabled.
- [ ] Click `Restart`; app returns to chapter 1 initial state and final-state copy disappears.

## IPG-012 focused smoke（chapter progress indicator）

- [ ] Initial load shows chapter progress `Chapter 1 / 2` (or equivalent chapter count wording).
- [ ] Chapter 1: submit correct answer `回答`; chapter 1 success feedback appears and `Next` becomes visible while progress stays on chapter 1.
- [ ] Click `Next`; screen switches to chapter 2 and progress updates to `Chapter 2 / 2`.
- [ ] Click `Restart`; app returns to chapter 1 initial state and progress resets to `Chapter 1 / 2`.

## IPG-013 focused smoke（lock solved answer controls）

- [ ] Chapter 1 unsolved: answer input and submit button are enabled.
- [ ] Chapter 1: submit correct answer `回答`; success feedback appears, answer input and submit button become disabled, and `Next` remains visible.
- [ ] Click `Next` to chapter 2; answer input and submit button are enabled again.
- [ ] Chapter 2: submit correct answer `問題`; success feedback appears, answer input and submit button become disabled.
- [ ] After final chapter solved, final-state copy still appears and `Next` stays hidden/disabled.
- [ ] Click `Restart`; app returns to chapter 1 initial state with answer input and submit button enabled.

## IPG-014 focused smoke（solved disabled state visual hint）

- [ ] Chapter 1 unsolved: answer input and submit button are enabled, and no solved/locked hint is shown.
- [ ] Chapter 1: submit correct answer `回答`; input/submit become disabled and solved/locked hint appears.
- [ ] Click `Next` to chapter 2 unsolved; solved/locked hint disappears and controls are enabled.
- [ ] Chapter 2: submit correct answer `問題`; input/submit disabled + solved/locked hint appears, and final-state copy still appears without conflict.
- [ ] Click `Restart`; app returns to chapter 1 initial state, no solved/locked hint shown, controls enabled.

## IPG-015 focused smoke（unsolved helper + submit copy）

- [ ] Chapter 1 initial unsolved: submit button copy is `提交答案`.
- [ ] Chapter 1 initial unsolved: helper hint appears near answer controls: `提示：答案係兩個字。`.
- [ ] Chapter 1: submit wrong answer `出口`; retry feedback appears and helper hint remains visible.
- [ ] Chapter 1: submit correct answer `回答`; helper hint disappears and solved lock hint appears: `已完成本章，答案欄已鎖定。`.
- [ ] Click `Next` to chapter 2 unsolved; helper hint appears again and submit button copy remains `提交答案`.
- [ ] Chapter 2: submit correct answer `問題`; helper hint disappears, solved lock hint appears, input/submit stay disabled, and final-state copy still appears.
- [ ] Click `Restart`; app returns to chapter 1 unsolved with helper hint visible and no solved lock hint.

## IPG-016 focused smoke（wrong-answer 後 auto focus/select）

- [ ] Chapter 1: input `出口` and submit wrong answer; retry feedback appears while staying on chapter 1.
- [ ] Right after chapter 1 wrong submit, answer input is still enabled, auto-focused, and current wrong text is selected (typing should directly overwrite).
- [ ] Chapter 1: type `回答` directly (without manual clear) and submit; success feedback appears, solved lock still works, and `Next` becomes visible.
- [ ] Click `Next` to chapter 2.
- [ ] Chapter 2: input `出口` and submit wrong answer; retry feedback appears while staying on chapter 2.
- [ ] Right after chapter 2 wrong submit, answer input is still enabled, auto-focused, and current wrong text is selected.
- [ ] Chapter 2: type `問題` directly and submit; success feedback appears.
- [ ] After chapter 2 solved, input/submit remain disabled, `Next` hidden/disabled, final-state copy + solved lock hint still render as before.

