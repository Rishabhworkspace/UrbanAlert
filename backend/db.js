const mongoose = require('mongoose');
const dns = require('dns');

// Force Google Public DNS to bypass local network SRV blocking
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.warn("MONGODB_URI is undefined, you must set an env variable.");
    }
    await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/urbanalert');
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
