require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const emails = [
  'rishabh.j.tripathi2903@gmail.com',
  'sandilyasaumya6@gmail.com'
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Gov123456!', salt);

    for (const email of emails) {
      let user = await User.findOne({ email });
      if (user) {
        user.role = 'government';
        await user.save();
        console.log(`Updated existing user ${email} to government role.`);
      } else {
        user = new User({
          name: email.split('@')[0],
          email: email,
          passwordHash: passwordHash,
          role: 'government'
        });
        await user.save();
        console.log(`Created new government user ${email} with password Gov123456!`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

seed();
