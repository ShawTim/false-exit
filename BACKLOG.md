# BACKLOG — Infinite Puzzle Game

## Ready Now

### IPG-001 — 首個 playable puzzle loop
目標：將現有 scaffold 變成可玩的一關最小 loop。

#### Scope
- 將 `seed.json` 改成只含 1 個 chapter、1 條謎題、1 個正確答案
- 頁面顯示：章節標題、劇情文本、題目、輸入框、提交掣、結果訊息
- 答案正確時顯示 success 文案；錯誤時顯示 retry 文案
- 全部前端純靜態，不加 backend

#### Acceptance
- static server 打開後，畫面不再只係 scaffold 文案
- 畫面可見故事文本 + 題目 + input + button
- 輸入錯答案會見到明確錯誤提示
- 輸入正確答案會見到明確成功提示
- Browser console 無 error
- `tests/smoke.md` 已更新對應驗收步驟

#### Suggested Files
- `index.html`
- `assets/js/main.js`
- `content/story/seed.json`
- `tests/smoke.md`
- 如有需要：`assets/css/styles.css`

## Next
- IPG-002 — 答題後推進下一 story beat
- IPG-003 — 將 chapter schema 文件化
- IPG-004 — 加入 restart / next puzzle flow
