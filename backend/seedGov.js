require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const officials = [
  {
    name: 'Rishabh Tripathi',
    email: 'rishabh.j.tripathi2903@gmail.com',
    password: '123456789'
  },
  {
    name: 'Saumya Sandilya',
    email: 'sandilyasaumya6@gmail.com',
    password: '123456789'
  },
  {
    name: 'Rishabh ',
    email: 'rishabh.t2903@gmail.com',
    password: 'Akash@2903$'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    for (const official of officials) {
      let user = await User.findOne({ email: official.email });
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(official.password, salt);

      if (user) {
        user.name = official.name; // Update name as well
        user.passwordHash = passwordHash;
        user.role = 'government';
        await user.save();
        console.log(`Updated existing user ${official.email} to government role with specified credentials.`);
      } else {
        user = new User({
          name: official.name,
          email: official.email,
          passwordHash: passwordHash,
          role: 'government'
        });
        await user.save();
        console.log(`Created new government user ${official.email} / Name: ${official.name}`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

seed();
