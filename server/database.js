import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlite3Verbose = sqlite3.verbose();

const dbPath = path.resolve(__dirname, 'library.db');
const db = new sqlite3Verbose.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      parentId TEXT,
      name TEXT,
      type TEXT,
      content TEXT,
      url TEXT,
      lastModified INTEGER
    )`, (err) => {
      if (err) {
        console.error('Error creating table', err.message);
      } else {
        // Try to add url column if it doesn't exist (for migration)
        db.run(`ALTER TABLE files ADD COLUMN url TEXT`, (err) => {
           // Ignore error if column already exists
        });

        // Check if root exists, if not create it
        db.get("SELECT id FROM files WHERE id = 'root'", (err, row) => {
          if (!row) {
            const now = Date.now();
            db.run(`INSERT INTO files (id, parentId, name, type, content, lastModified) 
                    VALUES ('root', NULL, '내 서재', 'FOLDER', NULL, ?)`, [now]);
            
            // Initial data setup
             db.run(`INSERT INTO files (id, parentId, name, type, content, lastModified) 
                    VALUES ('folder-1', 'root', '고전문학', 'FOLDER', NULL, ?)`, [now]);
             db.run(`INSERT INTO files (id, parentId, name, type, content, lastModified) 
                    VALUES ('file-welcome', 'root', '도서관 이용 안내.md', 'MARKDOWN', '# 환영합니다\n\n도서관 이용 안내입니다.', ?)`, [now]);
          }
        });
      }
    });
  }
});

export default db;