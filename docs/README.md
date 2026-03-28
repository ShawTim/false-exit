# Docs Index

呢份係 `docs/` 入口，集中列出目前維護文檔，避免入口分散。

## 文件導覽

- Chapter schema：[`chapter-schema.md`](chapter-schema.md)
  - 用途：定義 `content/story/seed.json` chapter data 最小結構、required/optional 欄位，同前端 flow 對齊備註。
- Chapter answer reference：[`chapter-answer-reference.md`](chapter-answer-reference.md)
  - 用途：快速核對 chapter 1 -> 10 每章 expected answer（維護 reference）。
- Smoke answer sequence reference：[`smoke-answer-sequence.md`](smoke-answer-sequence.md)
  - 用途：固定 smoke（main flow）嘅 chapter 1 -> 10 答案序列對照（manual smoke / regression reference）。
- 固定驗收入口：[`../scripts/run-acceptance-guards.mjs`](../scripts/run-acceptance-guards.mjs)
  - 用途：以固定順序 sequentially 跑 content lint + docs answer consistency guard（任一 fail 即 non-zero exit，兩者都 pass 會輸出 acceptance OK）。
- Docs answer consistency guard：[`../scripts/check-doc-answer-consistency.mjs`](../scripts/check-doc-answer-consistency.mjs)
  - 用途：自動比對 `chapter-answer-reference.md` 同 `smoke-answer-sequence.md` chapter 1 -> 10 expected answer 是否完全一致（mismatch 會 fail）。

## 對齊原則

- README `## Docs` 段落應與本文件同名、同連結。
- 本文件只做 docs 導覽，唔改 gameplay / seed / app logic。
