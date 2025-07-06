const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 確保 db 資料夾存在
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// 開啟或建立資料庫
const dbPath = path.join(dbDir, 'sqlite.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Successfully connected to SQLite database at:', dbPath);

        // 建立 cpi_index 表格 (如果不存在)
        const createTableSQL = `
        CREATE TABLE IF NOT EXISTS cpi_index (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year INTEGER NOT NULL,
            month INTEGER,
            product_name TEXT NOT NULL,
            product_price REAL,
            cpi_value REAL,
            residential_rent_index REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        `;

        db.run(createTableSQL, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Table cpi_index created successfully or already exists');

                // 清除現有資料 (如果需要重新開始)
                db.run("DELETE FROM cpi_index", (err) => {
                    if (err) {
                        console.error('Error clearing table:', err.message);
                    } else {
                        console.log('Table cleared for fresh data insertion');

                        // 插入測試資料
                        const insertData = `
                        INSERT INTO cpi_index (year, month, product_name, product_price, cpi_value, residential_rent_index) 
                        VALUES 
                            (2023, 1, 'Residential Rent', 15000, 105.5, 108.2),
                            (2023, 2, 'Residential Rent', 15200, 106.1, 108.8),
                            (2023, 3, 'Residential Rent', 15100, 105.8, 108.5),
                            (2022, 12, 'Residential Rent', 14800, 104.2, 107.1),
                            (2022, 11, 'Residential Rent', 14900, 104.8, 107.5),
                            (2024, 1, 'Residential Rent', 15500, 107.2, 109.8);
                        `;

                        db.run(insertData, (err) => {
                            if (err) {
                                console.error('Error inserting data:', err.message);
                            } else {
                                console.log('Sample data inserted successfully');

                                // 驗證資料是否成功插入
                                db.all("SELECT * FROM cpi_index ORDER BY year DESC, month DESC", (err, rows) => {
                                    if (err) {
                                        console.error('Error retrieving data:', err.message);
                                    } else {
                                        console.log('Data verification - Records in database:');
                                        console.table(rows);
                                    }

                                    // 關閉資料庫連接
                                    db.close((err) => {
                                        if (err) {
                                            console.error('Error closing database:', err.message);
                                        } else {
                                            console.log('Database connection closed successfully');
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
    }
});
