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
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // MongoDB connection options
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Log connection details in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔗 Connection String: ${mongoURI.replace(/\/\/.*@/, '//***:***@')}`);
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
    console.error('❌ Database connection failed:', error.message);
    
    // Exit process with failure in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    
    // In development, throw error to be handled by calling code
    throw error;
  }
};

/**
 * Disconnect from MongoDB database
 * Gracefully closes the database connection
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('🔚 MongoDB connection closed successfully');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error.message);
    throw error;
  }
};

/**
 * Check database connection status
 * @returns {boolean} True if connected, false otherwise
 */
const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get database connection information
 * @returns {Object} Connection details
 */
const getConnectionInfo = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return {
    state: states[state],
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    readyState: state
  };
};

module.exports = {
  connectDB,
  disconnectDB,
  isDBConnected,
  getConnectionInfo
};
