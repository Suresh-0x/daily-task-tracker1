const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

// Uses /tmp on Vercel, or local directory when running on your PC
const dbPath = process.env.VERCEL ? path.join(os.tmpdir(), 'tasks.db') : path.join(__dirname, 'tasks.db');

const db = new Database(dbPath);

// Active tasks
db.prepare(`
  CREATE TABLE IF NOT EXISTS active_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    in_bin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// History records
db.prepare(`
  CREATE TABLE IF NOT EXISTS history_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    completed_tasks TEXT NOT NULL,
    uncompleted_tasks TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

module.exports = db;