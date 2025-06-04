const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'https://knb123456.github.io' // Your frontend domain
}));
app.use(express.json());

// PostgreSQL Pool (Supabase) with IPv4 enforced
const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
  ssl: { rejectUnauthorized: false },
  family: 4 // Force IPv4 to avoid ENETUNREACH errors on IPv6
});

// Routes

// Get all flashcards
app.get('/flashcards', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM flashcards ORDER BY topic ASC, question ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error details:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// Add flashcard
app.post('/flashcards', async (req, res) => {
  const { topic, question, answer } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO flashcards (topic, question, answer) VALUES ($1, $2, $3) RETURNING *',
      [topic, question, answer]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update flashcard
app.put('/flashcards/:id', async (req, res) => {
  const { id } = req.params;
  const { topic, question, answer } = req.body;
  try {
    const result = await pool.query(
      'UPDATE flashcards SET topic = $1, question = $2, answer = $3 WHERE id = $4 RETURNING *',
      [topic, question, answer, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete flashcard
app.delete('/flashcards/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM flashcards WHERE id = $1', [id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
