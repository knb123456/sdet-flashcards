const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
// const auth = require('basic-auth'); // Commented out for now
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: 'https://knb123456.github.io' // Your frontend URL
}));

// SQLite setup
const db = new sqlite3.Database('./flashcards.db', (err) => {
  if (err) console.error('Error opening DB:', err.message);
  else console.log('Connected to SQLite DB.');
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS flashcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL
    )
  `);
});

// Authentication middleware (commented out)
/*
function adminAuth(req, res, next) {
  const user = auth(req);
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (req.method === 'GET' && req.path === '/flashcards') {
    return next(); // Allow public access for study mode
  }

  if (user && user.name === username && user.pass === password) {
    next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm="Flashcards Admin"');
    res.status(401).send('Authentication required.');
  }
}

// app.use(adminAuth); // Apply auth middleware globally
*/

// Serve admin.html (currently unprotected)
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Flashcards API routes

// Get all flashcards (public for study mode)
app.get('/flashcards', (req, res) => {
  db.all('SELECT * FROM flashcards', [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

// Add a flashcard (currently unprotected)
app.post('/flashcards', (req, res) => {
  const { topic, question, answer } = req.body;
  db.run(
    'INSERT INTO flashcards (topic, question, answer) VALUES (?, ?, ?)',
    [topic, question, answer],
    function (err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ id: this.lastID });
    }
  );
});

// Update a flashcard (currently unprotected)
app.put('/flashcards/:id', (req, res) => {
  const { topic, question, answer } = req.body;
  const { id } = req.params;
  db.run(
    'UPDATE flashcards SET topic = ?, question = ?, answer = ? WHERE id = ?',
    [topic, question, answer, id],
    function (err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ updated: this.changes });
    }
  );
});

// Delete a flashcard (currently unprotected)
app.delete('/flashcards/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM flashcards WHERE id = ?', id, function (err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ deleted: this.changes });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
