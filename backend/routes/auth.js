const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'citizen' // Registration is only for citizens
    });

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, source } = req.body;
    
    // Find user (normalize email)
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Role check based on source (citizen vs government)
    if (source === 'citizen' && user.role === 'government') {
      return res.status(403).json({ message: 'Government officers must use the Government Login portal' });
    }
    if (source === 'government' && user.role === 'citizen') {
      return res.status(403).json({ message: 'Citizens must use the Citizen Login portal' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST /api/auth/create-gov
router.post('/create-gov', async (req, res) => {
  try {
    const { name, email, password, secret } = req.body;
    if (secret !== process.env.GOV_SEED_SECRET) {
      return res.status(403).json({ message: 'Invalid seed secret' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'government'
    });

    await user.save();
    res.status(201).json({ message: 'Government account created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
