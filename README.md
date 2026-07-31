# 八字排盤（網頁版）

繁體中文八字排盤器。手機優先、完全離線運作、單一 HTML 檔。

- 西曆生日排盤，或由四柱干支反查生日
- 四柱、藏干、十神
- 大運／流年／流月，開啟時自動定位到今年

曆法引擎為 1900–2100 節氣表（UTC+8，秒級），日柱以 JDN 純算術、
年柱以立春為界、月柱以十二節為界、時柱五鼠遁。晚子時（23:00–23:59）
日柱歸當日，時柱以翌日日干起遁。

## 這個資料夾是什麼

`index.html` 是由母專案 `tools/build_paipan.py` 產生的**單檔產物**。
不要直接改這裡的 `index.html`——改了會在下次 build 被覆蓋。
要改請動母專案的 `tools/paipan_src.html`，再重跑 build 並複製過來。

## 部署（GitHub Pages）

這個資料夾要放進**一個獨立的公開 repo**，不要放在母專案裡發佈。
母專案含微信群命例、名人研究資料與書籍逐字稿，一旦公開全部外洩。

    git init
    git add .
    git commit -m "八字排盤 網頁版"
    git branch -M main
    git remote add origin https://github.com/<你的帳號>/<repo 名>.git
    git push -u origin main

推上去後到 repo 的 Settings → Pages → Source 選 `main` 分支的根目錄，
儲存後約一分鐘會給出網址：

    https://<你的帳號>.github.io/<repo 名>/

## 授權與免責

自用工具。排盤結果僅供參考。
