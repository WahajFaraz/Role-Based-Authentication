const User = require('../models/User');
const { catchAsync, NotFoundError, ValidationError } = require('../middleware/errorHandler');

/**
 * User Controller - Handles all user-related operations
 * Implements CRUD operations with proper error handling and validation
 */

/**
 * @desc    Create a new user
 * @route   POST /api/users
 * @access  Public (no authentication required)
 * @returns {Object} Created user object without password
 */
const createUser = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    throw new ValidationError('Name, email, and password are required');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists',
      error: 'Duplicate email'
    });
  }

  // Only allow admin role if explicitly set and no other users exist (first user becomes admin)
  let userRole = 'user';
  if (role === 'admin') {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      userRole = 'admin'; // First user can be admin
    }
  }

  // Create new user (password will be hashed automatically by pre-save middleware)
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: userRole
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      user
    }
  });
});

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (Admin only)
 * @returns {Array} Array of user objects without passwords
 */
const getAllUsers = catchAsync(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
      error: 'Insufficient permissions'
    });
  }

  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Search functionality
  const search = req.query.search || '';
  const searchQuery = search ? {
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  } : {};

  // Sort functionality
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const sortQuery = { [sortBy]: sortOrder };

  // Get total count for pagination info
  const totalUsers = await User.countDocuments(searchQuery);

  // Get users with pagination, search, and sort
  const users = await User.find(searchQuery)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit,
        hasNext: page < Math.ceil(totalUsers / limit),
        hasPrev: page > 1
      }
    }
  });
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private (Admin or own profile)
 * @returns {Object} User object without password
 */
const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format',
      error: 'Invalid ObjectId'
    });
  }

  // Check permissions: Admin can view any user, normal user can only view their own profile
  if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own profile.',
      error: 'Insufficient permissions'
    });
  }

  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError('User');
  }

  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: {
      user
    }
  });
});

/**
 * @desc    Update user by ID
 * @route   PUT /api/users/:id
 * @access  Private (Admin or own profile)
 * @returns {Object} Updated user object without password
 */
const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, email, password, currentPassword } = req.body;

  // Validate MongoDB ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format',
      error: 'Invalid ObjectId'
    });
  }

  // Check if user exists - include password field for comparison
  const user = await User.findByIdWithPassword(id);
  if (!user) {
    throw new NotFoundError('User');
  }

  // Check permissions: Admin can update any user, normal user can only update their own profile
  if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only update your own profile.',
      error: 'Insufficient permissions'
    });
  }

  // If password change is requested, verify current password first
  if (password) {
    // For normal users, require current password verification
    if (req.user.role !== 'admin') {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change password',
          error: 'Missing current password'
        });
      }

      // Verify current password with better error handling
      try {
        console.log('Attempting to verify current password for user:', user.email);
        console.log('User has password field:', !!user.password);
        
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        console.log('Password validation result:', isCurrentPasswordValid);
        
        if (!isCurrentPasswordValid) {
          return res.status(400).json({
            success: false,
            message: 'Current password is incorrect',
            error: 'Invalid current password'
          });
        }
      } catch (error) {
        console.error('Password verification error:', error);
        return res.status(500).json({
          success: false,
          message: 'Error verifying current password',
          error: 'Password verification failed'
        });
      }
    }
  }

  // If email is being updated, check for duplicates
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(),
      _id: { $ne: id } // Exclude current user from check
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
        error: 'Duplicate email'
      });
    }
  }

  // Update user fields (only allow name, email, and password updates)
  const updateData = {};
  if (name) updateData.name = name.trim();
  if (email) updateData.email = email.toLowerCase().trim();
  
  // Handle password update properly
  if (password) {
    // For password updates, we need to hash it manually since findByIdAndUpdate doesn't trigger pre-save middleware
    const bcrypt = require('bcrypt');
    const saltRounds = 12;
    updateData.password = await bcrypt.hash(password, saltRounds);
  }

  // Normal users cannot change their role
  if (req.user.role !== 'admin') {
    delete updateData.role;
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  // Clear stored auth credentials when password is changed
  if (password) {
    // This will force user to login with new password
    console.log('Password changed for user:', updatedUser.email);
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: updatedUser
    }
  });
});

/**
 * @desc    Delete user by ID
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 * @returns {Object} Confirmation message
 */
const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format',
      error: 'Invalid ObjectId'
    });
  }

  // Check permissions: Only admin can delete users
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
      error: 'Insufficient permissions'
    });
  }

  // Prevent admin from deleting themselves
  if (req.user._id.toString() === id) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account.',
      error: 'Self-deletion not allowed'
    });
  }

  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError('User');
  }

  // Delete user
  await User.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: {
      deletedUserId: id,
      deletedUserEmail: user.email
    }
  });
});

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/users/profile
 * @access  Private (requires authentication)
 * @returns {Object} Current user object without password
 */
const getProfile = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: req.user
    }
  });
});

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile
};
