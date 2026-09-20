const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Get today's tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const { data, error } = await db
      .from('active_tasks')
      .select('id, text, completed, in_bin')
      .order('id', { ascending: true });

    if (error) throw error;

    res.json(data.map(r => ({
      id: r.id,
      text: r.text,
      completed: Boolean(r.completed),
      inBin: Boolean(r.in_bin)
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Add simple task
app.post('/api/tasks', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Text required' });

    const { data, error } = await db
      .from('active_tasks')
      .insert([{ text: text.trim(), completed: false, in_bin: false }])
      .select()
      .single();

    if (error) throw error;

    res.json({
      id: data.id,
      text: data.text,
      completed: false,
      inBin: false
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update task status (tick complete or move to bin)
app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, inBin } = req.body;

    const updates = {};
    if (completed !== undefined) updates.completed = Boolean(completed);
    if (inBin !== undefined) updates.in_bin = Boolean(inBin);

    const { error } = await db
      .from('active_tasks')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Archive day: save to history and clear active tasks
app.post('/api/archive', async (req, res) => {
  try {
    const { data: tasks, error: fetchErr } = await db
      .from('active_tasks')
      .select('text, completed');

    if (fetchErr) throw fetchErr;
    if (!tasks || tasks.length === 0) {
      return res.status(400).json({ error: 'No tasks to archive' });
    }

    const completed = tasks.filter(t => t.completed).map(t => t.text);
    const uncompleted = tasks.filter(t => !t.completed).map(t => t.text);
    const todayStr = new Date().toISOString().split('T')[0];

    const { error: insertErr } = await db
      .from('history_records')
      .insert([{
        date: todayStr,
        completed_tasks: completed,
        uncompleted_tasks: uncompleted
      }]);

    if (insertErr) throw insertErr;

    const { error: deleteErr } = await db
      .from('active_tasks')
      .delete()
      .neq('id', 0); // delete all rows

    if (deleteErr) throw deleteErr;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get history records
app.get('/api/history', async (req, res) => {
  try {
    const { data, error } = await db
      .from('history_records')
      .select('id, date, completed_tasks, uncompleted_tasks')
      .order('id', { ascending: false });

    if (error) throw error;

    res.json(data.map(r => ({
      id: r.id,
      date: r.date,
      completed: r.completed_tasks,
      uncompleted: r.uncompleted_tasks
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Clear history
app.delete('/api/history', async (req, res) => {
  try {
    const { error } = await db
      .from('history_records')
      .delete()
      .neq('id', 0);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;