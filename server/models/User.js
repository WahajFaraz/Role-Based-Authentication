const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * User Schema - Defines the structure for user documents in MongoDB
 * Includes password hashing middleware and methods for password comparison
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
    required: true
  },
  username: {
    type: String,
    sparse: true, // Allows multiple null values
    default: null
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

/**
 * Pre-save middleware to hash password before saving user document
 * Uses bcrypt with salt rounds of 12 for security
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to compare provided password with stored hashed password
 * @param {string} candidatePassword - The password to verify
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Check if password exists
    if (!this.password) {
      console.error('No password stored for user');
      return false;
    }
    
    // Check if candidate password is provided
    if (!candidatePassword) {
      console.error('No candidate password provided');
      return false;
    }
    
    console.log('Comparing passwords for user:', this.email);
    console.log('Has stored password:', !!this.password);
    console.log('Candidate password length:', candidatePassword.length);
    
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison result:', result);
    
    return result;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

/**
 * Transform method to modify the output when converting to JSON
 * Removes sensitive information like password from the response
 */
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

/**
 * Static method to find user by email with password included
 * Used for authentication purposes
 */
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+password');
};

/**
 * Static method to find user by ID with password included
 * Used for password verification purposes
 */
userSchema.statics.findByIdWithPassword = function(id) {
  return this.findById(id).select('+password');
};

const User = mongoose.model('User', userSchema);

module.exports = User;
