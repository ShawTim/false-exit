# False Exit (Scaffold)

最小可用骨架（static page first，已包含 mobile responsive 支援）。

最新：已針對 chapter 4–10 謎題文案做小幅收緊，令提示同答案關聯更直接（答案與流程不變）。

## 目錄

- `index.html`：入口頁
- `assets/css/styles.css`：樣式
- `assets/js/main.js`：前端入口（現時支援 chapter 1 -> chapter 10 順序 playable flow）
- `content/story/seed.json`：劇情/關卡資料種子（之後由兄落 spec 再擴）
- `tests/smoke.md`：手動 smoke checklist
- `docs/chapter-schema.md`：chapter 資料結構（schema）說明

## Chapter Schema

- 請先讀：[`docs/chapter-schema.md`](docs/chapter-schema.md)

## 本地預覽

直接用任何 static server 開：

```bash
python3 -m http.server 8080
```

然後打開 `http://localhost:8080/false-exit/`。
