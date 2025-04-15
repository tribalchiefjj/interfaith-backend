const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const pool = require('./db');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const authRoutes = require('./routes/authRoutes');
const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.100.5:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is working');
});

app.use('/api/posts', postRoutes); // 👈 Use route from the routes folder

app.use('/api/comments', commentRoutes);

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
