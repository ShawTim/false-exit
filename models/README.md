# models/

放 GLTF/GLB 模型檔嘅地方。對應 `content/models.json` 入面登記嘅名。

## 點用

1. 將 `.glb` 檔放入呢個資料夾，例如 `chair.glb`。
2. 確認 `content/models.json` 有登記：`"chair": "models/chair.glb"`。
3. Game 啟動時會自動預載；room builder 入面用咗 `model: "chair"` 嘅 decoy 會自動改用真實模型。

## 冇檔案會點

完全冇問題——每個 `model:` 都有程式生成嘅 fallback（長方體/圓柱體拼出嚟），load 唔到會自動用 fallback，遊戲照樣行到。

## 已登記名稱

chair, table, crate, plant, painting, bookshelf, keycard, door, barrel, machine

加新名就喺 `content/models.json` 加一行，再喺 `world.js` 對應嘅 decoy 加 `model: "新名"`。

## 建議來源（CC0 / 免費）

- Poly Haven
- Quaternius
- Kay Lousberg
- Sketchfab（篩 CC / CC0）

模型比例請縮到大概 1 unit = 1 米，原點放腳底中央。
