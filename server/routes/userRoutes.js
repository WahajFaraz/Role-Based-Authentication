const express = require('express');
const { basicAuth } = require('../middleware/auth');
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile
} = require('../controllers/userController');

const router = express.Router();

/**
 * User Routes - Defines all user-related API endpoints
 * Follows RESTful conventions and implements proper authentication
 */

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Public (no authentication required)
 * @example POST /api/users with user data in request body
 */
router.post('/', createUser);

/**
 * @route   GET /api/users/profile
 * @desc    Get current authenticated user profile
 * @access  Private (requires Basic Authentication)
 * @example GET /api/users/profile with Authorization: Basic base64(email:password)
 */
router.get('/profile', basicAuth, getProfile);

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination
 * @access  Private (requires Basic Authentication)
 * @query   page, limit for pagination
 * @example GET /api/users?page=1&limit=10 with Authorization header
 */
router.get('/', basicAuth, getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user by ID
 * @access  Private (requires Basic Authentication)
 * @param   id - User MongoDB ObjectId
 * @example GET /api/users/507f1f77bcf86cd799439011 with Authorization header
 */
router.get('/:id', basicAuth, getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID
 * @access  Private (requires Basic Authentication)
 * @param   id - User MongoDB ObjectId
 * @body    name, email (optional fields to update)
 * @example PUT /api/users/507f1f77bcf86cd799439011 with updated data and Authorization header
 */
router.put('/:id', basicAuth, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID
 * @access  Private (requires Basic Authentication)
 * @param   id - User MongoDB ObjectId
 * @example DELETE /api/users/507f1f77bcf86cd799439011 with Authorization header
 */
router.delete('/:id', basicAuth, deleteUser);

module.exports = router;
