const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, maxlength: 150 },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'government'], default: 'citizen', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
