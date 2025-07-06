const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const MacroMicroScraper = require('./scraper');

const app = express();
const PORT = 3000;

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 資料庫連接
const dbPath = path.join(__dirname, 'db', 'sqlite.db');
const db = new sqlite3.Database(dbPath);

// API 路由

// 獲取所有 CPI 資料
app.get('/api/cpi', (req, res) => {
    db.all("SELECT * FROM cpi_index ORDER BY year DESC, month DESC", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 搜尋 CPI 資料
app.get('/api/cpi/search', (req, res) => {
    const { year, product } = req.query;
    let sql = "SELECT * FROM cpi_index WHERE 1=1";
    const params = [];

    if (year) {
        sql += " AND year = ?";
        params.push(year);
    }

    if (product) {
        sql += " AND product_name LIKE ?";
        params.push(`%${product}%`);
    }

    sql += " ORDER BY year DESC, month DESC";

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 新增 CPI 資料
app.post('/api/cpi', (req, res) => {
    const { year, month, product_name, product_price, cpi_value, residential_rent_index } = req.body;

    const sql = `INSERT INTO cpi_index (year, month, product_name, product_price, cpi_value, residential_rent_index) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(sql, [year, month, product_name, product_price, cpi_value, residential_rent_index], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Data inserted successfully' });
    });
});

// 刪除 CPI 資料
app.delete('/api/cpi/:id', (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM cpi_index WHERE id = ?", [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Record not found' });
            return;
        }
        res.json({ message: 'Data deleted successfully' });
    });
});

// 網路爬蟲 - 從 MacroMicro 網站獲取資料
app.post('/api/sync-web-data', async (req, res) => {
    try {
        console.log('開始同步網路資料...');

        const scraper = new MacroMicroScraper();
        const result = await scraper.run();

        if (result.success) {
            console.log(`同步完成，新增了 ${result.count} 筆資料`);
            res.json({
                success: true,
                count: result.count,
                total: result.total,
                message: `Successfully synced ${result.count} new records from ${result.total} total records`
            });
        } else {
            throw new Error(result.error || '同步失敗');
        }

    } catch (error) {
        console.error('同步資料時發生錯誤:', error);
        res.status(500).json({ error: '同步資料失敗: ' + error.message });
    }
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Frontend is available at http://localhost:${PORT}/index.html`);
});
