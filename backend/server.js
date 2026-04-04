require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (dev)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/issues', require('./routes/issues'));

// Health Check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Global Error Handler (must be after routes)
app.use((err, req, res, next) => {
  console.error('=== Unhandled Error ===');
  console.error('Path:', req.method, req.path);
  console.error('Error:', err.message || err);
  console.error('Stack:', err.stack);
  
  // Handle Multer file size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
  }
  
  // Handle Multer file type errors
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
