// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
// Create a comment
router.post('/', async (req, res) => {
  // Destructure with default value
  const { post_id, text, username = 'Anonymous' } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO comments (post_id, text, username) VALUES ($1, $2, $3) RETURNING *',
      [post_id, text, username.trim() || 'Anonymous'] // Handle empty strings
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET comments by post_id
router.get('/:post_id', async (req, res) => {
  const { post_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at DESC',
      [post_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch comments' });
  }
});


// Delete a comment by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Update a comment by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { text, username } = req.body;
  try {
    const result = await pool.query(
      'UPDATE comments SET text = $1, username = $2 WHERE id = $3 RETURNING *',
      [text, username || 'Anonymous', id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});


module.exports = router;
