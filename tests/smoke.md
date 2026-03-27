# Smoke Checklist — IPG-029

## 0) Preflight

- [ ] Run `python3 -m http.server 8080` from repo root.
- [ ] In another shell, run `node scripts/validate-story.mjs` and confirm output contains `[content-lint] OK: 10 chapters validated`.
- [ ] Open `http://localhost:8080/`.
- [ ] Docs entry consistency check：`README.md` `## Docs` 同 `docs/README.md` 一致列出 `Docs index / Chapter schema / Chapter answer reference`，且三條連結可解析。

## 1) Main flow smoke（Chapter 1 -> 10）

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
- [ ] Browser console shows `[false-exit] playable loop ready` and no errors.

## 2) Focused regression cases

### FC-01 — Chapter 3 clue-answer link（先錯後啱再進 chapter 4）

- [ ] 先解 chapter 1 `回答`、chapter 2 `問題`，進入 chapter 3。
- [ ] Chapter 3：先答一個相關但錯嘅詞（例如 `回音`）應顯示 retry，章節保持 unsolved。
- [ ] Chapter 3：改答 `鏡像` 後應顯示 success、輸入鎖定、`Next` 出現。
- [ ] 撳 `Next` 後可正常進入 chapter 4，progress 變為 `Chapter 4 / 10`。

### FC-02 — Chapter 4 -> 10 題意清晰度（流程不變）

- [ ] 先解 chapter 1 `回答`、chapter 2 `問題`、chapter 3 `鏡像`，確保可正常進入 chapter 4。
- [ ] Chapter 4：先答錯（例如 `回音`）應顯示 retry；改答 `噪音` 後 success + `Next` 出現。
- [ ] Chapter 5：先答錯（例如 `缺口`）應顯示 retry；改答 `盲點` 後 success + `Next` 出現。
- [ ] Chapter 6：先答錯（例如 `後果`）應顯示 retry；改答 `代價` 後 success + `Next` 出現。
- [ ] Chapter 7：先答錯（例如 `觀眾`）應顯示 retry；改答 `見證` 後 success + `Next` 出現。
- [ ] Chapter 8：先答錯（例如 `出口`）應顯示 retry；改答 `假門` 後 success + `Next` 出現。
- [ ] Chapter 9：先答錯（例如 `離開`）應顯示 retry；改答 `自由` 後 success + `Next` 出現。
- [ ] Chapter 10：先答錯（例如 `離開`）應顯示 retry；改答 `留下` 後進入 final-state，`Next` 保持 hidden/disabled。
- [ ] 確認 chapter 4 -> 10 答案仍分別為：`噪音 / 盲點 / 代價 / 見證 / 假門 / 自由 / 留下`。

### FC-03 — Final chapter 完成態 + Restart 重置

- [ ] Sequentially solve chapter 1 -> chapter 9 with correct answers (`回答 / 問題 / 鏡像 / 噪音 / 盲點 / 代價 / 見證 / 假門 / 自由`) and press `Next` each time.
- [ ] Confirm chapter progress reaches `Chapter 10 / 10`.
- [ ] Chapter 10: submit correct answer `留下`; success feedback appears and final-state copy is visible.
- [ ] After chapter 10 solved, `Next` stays hidden/disabled.
- [ ] Click `Restart`; app resets to chapter 1 initial state (`Chapter 1 / 10`) with empty input, no feedback, hidden `Next`, and final-state copy hidden again.

## 3) Mobile viewport smoke（320px–430px）

- [ ] Page has no horizontal scrollbar; chapter card/title/story/question wrap normally.
- [ ] Answer input + `提交答案` are full-width and tappable (>=44px target height), no overlap/clip.
- [ ] Controls stack vertically (`Next`, `Restart`) and remain easy to tap without squeeze.
