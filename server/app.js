require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./utils/database');
const { globalErrorHandler } = require('./middleware/errorHandler');

// Import routes
const userRoutes = require('./routes/userRoutes');

/**
 * Main Application File - User Management System
 * Express.js server setup with middleware, routes, and error handling
 */

const app = express();

/**
 * Trust proxy for secure headers in production
 * Important when running behind reverse proxy (nginx, AWS ELB, etc.)
 */
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

/**
 * CORS Configuration
 * Enables Cross-Origin Resource Sharing with security considerations
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, specify allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://yourdomain.com' // Replace with your production domain
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

/**
 * Body Parsing Middleware
 * Parse incoming request bodies with JSON payload limit
 */
app.use(express.json({ limit: '10kb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Parse URL-encoded bodies

/**
 * Request Logging Middleware
 * Logs incoming requests in development environment
 */
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.originalUrl} - ${req.ip}`);
    next();
  });
}

/**
 * Health Check Endpoint
 * Simple endpoint to verify server is running
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

/**
 * API Routes
 * Mount user routes under /api/users prefix
 */
app.use('/api/users', userRoutes);

/**
 * Root Endpoint
 * Basic information about the API
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User Management System API',
    version: '1.0.0',
    description: 'A RESTful API for managing users with Basic Authentication',
    endpoints: {
      health: '/health',
      users: {
        create: 'POST /api/users',
        getAll: 'GET /api/users',
        getById: 'GET /api/users/:id',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id',
        profile: 'GET /api/users/profile'
      },
      authentication: {
        type: 'Basic Authentication',
        header: 'Authorization: Basic <base64(email:password)>'
      }
    },
    documentation: 'https://github.com/yourusername/user-management-system'
  });
});

/**
 * 404 Handler - Route Not Found
 * Handles requests to non-existent endpoints
 */
app.use('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /api/users',
      'GET /api/users',
      'GET /api/users/:id',
      'PUT /api/users/:id',
      'DELETE /api/users/:id',
      'GET /api/users/profile'
    ]
  });
});

/**
 * Global Error Handler
 * Must be the last middleware in the stack
 */
app.use(globalErrorHandler);

/**
 * Start Server Function
 * Initializes database connection and starts Express server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('🗄️  Database connected successfully');

    // Get port from environment variables or use default
    const PORT = process.env.PORT || 5000;

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 Server listening on port ${PORT}`);
      console.log(`🌐 Local URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(() => {
        console.log('🔚 HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app; // Export for testing purposes
