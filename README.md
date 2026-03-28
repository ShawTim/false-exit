# False Exit

目前狀態：呢個 repo 係 **10 chapter static playable flow**（chapter 1 -> chapter 10 順序推進），用純前端（HTML/CSS/JS + seed JSON）運作。

## 目錄

- `index.html`：入口頁
- `assets/css/styles.css`：樣式（含 mobile responsive）
- `assets/js/main.js`：前端流程控制（chapter 1 -> 10 playable flow）
- `content/story/seed.json`：章節內容與答案資料
- `tests/smoke.md`：手動 smoke checklist
- `docs/README.md`：docs 導覽入口（index）
- `docs/chapter-schema.md`：chapter schema 說明
- `docs/chapter-answer-reference.md`：chapter 1 -> 10 答案對照表（維護用 reference）

## Docs

- Docs index：[`docs/README.md`](docs/README.md)
- Chapter schema：[`docs/chapter-schema.md`](docs/chapter-schema.md)
- Chapter answer reference：[`docs/chapter-answer-reference.md`](docs/chapter-answer-reference.md)
- Smoke answer sequence reference：[`docs/smoke-answer-sequence.md`](docs/smoke-answer-sequence.md)

## 本地預覽

```bash
python3 -m http.server 8080
```

打開 `http://localhost:8080/`。

## 固定驗收入口（content lint + docs consistency）

```bash
node scripts/run-acceptance-guards.mjs
```

固定順序（sequential）會跑：
1. `node scripts/validate-story.mjs`
2. `node scripts/check-doc-answer-consistency.mjs`

驗收規則：
- 任一 guard fail，整體 command 會 non-zero exit
- 兩個都 pass，會輸出 `[acceptance] OK: content lint + docs answer consistency passed`

### Guard 內容（參考）

- `validate-story.mjs`：檢查 `content/story/seed.json` chapter count 固定為 `10`，同每章 required fields 非空
- `check-doc-answer-consistency.mjs`：cross-check `docs/chapter-answer-reference.md` 同 `docs/smoke-answer-sequence.md` chapter 1 -> 10 expected answer 完全一致

## Non-goals（現階段唔做）

- 唔做無限 generator / procedural content system；而家只維持 **10 chapter static playable flow**。
- 唔做 backend / database / account system；產品維持 static-first，可直接用靜態 hosting 發佈。
- 唔加 framework（例如 React / Vue / Next.js）；現階段繼續用純 HTML / CSS / JS 小步推進。
- 唔做大重構 / 方向改寫；每輪只收一個細改動，優先保持現有流程穩定。
