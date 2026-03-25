# Chapter Schema（IPG-003）

呢份文件固定 **False Exit** 目前 chapter data 最小結構，對齊現有 `content/story/seed.json` 同現時前端實作（`assets/js/main.js`）。

## 1) 最小 JSON 範例（與 `content/story/seed.json` 一致）

```json
{
  "version": 1,
  "world": "false-exit",
  "chapters": [
    {
      "id": "chapter-01",
      "title": "Chapter 1 — The Hall That Remembers",
      "story": [
        "你喺一條每次轉身都會重置嘅走廊醒返。",
        "牆上得一句提示：『真正出口唔識逃，佢只會回答。』"
      ],
      "puzzle": {
        "prompt": "輸入牆上唯一可見、亦最明顯唔係出口嘅兩個字。",
        "answer": "回答",
        "success": "牆面裂開一道窄門。你冇離開大樓，但你至少離開咗呢個謊言。",
        "retry": "唔啱。呢度唔獎勵亂猜。再望清楚條提示。"
      },
      "nextBeat": {
        "title": "Next Beat — The Narrow Door",
        "story": [
          "門後唔係自由，而係一間冇窗嘅控制室。",
          "桌上有張新紙條：『你學識咗回答。下一步，學識質疑問題本身。』"
        ]
      }
    }
  ]
}
```

## 2) 欄位說明（Required / Optional）

### Root

- `version`：`number`，**required**
- `world`：`string`，**required**
- `chapters`：`array`，**required**（每項為 chapter object）

### Chapter（`chapters[]` 每一項）

- `id`：`string`，**required**（chapter 唯一識別）
- `title`：`string`，**required**
- `story`：`string[]`，**required**（至少 1 行）
- `puzzle`：`object`，**required**
- `nextBeat`：`object`，**optional**（未有下一拍可省略）

### Puzzle（`chapter.puzzle`）

- `prompt`：`string`，**required**
- `answer`：`string`，**required**（前端比較前會做 trim + lowercase）
- `success`：`string`，**required**
- `retry`：`string`，**required**

### Next Beat（`chapter.nextBeat`）

- `title`：`string`，**required when `nextBeat` exists**
- `story`：`string[]`，**required when `nextBeat` exists**（建議至少 1 行）

## 3) 與現時實作對齊備註

- 前端目前只讀第一章：`data.chapters[0]`。
- 若 `nextBeat` 不存在：答啱後唔會顯示 next beat 區塊。
- 本文件只固定現時最小 shape，**唔涉及 gameplay 改動、backend、或多章流程設計**。
