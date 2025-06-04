const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'https://knb123456.github.io'
}));
app.use(express.json());

// SQLite DB
const dbPath = path.join(__dirname, 'flashcards.db');
const db = new sqlite3.Database(dbPath);

// Initialize flashcards table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS flashcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT,
      question TEXT,
      answer TEXT
    )
  `);
});

// Routes
app.get('/flashcards', (req, res) => {
  db.all('SELECT * FROM flashcards ORDER BY topic ASC, question ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/flashcards', (req, res) => {
  const { topic, question, answer } = req.body;
  const stmt = db.prepare('INSERT INTO flashcards (topic, question, answer) VALUES (?, ?, ?)');
  stmt.run(topic, question, answer, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, topic, question, answer });
  });
  stmt.finalize();
});

app.put('/flashcards/:id', (req, res) => {
  const { topic, question, answer } = req.body;
  const stmt = db.prepare('UPDATE flashcards SET topic = ?, question = ?, answer = ? WHERE id = ?');
  stmt.run(topic, question, answer, req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: req.params.id, topic, question, answer });
  });
  stmt.finalize();
});

app.delete('/flashcards/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM flashcards WHERE id = ?');
  stmt.run(req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted successfully' });
  });
  stmt.finalize();
});

// Start server
app.listen(port, () => {
  console.log(`SQLite server running at http://localhost:${port}`);
});
