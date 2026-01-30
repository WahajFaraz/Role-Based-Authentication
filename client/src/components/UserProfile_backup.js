import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Save, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import './UserProfile.css';

/**
 * User Profile Component with Role-Based Access Control
 * Normal users can only view and edit their own profile
 * Admins can access this but will see their own profile (not others)
 */
const UserProfile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setFetchLoading(true);
      const response = await userAPI.getProfile();
      setProfileData(prev => ({
        ...prev,
        name: response.user.name || '',
        email: response.user.email || ''
      }));
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch profile';
      toast.error(errorMessage);
      
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setFetchLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (profileData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Password validation only if password fields are filled
    if (profileData.currentPassword || profileData.newPassword || profileData.confirmPassword) {
      if (!profileData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }

      if (!profileData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (profileData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }

      if (!profileData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password';
      } else if (profileData.newPassword !== profileData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        name: profileData.name.trim()
      };

      // Only include password if user wants to change it
      if (profileData.currentPassword && profileData.newPassword) {
        updateData.currentPassword = profileData.currentPassword;
        updateData.password = profileData.newPassword;
      }

      await userAPI.updateUser(currentUser._id, updateData);
      toast.success('Profile updated successfully!');
      
      // If password was changed, clear auth credentials and force logout
      if (profileData.currentPassword && profileData.newPassword) {
        toast.success('Password changed! Please login with your new password.');
        
        // Clear all auth data
        localStorage.removeItem('authCredentials');
        localStorage.removeItem('user');
        
        // Force logout after a short delay
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
        
        return; // Don't clear password fields since we're logging out
      }
      
      // Clear password fields after successful update (only if not password change)
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Update current user data in context if needed
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
      
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (fetchLoading) {
    return (
      <div className="user-profile">
        <div className="loading-state">
          <Loader2 className="animate-spin" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <Toaster position="top-right" />
      
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="profile-header"
      >
        <div className="header-left">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="header-icon"
          >
            <User />
          </motion.div>
          <div>
            <h1>My Profile</h1>
            <p>Manage your personal information</p>
          </div>
        </div>

        <div className="header-right">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="logout-btn"
          >
            <LogOut />
            Logout
          </motion.button>
        </div>
      </motion.div>

      {/* Profile Form */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="profile-container"
      >
        <form onSubmit={handleSubmit} className="profile-form">
          {/* User Info Section */}
          <div className="form-section">
            <h2>
              <User size={20} />
              Personal Information
            </h2>
            
            <div className="form-group">
              <label htmlFor="name">
                <User size={16} />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="error-message"
                >
                  <AlertCircle size={14} />
                  {errors.name}
                </motion.div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                readOnly
                className="form-input readonly"
                placeholder="Your email address"
              />
              <small className="form-help">Email address cannot be changed</small>
            </div>
          </div>

          {/* Password Section */}
          <div className="form-section">
            <h2>
              <Lock size={20} />
              Change Password
            </h2>
            <p className="section-description">Leave empty if you don't want to change your password</p>
            
            <div className="form-group">
              <label htmlFor="currentPassword">
                <Lock size={16} />
                Current Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={profileData.currentPassword}
                  onChange={handleInputChange}
                  className={`form-input ${errors.currentPassword ? 'error' : ''}`}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="password-toggle"
                >
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.currentPassword && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="error-message"
                >
                  <AlertCircle size={14} />
                  {errors.currentPassword}
                </motion.div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">
                <Lock size={16} />
                New Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={profileData.newPassword}
                  onChange={handleInputChange}
                  className={`form-input ${errors.newPassword ? 'error' : ''}`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="password-toggle"
                >
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.newPassword && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="error-message"
                >
                  <AlertCircle size={14} />
                  {errors.newPassword}
                </motion.div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <Lock size={16} />
                Confirm New Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={profileData.confirmPassword}
                  onChange={handleInputChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="password-toggle"
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="error-message"
                >
                  <AlertCircle size={14} />
                  {errors.confirmPassword}
                </motion.div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UserProfile;
