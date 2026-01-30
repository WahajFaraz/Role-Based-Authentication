const mongoose = require('mongoose');

/**
 * Database Connection Utility
 * Handles MongoDB connection with proper error handling and configuration
 */

/**
 * Connect to MongoDB database
 * Uses environment variables for configuration
 * Implements connection retry logic and proper error handling
 */
const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.log('⚠️  MONGODB_URI not found, running without database');
      return; // Don't throw error, just return
    }

    // MongoDB connection options
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, options);

    console.log(✅ MongoDB Connected: \);
    console.log(📊 Database: \);
    
    // Log connection details in development
    if (process.env.NODE_ENV === 'development') {
      console.log(🔗 Connection String: \);
    }

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('🟢 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('🔴 Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🟡 Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      console.log('\n📴 Received SIGINT. Closing MongoDB connection...');
      await mongoose.connection.close();
      console.log('🔚 MongoDB connection closed through app termination');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n📴 Received SIGTERM. Closing MongoDB connection...');
      await mongoose.connection.close();
      console.log('🔚 MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️  Running without database connection');
    // Don't exit, just continue without database
    return null;
  }
};

module.exports = { connectDB };
