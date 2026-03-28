# Docs Index

呢份係 `docs/` 入口，集中列出目前維護文檔，避免入口分散。

## 文件導覽

- Docs index：[`README.md`](README.md)
  - 用途：docs 導覽入口（本頁），README `## Docs` 應對齊此入口名稱與連結。
- Chapter schema：[`chapter-schema.md`](chapter-schema.md)
  - 用途：定義 `content/story/seed.json` chapter data 最小結構、required/optional 欄位，同前端 flow 對齊備註。
- Chapter answer reference：[`chapter-answer-reference.md`](chapter-answer-reference.md)
  - 用途：快速核對 chapter 1 -> 10 每章 expected answer（維護 reference）。
- Smoke answer sequence reference：[`smoke-answer-sequence.md`](smoke-answer-sequence.md)
  - 用途：固定 smoke（main flow）嘅 chapter 1 -> 10 答案序列對照（manual smoke / regression reference）。
- 固定驗收入口：[`../scripts/run-acceptance-guards.mjs`](../scripts/run-acceptance-guards.mjs)
  - 用途：以固定順序 sequentially 跑 content lint + docs answer consistency + docs link guard + docs index consistency guard（任一 fail 即 non-zero exit，全部 pass 會輸出 acceptance OK）。
- Docs answer consistency guard：[`../scripts/check-doc-answer-consistency.mjs`](../scripts/check-doc-answer-consistency.mjs)
  - 用途：自動比對 `chapter-answer-reference.md` 同 `smoke-answer-sequence.md` chapter 1 -> 10 expected answer 是否完全一致（mismatch 會 fail）。
- Docs link guard：[`../scripts/check-doc-links.mjs`](../scripts/check-doc-links.mjs)
  - 用途：檢查 `README.md`、`docs/README.md`、`tests/smoke.md` 入面 markdown 相對連結指向嘅 repo-local 檔案是否存在（外部網址略過）。
- Docs index consistency guard：[`../scripts/check-doc-index-consistency.mjs`](../scripts/check-doc-index-consistency.mjs)
  - 用途：自動比對 `README.md` `## Docs` 同 `docs/README.md` `## 文件導覽` 指定四項（Docs index / Chapter schema / Chapter answer reference / Smoke answer sequence reference）名稱+link target 是否一致（missing/mismatch 會 fail）。

## 對齊原則

- README `## Docs` 段落應與本文件同名、同連結。
- 本文件只做 docs 導覽，唔改 gameplay / seed / app logic。
