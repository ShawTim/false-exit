# Smoke Checklist — IPG-022

- [ ] Run `python3 -m http.server 8080` from repo root.
- [ ] Open `http://localhost:8080/`.
- [ ] Page shows `False Exit` and chapter title `Chapter 1 — The Hall That Remembers`.
- [ ] Chapter card shows progress indicator `Chapter 1 / 10` (or equivalent chapter count wording).
- [ ] Chapter 1 unsolved: `Next` is hidden, helper hint shows `提示：答案係兩個字。`, answer input + submit (`提交答案`) are enabled.
- [ ] Chapter 1 wrong answer (`出口`) shows retry feedback + error visual state + `aria-invalid="true"`, and input stays enabled with auto focus/select.
- [ ] Chapter 1 correct answer (`回答`) shows success, clears error/invalid state, disables input+submit, and reveals `Next`.
- [ ] Click `Next`; app enters chapter 2 with updated title/progress and fresh unsolved state (no residual error/invalid state).
- [ ] On chapter 2, wrong answer keeps chapter unsolved; correct answer (`問題`) can flip to success in same chapter.
- [ ] Repeat solve + `Next` through remaining chapters until `Chapter 10 / 10`.
- [ ] On chapter 10 correct answer (`留下`), final-state copy appears: `你已完成目前全部章節。暫時到此。`.
- [ ] After chapter 10 solved, `Next` remains hidden/disabled; answer input + submit remain disabled; solved lock hint remains visible.
- [ ] Click `Restart`; app returns to chapter 1 initial state with empty input, no feedback, hidden `Next`, progress reset to `Chapter 1 / 10`, and final-state copy disappears.
- [ ] Browser console shows `[false-exit] playable loop ready` and no errors.
- [ ] Mobile viewport smoke (320px–430px, e.g. DevTools iPhone SE / Pixel): page has no horizontal scrollbar; chapter card/title/story/question wrap normally.
- [ ] Mobile viewport smoke (320px–430px): answer input + `提交答案` are full-width and tappable (>=44px target height), no overlap/clip.
- [ ] Mobile viewport smoke (320px–430px): controls stack vertically (`Next`, `Restart`) and remain easy to tap without squeeze.

## IPG-021 focused smoke（1 -> 10 順序推進 + final chapter 完成態）

- [ ] Chapter 1: submit correct answer `回答`; chapter 1 success appears and `Next` becomes visible.
- [ ] Sequentially solve chapter 2 -> chapter 9 with correct answers and press `Next` each time:
  - chapter 2 `問題`
  - chapter 3 `鏡像`
  - chapter 4 `噪音`
  - chapter 5 `盲點`
  - chapter 6 `代價`
  - chapter 7 `見證`
  - chapter 8 `假門`
  - chapter 9 `自由`
- [ ] Confirm chapter progress reaches `Chapter 10 / 10`.
- [ ] Chapter 10: submit correct answer `留下`; success feedback appears.
- [ ] After chapter 10 solved, final-state copy appears and `Next` stays hidden/disabled.
- [ ] Click `Restart`; app resets to chapter 1 initial state (`Chapter 1 / 10`) and final-state copy is hidden again.
