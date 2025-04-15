// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create a post
router.post('/', async (req, res) => {
  const { religion, sign, thought, username } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO posts (religion, sign, thought, username) VALUES ($1, $2, $3, $4) RETURNING *',
      [religion, sign, thought, username || 'Anonymous']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


// Get all posts + their comments
router.get('/', async (req, res) => {
  try {
    const postsResult = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
    const posts = postsResult.rows;

    const commentsResult = await pool.query('SELECT * FROM comments ORDER BY created_at ASC');
    const comments = commentsResult.rows;

    const postsWithComments = posts.map(post => {
      const postComments = comments.filter(comment => comment.post_id === post.id);
      return { ...post, comments: postComments };
    });

    res.json(postsWithComments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch posts and comments' });
  }
});

// ✅ Like a post
router.post('/:id/like', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not like post' });
  }
});

router.post('/:id/dislike', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE posts SET dislikes = dislikes + 1 WHERE id = $1', [id]);
    res.status(200).json({ message: 'Disliked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to dislike the post' });
  }
});

// Delete a post by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Delete comments first if you want cascading deletion (if not handled by foreign key with ON DELETE CASCADE)
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Update a post by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { religion, sign, thought, username } = req.body;
  try {
    const result = await pool.query(
      'UPDATE posts SET religion = $1, sign = $2, thought = $3, username = $4 WHERE id = $5 RETURNING *',
      [religion, sign, thought, username || 'Anonymous', id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});



module.exports = router;
