const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if any users exist
    const userCount = await User.countDocuments();
    console.log(`Current user count: ${userCount}`);

    if (userCount === 0) {
      // Create first admin user
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('Role: admin');
    } else {
      console.log('ℹ️ Users already exist. Skipping admin creation.');
      
      // Show existing users
      const users = await User.find({}, 'name email role');
      console.log('\nExisting users:');
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();
