const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const Papa = require('papaparse');
const sqlite3 = require('sqlite3');
const path = require('path');  // Using path for __dirname
const { promisify } = require('util');

const __filename = __filename;  // CommonJS way to get the current file name
const __dirname = path.dirname(__filename);  // CommonJS way to get the directory name

// Initialize SQLite database
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to the in-memory SQLite database');
  }
});

// Convert callback-based methods to Promise-based
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

// Create products table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      purchasePrice REAL NOT NULL,
      sellingPrice REAL NOT NULL,
      stockQuantity INTEGER NOT NULL,
      profit REAL NOT NULL,
      sales INTEGER DEFAULT 0,
      uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

const app = express();
app.use(cors());
app.use(express.json());

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    
    Papa.parse(fileContent, {
      header: true,
      complete: async (results) => {
        try {
          // Begin transaction
          await dbRun('BEGIN TRANSACTION');

          for (const row of results.data) {
            if (!row['Product Name'] || !row['SKU']) continue;

            const profit = Number(row['Selling Price']) - Number(row['Purchase Price']);
            
            try {
              await dbRun(
                `INSERT INTO products (name, sku, category, purchasePrice, sellingPrice, stockQuantity, profit)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                  row['Product Name'],
                  row['SKU'],
                  row['Category'] || 'Uncategorized',
                  Number(row['Purchase Price']) || 0,
                  Number(row['Selling Price']) || 0,
                  Number(row['Stock Quantity']) || 0,
                  profit
                ]
              );
            } catch (err) {
              console.error('Error inserting row:', err);
              // Continue with next row if there's an error
              continue;
            }
          }

          // Commit transaction
          await dbRun('COMMIT');
          
          // Clean up uploaded file
          fs.unlinkSync(req.file.path);
          
          res.json({ message: 'Upload successful' });
        } catch (error) {
          // Rollback on error
          await dbRun('ROLLBACK');
          throw error;
        }
      },
      error: (error) => {
        res.status(400).json({ error: error.message });
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
