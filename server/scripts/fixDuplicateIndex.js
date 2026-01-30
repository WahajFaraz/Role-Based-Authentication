const mongoose = require('mongoose');
require('dotenv').config();

async function fixDuplicateIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Drop the problematic username index if it exists
    try {
      await db.collection('users').dropIndex('username_1');
      console.log('Dropped username_1 index');
    } catch (error) {
      console.log('username_1 index does not exist or already dropped');
    }

    // Remove any documents with null username that might be causing issues
    const result = await db.collection('users').deleteMany({ 
      username: null,
      email: { $exists: false } // Only remove documents that don't have email
    });
    console.log(`Removed ${result.deletedCount} documents with null username and no email`);

    // Create a new sparse index for username
    await db.collection('users').createIndex(
      { username: 1 }, 
      { 
        sparse: true, 
        unique: true,
        name: 'username_sparse_unique'
      }
    );
    console.log('Created sparse unique index for username');

    console.log('Index fix completed successfully');
  } catch (error) {
    console.error('Error fixing index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixDuplicateIndex();
