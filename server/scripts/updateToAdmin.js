const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function updateToAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update first user to admin
    const result = await User.updateOne(
      { email: 'wahajfaraz93@gmail.com' },
      { role: 'admin' }
    );
    
    console.log('Updated user to admin:', result.modifiedCount);
    
    const users = await User.find({}, 'name email role');
    console.log('\nUpdated users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateToAdmin();
