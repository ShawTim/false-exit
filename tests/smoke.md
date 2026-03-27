# Smoke Checklist — IPG-029

## 0) Preflight

- [ ] Run `python3 -m http.server 8080` from repo root.
- [ ] In another shell, run `node scripts/validate-story.mjs` and confirm output contains `[content-lint] OK: 10 chapters validated`.
- [ ] Open `http://localhost:8080/`.
- [ ] Docs entry consistency check：`README.md` `## Docs` 同 `docs/README.md` 一致列出 `Docs index / Chapter schema / Chapter answer reference`，且三條連結可解析。

## 1) Main flow smoke（Chapter 1 -> 10）

### Core expectations（每章都應成立）

- [ ] Page shows `False Exit` and chapter title `Chapter 1 — The Hall That Remembers`.
- [ ] Chapter card shows progress indicator `Chapter 1 / 10` (or equivalent chapter count wording).
- [ ] Unsolved chapter state：`Next` hidden、helper hint visible、answer input + `提交答案` enabled.
- [ ] Wrong answer state：顯示 retry feedback + error visual state + `aria-invalid="true"`，input 保持 enabled，並自動 focus/select。
- [ ] Correct answer state：顯示 success、清除 error/invalid state、disable input + submit，並 reveal `Next`。
- [ ] Click `Next` 後進入下一章，title/progress 更新，且新章節無殘留上一章 error/invalid state。

### Ordered chapter path

- [ ] Chapter 1：wrong answer `出口` -> retry；correct answer `回答` -> success。
- [ ] Chapter 2：wrong answer keeps chapter unsolved；correct answer `問題` -> success。
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
- [ ] Chapter 10：先答錯（例如 `離開`）應顯示 retry；改答 `留下` 後進入 final-state，`Next` 保持 hidden/disabled，且 chapter 10 玩家可見文案（story/success/retry）統一使用 `留下`（不應出現 `留低`）。
- [ ] 確認 chapter 4 -> 10 答案仍分別為：`噪音 / 盲點 / 代價 / 見證 / 假門 / 自由 / 留下`。

### FC-03 — Fixed regression path：chapter 10 final-state + Restart reset

- [ ] 由 chapter 1 開始，按正確答案順序解到 chapter 10（`回答 / 問題 / 鏡像 / 噪音 / 盲點 / 代價 / 見證 / 假門 / 自由`，每章成功後按 `Next`）。
- [ ] 確認進度到 `Chapter 10 / 10`。
- [ ] Chapter 10 提交正解 `留下` 後，應見到 success feedback + final-state 文案 `你已完成目前全部章節。暫時到此。`。
- [ ] Chapter 10 solved 後，`Next` 必須保持 hidden/disabled（不可再前進）。
- [ ] 按 `Restart` 後，必須回到 chapter 1 初始狀態（`Chapter 1 / 10`、input 清空、無 feedback、`Next` hidden、final-state 文案消失）。

## 3) Mobile viewport smoke（320px–430px）

- [ ] Page has no horizontal scrollbar; chapter card/title/story/question wrap normally.
- [ ] Answer input + `提交答案` are full-width and tappable (>=44px target height), no overlap/clip.
- [ ] Controls stack vertically (`Next`, `Restart`) and remain easy to tap without squeeze.
