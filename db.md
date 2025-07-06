資料庫設定 prompt
1. 安裝 sqlite3 並新增到 package.json
2. 在 db.js 中，使用 sqlite3 來操作資料庫，並開啟位置在 db/sqlite.db 的資料庫，需要確認是否成功打開資料庫
3. 若資料庫不存在，就新增資料庫
4. 在 db.js 中，若`*cpi_index`* table 不存在，則會自動建立一個新的table
   table scheme 如下

```sql
CREATE TABLE cpi_index (
  
);
```

5. 在 db.js 中，用 SQLite 在 cpi_index 新增以下資料
   欄位名稱

6.執行 db.js
7.驗證 資料庫抓取資料是否成功

前端 prompt 
Taiwan 一 Consumer Price lndex [CPI]一 Residential Rent
ResidentiaI Rent lndex 
2. 網站請包含
   1. 輸入(日期、商品名稱、商品價格)  year and CPI 
   2. 簡易查詢
      1. 直接以表格或清單呈現物價變化
      2. 或是可以輸入文字框，縮小搜尋範圍等功能。
3. 網頁需要有前端網頁、後端 web api、與 SQLite 資料庫。