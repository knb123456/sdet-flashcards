// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;
const auth = require('basic-auth');

function adminAuth(req, res, next) {
  const user = auth(req);
  const username = 'admin';   // Set your username
  const password = 'password'; // Set your password

  if (user && user.name === username && user.pass === password) {
    next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm="Flashcards Admin"');
    res.status(401).send('Authentication required.');
  }
}

app.use(cors());
app.use(express.json());

// Apply auth only to admin routes
app.use(['/flashcards', '/flashcards/:id'], (req, res, next) => {
  if (req.method === 'GET') return next(); // Allow study mode (GET) without auth
  adminAuth(req, res, next);
});




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

// Routes

// Get all flashcards
app.get('/flashcards', (req, res) => {
  db.all('SELECT * FROM flashcards', [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

// Add a flashcard
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

// Update a flashcard
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

// Delete a flashcard
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
