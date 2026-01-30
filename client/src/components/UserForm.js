import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Shield, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import './UserForm.css';

/**
 * UserForm Component with Role-Based Access Control
 * Admin can edit all profiles, Normal users can only edit their own profile
 */
const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout, user: currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  /**
   * Check if user has permission to edit this profile
   */
  const checkEditPermission = useCallback((targetUserId) => {
    if (!currentUser) {
      return false;
    }

    // Admin can edit all profiles
    if (currentUser.role === 'admin') {
      return true;
    }

    // Normal users can only edit their own profile
    if (currentUser._id === targetUserId) {
      return true;
    }

    return false;
  }, [currentUser]);

  /**
   * Fetch user data for editing with permission check
   */
  const fetchUser = useCallback(async () => {
    try {
      setFetchLoading(true);
      
      // Check permission before fetching user data
      if (!checkEditPermission(id)) {
        setAccessDenied(true);
        setSubmitError('Access denied: You can only edit your own profile');
        toast.error('Access denied: You can only edit your own profile');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
        return;
      }

      const user = await userAPI.getUserById(id);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role || 'user'
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch user';
      setSubmitError(errorMessage);
      
      if (error.response?.status === 401) {
        logout();
      } else if (error.response?.status === 403) {
        setAccessDenied(true);
        toast.error('Access denied: You do not have permission to edit this profile');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else if (error.response?.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setFetchLoading(false);
    }
  }, [id, logout, navigate, checkEditPermission]);

  /**
   * Initialize component
   */
  useEffect(() => {
    console.log('UserForm mounted with ID:', id);
    if (id) {
      setIsEditing(true);
      fetchUser();
    }
  }, [id, fetchUser]);

  /**
   * Handle input changes
   * @param {Object} e - Event object
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError(null);
    }
  };

  /**
   * Validate form data
   * @returns {boolean} Validation result
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!isEditing) {
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required for new users';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else if (formData.password.trim() && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission with role-based permissions
   * @param {Object} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Double-check permission before submission
    if (isEditing && !checkEditPermission(id)) {
      setAccessDenied(true);
      setSubmitError('Access denied: You can only edit your own profile');
      toast.error('Access denied: You can only edit your own profile');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      return;
    }

    setLoading(true);

    try {
      // Debug logging
      console.log('Form submission started');
      console.log('Is editing:', isEditing);
      console.log('User ID from params:', id);
      console.log('Current user:', currentUser);
      
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim()
      };

      // Always include password for new users, only include if provided for editing
      if (formData.password.trim()) {
        submitData.password = formData.password.trim();
      }

      // Only admins can change roles
      if (currentUser?.role === 'admin' && formData.role) {
        submitData.role = formData.role;
      }

      console.log('Final submit data:', submitData);

      if (isEditing) {
        // Debug logging for update
        console.log('Updating user with ID:', id);
        console.log('Submit data:', submitData);

        if (!id) {
          throw new Error('User ID is required for updating');
        }

        await userAPI.updateUser(id, submitData);
        toast.success('User updated successfully!');
      } else {
        // Create new user - password is required for new users
        if (!formData.password.trim()) {
          setSubmitError('Password is required for new users');
          setLoading(false);
          return;
        }
        
        console.log('Creating new user with data:', submitData);
        await userAPI.createUser(submitData);
        toast.success('User created successfully!');
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.message || 
                         (isEditing ? 'Failed to update user' : 'Failed to create user');
      setSubmitError(errorMessage);
      
      if (error.response?.status === 401) {
        logout();
      } else if (error.response?.status === 403) {
        setAccessDenied(true);
        toast.error('Access denied: You do not have permission to perform this action');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle cancel button
   */
  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (fetchLoading) {
    return (
      <div className="user-form-container">
        <div className="loading">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="user-form-container">
      <div className="user-form-card">
        {/* Form Header */}
        <div className="user-form-header">
          <h2>{isEditing ? 'Edit User' : 'Create New User'}</h2>
          <p>{isEditing ? 'Update user information and permissions' : 'Add a new user to the system'}</p>
        </div>

        {/* Navigation */}
        <div className="form-navigation">
          <button className="back-btn" onClick={handleCancel}>
            ← Back to Users
          </button>
        </div>

        {submitError && (
          <div className="error-message">
            <AlertCircle size={16} />
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="user-form">
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">
              <User size={16} className="label-icon" />
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter user's full name"
              disabled={loading}
            />
            {errors.name && (
              <span className="error-text">
                <AlertCircle size={14} />
                {errors.name}
              </span>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">
              <Mail size={16} className="label-icon" />
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter email address"
              disabled={loading}
            />
            {errors.email && (
              <span className="error-text">
                <AlertCircle size={14} />
                {errors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">
              <Lock size={16} className="label-icon" />
              {isEditing ? 'New Password (leave blank to keep current)' : 'Password'} 
              {!isEditing && <span className="required">*</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder={isEditing ? 'Enter new password' : 'Enter password'}
              disabled={loading}
            />
            {errors.password && (
              <span className="error-text">
                <AlertCircle size={14} />
                {errors.password}
              </span>
            )}
            {isEditing && (
              <small className="form-hint">
                Leave blank to keep the current password
              </small>
            )}
          </div>

          {/* Role Field - Only for Admins */}
          {currentUser?.role === 'admin' && (
            <div className="form-group">
              <label htmlFor="role">
                <Shield size={16} className="label-icon" />
                User Role <span className="required">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
                className="form-select"
              >
                <option value="user">Normal User</option>
                <option value="admin">Administrator</option>
              </select>
              <small className="form-hint">
                Select the user's role and permissions
              </small>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || accessDenied}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Saving...
                </>
              ) : (
                <>
                  {isEditing ? 'Update User' : 'Create User'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
};

export default UserForm;
