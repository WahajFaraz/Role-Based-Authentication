const User = require('../models/User');
const { Buffer } = require('buffer');

/**
 * Basic Authentication Middleware
 * Protects routes by verifying HTTP Basic Authentication credentials
 * 
 * Process:
 * 1. Extract Authorization header from request
 * 2. Decode Base64 credentials (username:password format)
 * 3. Find user by email (username) and verify password
 * 4. Attach user to request object if authentication succeeds
 * 5. Return 401 Unauthorized if authentication fails
 */
const basicAuth = async (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header exists and starts with 'Basic '
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide valid credentials.',
        error: 'Missing or invalid Authorization header'
      });
    }

    // Extract Base64 encoded credentials
    const base64Credentials = authHeader.split(' ')[1];
    
    // Decode Base64 string to get username:password
    const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = decodedCredentials.split(':');

    // Validate that both email and password are provided
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials format',
        error: 'Email and password are required'
      });
    }

    // Find user by email with password field included
    const user = await User.findByEmailWithPassword(email.toLowerCase().trim());
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: 'Invalid email or password'
      });
    }

    // Compare provided password with stored hashed password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: 'Invalid email or password'
      });
    }

    // Authentication successful - attach user to request object
    // Remove password from user object for security
    const userWithoutPassword = user.toJSON();
    req.user = userWithoutPassword;
    
    // Continue to next middleware/route handler
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Authentication service unavailable'
    });
  }
};

/**
 * Optional: Middleware to check if user has specific role
 * (Extensible for future role-based access control)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found in request'
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

module.exports = {
  basicAuth,
  authorize
};
