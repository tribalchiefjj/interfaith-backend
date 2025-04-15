// routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// This endpoint simulates admin login.
// It checks credentials against environment variables.
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // For demonstration, we verify against environment variables.
  // In production, use secure DB checks, hashing, etc.
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    // Create a token with an expiry (e.g., 1 hour)
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    return res.json({ token });
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;
