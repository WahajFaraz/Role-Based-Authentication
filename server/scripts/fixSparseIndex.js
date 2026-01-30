const mongoose = require('mongoose');
require('dotenv').config();

async function fixSparseIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Drop the problematic sparse index if it exists
    try {
      await db.collection('users').dropIndex('username_sparse_unique');
      console.log('Dropped username_sparse_unique index');
    } catch (error) {
      console.log('username_sparse_unique index does not exist or already dropped');
    }

    // Check for any documents with null username that might be causing issues
    const nullUsernameDocs = await db.collection('users').find({ username: null }).toArray();
    console.log(`Found ${nullUsernameDocs.length} documents with null username`);

    // Create a proper sparse index that allows multiple null values
    await db.collection('users').createIndex(
      { username: 1 }, 
      { 
        sparse: true, 
        unique: false, // Remove unique constraint for now
        name: 'username_sparse'
      }
    );
    console.log('Created sparse index for username (non-unique)');

    // Alternatively, create a compound index that won't conflict with null values
    await db.collection('users').createIndex(
      { username: 1, email: 1 }, 
      { 
        sparse: true,
        unique: true, // Unique on combination of username and email
        name: 'username_email_sparse_unique'
      }
    );
    console.log('Created compound sparse unique index for username and email');

    console.log('Sparse index fix completed successfully');
  } catch (error) {
    console.error('Error fixing sparse index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixSparseIndex();
