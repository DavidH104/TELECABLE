// Utility script to hash existing passwords in the database
// Run: node hashPasswords.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const Admin = require('./models/admin');

const dbURI = 'mongodb://localhost:27017/telecable';

async function hashPasswords() {
  try {
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB');

    // Hash user passwords
    const users = await User.find({ password: { $exists: true, $ne: null } });
    console.log(`Found ${users.length} users with passwords`);

    for (const user of users) {
      // Skip if already hashed (bcrypt hashes start with $2)
      if (user.password && user.password.startsWith('$2')) {
        console.log(`User ${user.numero} already hashed, skipping`);
        continue;
      }
      
      if (user.password) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        await user.save();
        console.log(`Hashed password for user ${user.numero}`);
      }
    }

    // Hash admin passwords
    const admins = await Admin.find({ password: { $exists: true, $ne: null } });
    console.log(`Found ${admins.length} admins`);

    for (const admin of admins) {
      // Skip if already hashed
      if (admin.password && admin.password.startsWith('$2')) {
        console.log(`Admin ${admin.usuario} already hashed, skipping`);
        continue;
      }
      
      if (admin.password) {
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        admin.password = hashedPassword;
        await admin.save();
        console.log(`Hashed password for admin ${admin.usuario}`);
      }
    }

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

hashPasswords();
