# Smoke Checklist — IPG-028

## 0) Preflight

- [ ] Run `python3 -m http.server 8080` from repo root.
- [ ] In another shell, run fixed acceptance entrypoint: `node scripts/run-acceptance-guards.mjs`.
- [ ] Confirm acceptance output includes `[acceptance] OK: content lint + docs answer consistency + docs link guard + docs index consistency guard passed`.
- [ ] Confirm lint contract remains fixed: chapter count must be exactly `10`（hard constraint, expected 10 / actual X on mismatch）.
- [ ] Open `http://localhost:8080/`.
- [ ] Docs entry consistency check：`README.md` `## Docs` 同 `docs/README.md` 一致列出 `Docs index / Chapter schema / Chapter answer reference / Smoke answer sequence reference`，且連結可解析。

## 1) Main flow smoke（single-pass baseline）

### 1.1 Baseline expectations

- [ ] Page shows `False Exit` and chapter title `Chapter 1 — The Hall That Remembers`.
- [ ] Chapter card shows progress indicator `Chapter 1 / 10` (or equivalent chapter count wording).
- [ ] Chapter 1 unsolved: `Next` is hidden, helper hint shows `提示：答案係兩個字。`, answer input + submit (`提交答案`) are enabled.
- [ ] Chapter 1 wrong answer (`出口`) shows retry feedback + error visual state + `aria-invalid="true"`, and input stays enabled with auto focus/select.
- [ ] Chapter 1 correct answer (`回答`) shows success, clears error/invalid state, disables input+submit, and reveals `Next`.

### 1.2 Main progression（chapter 1 -> 10）

Use this answer sequence reference for the single pass:
[`docs/smoke-answer-sequence.md`](../docs/smoke-answer-sequence.md)

- [ ] After each solved chapter, click `Next`; app enters next chapter with updated title/progress and fresh unsolved state（no residual error/invalid state）.
- [ ] Reach `Chapter 10 / 10` and submit chapter 10 answer `留下`.
- [ ] Final-state copy appears: `你已完成目前全部章節。暫時到此。`.
- [ ] After chapter 10 solved, `Next` remains hidden/disabled; answer input + submit remain disabled; solved lock hint remains visible.
- [ ] Browser console shows `[false-exit] playable loop ready` and no errors.

## 2) Focused regression cases

### FC-01 — Chapter 3 clue-answer link（先錯後啱再進 chapter 4）

- [ ] 先解 chapter 1 `回答`、chapter 2 `問題`，進入 chapter 3。
- [ ] Chapter 3：先答相關但錯嘅詞（例如 `回音`）應顯示 retry，章節保持 unsolved。
- [ ] Chapter 3：改答 `鏡像` 後應顯示 success、輸入鎖定、`Next` 出現。
- [ ] 撳 `Next` 後可正常進入 chapter 4，progress 變為 `Chapter 4 / 10`。

### FC-02 — Chapter 4 -> 10 focused correctness（題意 + 答案 + wording）

- [ ] 先解 chapter 1 `回答`、chapter 2 `問題`、chapter 3 `鏡像`，確保可正常進入 chapter 4。
- [ ] 依序驗 chapter 4 -> 10：每章先錯答一次應顯示 retry，再答正解應 success + `Next`（chapter 10 除外）。
  - chapter 4: `噪音`
  - chapter 5: `盲點`
  - chapter 6: `代價`
  - chapter 7: `見證`
  - chapter 8: `假門`
  - chapter 9: `自由`
  - chapter 10: `留下`
- [ ] Chapter 10 完成後仍為 final-state（`Next` hidden/disabled），且 chapter 10 玩家可見文案（story/success/retry）統一使用 `留下`（不應出現 `留低`）。

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
