# 📋 Daily Task Tracker

A full-stack, multi-user daily task management web application built with a modern frontend, serverless architecture, and Supabase cloud database with strict user data isolation.

## 🚀 Live Demo
- **URL**: https://daily-task-tracker-puwvihfyg-sureshjaggampudi-7307s-projects.vercel.app/

---

## ✨ Features

- 🔐 **Multi-User Authentication**: Built-in email/password authentication using Supabase Auth.
- 🛡️ **User Data Isolation**: Implements PostgreSQL Row Level Security (RLS) so each user can only view and manage their own tasks and history.
- 📝 **Today's Active Tasks**: Add, complete, or discard items with instant UI updates.
- 🗑️ **Uncompleted Bin**: Automatically segregates tasks moved to the bin to keep the main list organized.
- 📦 **End-of-Day Archival**: Move daily completed and missed tasks into permanent history records with one click.
- 📜 **Historical Logs**: Dedicated history dashboard to review past day achievements and missed items.
- ☁️ **Cloud Database**: Powered by Supabase PostgreSQL for persistent cloud storage.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, Tailwind CSS
- **Backend / API**: Node.js, Express.js
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **Deployment**: Vercel

---

## 🔒 Security & Database Schema

The database uses PostgreSQL tables protected by Row Level Security:

- `active_tasks`: Stores current day tasks linked via `user_id uuid references auth.users(id)`.
- `history_records`: Stores archived daily records structured in `jsonb` format linked to `user_id`.

```sql
-- RLS Policy Example
create policy "Users can manage their own active tasks"
on active_tasks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

---

## ⚙️ Local Development

1. Clone the repository:
```bash
git clone https://github.com/Suresh-0x/daily-task-tracker1.git
cd daily-task-tracker1
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
node server.js
```

4. Open `http://localhost:3000` in your browser.
on active_tasks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
