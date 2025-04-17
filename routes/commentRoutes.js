// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
// Create a comment or reply
router.post('/', async (req, res) => {
  const { post_id, text, username = 'Anonymous', parent_comment_id = null } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO comments (post_id, text, username, parent_comment_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [post_id, text, username.trim() || 'Anonymous', parent_comment_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Reply to a comment
router.post('/:comment_id/reply', async (req, res) => {
  const { comment_id } = req.params;
  const { post_id, text, username = 'Anonymous' } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO comments (post_id, text, username, parent_comment_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [post_id, text, username.trim() || 'Anonymous', comment_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error replying to comment:', error);
    res.status(500).json({ error: 'Failed to reply to comment' });
  }
});



// GET comments by post_id
router.get('/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC',
      [postId]
    );

    const comments = result.rows;

    // Step 1: Map each comment by its ID
    const commentMap = {};
    comments.forEach(comment => {
      comment.replies = [];
      commentMap[comment.id] = comment;
    });

    // Step 2: Nest replies under their parent
    const rootComments = [];
    comments.forEach(comment => {
      if (comment.parent_comment_id) {
        const parent = commentMap[comment.parent_comment_id];
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    res.json(rootComments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Internal server error' });
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
