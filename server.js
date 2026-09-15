const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Get today's tasks
app.get('/api/tasks', (req, res) => {
  const rows = db.prepare('SELECT id, text, completed, in_bin FROM active_tasks ORDER BY id ASC').all();
  res.json(rows.map(r => ({
    id: r.id,
    text: r.text,
    completed: Boolean(r.completed),
    inBin: Boolean(r.in_bin)
  })));
});

// 2. Add simple task
app.post('/api/tasks', (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Text required' });

  const stmt = db.prepare('INSERT INTO active_tasks (text, completed, in_bin) VALUES (?, 0, 0)');
  const result = stmt.run(text.trim());
  res.json({ id: result.lastInsertRowid, text: text.trim(), completed: false, inBin: false });
});

// 3. Update task status (tick complete or move to bin)
app.patch('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { completed, inBin } = req.body;

  if (completed !== undefined) {
    db.prepare('UPDATE active_tasks SET completed = ? WHERE id = ?').run(completed ? 1 : 0, id);
  }
  if (inBin !== undefined) {
    db.prepare('UPDATE active_tasks SET in_bin = ? WHERE id = ?').run(inBin ? 1 : 0, id);
  }

  res.json({ success: true });
});

// 4. Archive day: completed tasks & all uncompleted tasks (active or in bin) are saved
app.post('/api/archive', (req, res) => {
  const tasks = db.prepare('SELECT text, completed FROM active_tasks').all();
  if (tasks.length === 0) return res.status(400).json({ error: 'No tasks to archive' });

  const completed = tasks.filter(t => t.completed === 1).map(t => t.text);
  const uncompleted = tasks.filter(t => t.completed === 0).map(t => t.text);
  const todayStr = new Date().toISOString().split('T')[0];

  const archiveTx = db.transaction(() => {
    db.prepare(`
      INSERT INTO history_records (date, completed_tasks, uncompleted_tasks)
      VALUES (?, ?, ?)
    `).run(todayStr, JSON.stringify(completed), JSON.stringify(uncompleted));

    db.prepare('DELETE FROM active_tasks').run();
  });

  archiveTx();
  res.json({ success: true });
});

// 5. Get history records
app.get('/api/history', (req, res) => {
  const records = db.prepare('SELECT id, date, completed_tasks, uncompleted_tasks FROM history_records ORDER BY id DESC').all();
  res.json(records.map(r => ({
    id: r.id,
    date: r.date,
    completed: JSON.parse(r.completed_tasks),
    uncompleted: JSON.parse(r.uncompleted_tasks)
  })));
});

// 6. Clear history
app.delete('/api/history', (req, res) => {
  db.prepare('DELETE FROM history_records').run();
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
module.exports = app;