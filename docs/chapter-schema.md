# Chapter Schema（IPG-003 / IPG-020）

呢份文件固定 **False Exit** 目前 chapter data 最小結構，對齊現有 `content/story/seed.json` 同現時前端實作（`assets/js/main.js`）。

## 1) 最小 JSON 範例（與現況 seed shape 對齊）

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
      }
    },
    {
      "id": "chapter-02",
      "title": "Chapter 2 — The Room That Asks Back",
      "story": [
        "你行入控制室，四面鏡只反射問題，唔反射你。",
        "桌上紙條寫住：『你學識回答。依家講出你應該先質疑乜。』"
      ],
      "puzzle": {
        "prompt": "輸入紙條要求你質疑嗰樣嘢（兩個字）。",
        "answer": "問題",
        "success": "鏡面同時暗咗落去。房門未開，但警報停咗。",
        "retry": "錯。你仲係答緊人哋設定好嘅路。"
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
- `nextBeat`：`object`，**optional**（存在時為額外敘事段，現況 seed 未使用）

### Puzzle（`chapter.puzzle`）

- `prompt`：`string`，**required**
- `answer`：`string`，**required**（前端比較前會做 trim + lowercase）
- `success`：`string`，**required**
- `retry`：`string`，**required**

### Next Beat（`chapter.nextBeat`）

- `title`：`string`，**required when `nextBeat` exists**
- `story`：`string[]`，**required when `nextBeat` exists**（建議至少 1 行）

## 3) 與現時實作對齊備註

- 前端按 `chapters` 順序播放 chapter flow（chapter 1 -> chapter 2）。
- 解完非最終章會顯示 `Next` 進入下一章。
- 最終章（目前 chapter 2）解完後無 next chapter 行為：`Next` hidden/disabled，並顯示 final-state copy。
- 本文件只固定現時最小 shape，**唔涉及 gameplay 改動、backend、或新增 chapter**。
