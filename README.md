# False Exit (Scaffold)

最小可用骨架（static page first）。

## 目錄

- `index.html`：入口頁
- `assets/css/styles.css`：樣式
- `assets/js/main.js`：前端入口（暫時只做 boot log）
- `content/story/seed.json`：劇情/關卡資料種子（之後由兄落 spec 再擴）
- `tests/smoke.md`：手動 smoke checklist

## 本地預覽

直接用任何 static server 開：

```bash
python3 -m http.server 8080
```

然後打開 `http://localhost:8080/false-exit/`。
