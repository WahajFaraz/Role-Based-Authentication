import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import './Register.css';

/**
 * Register Component
 * Handles user registration with form validation
 */
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

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

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (formData.password.length > 128) {
      newErrors.password = 'Password cannot exceed 128 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * @param {Object} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      };

      await userAPI.createUser(userData);
      
      setSuccess(true);
      setSubmitError(null);
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setSubmitError(errorMessage);
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle login redirect
   */
  const handleLoginRedirect = () => {
    navigate('/login');
  };

  // Show success state
  if (success) {
    return (
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1>Registration Successful!</h1>
            <p>Your account has been created successfully.</p>
          </div>
          
          <div className="success-content">
            <div className="success-icon">✓</div>
            <h2>Welcome to User Management System!</h2>
            <p>You can now log in with your credentials.</p>
            
            <button 
              className="login-redirect-btn"
              onClick={handleLoginRedirect}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join the User Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Submit Error Display */}
          {submitError && (
            <div className="error-message submit-error">
              {submitError}
            </div>
          )}

          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter your full name"
              disabled={isSubmitting}
              autoComplete="name"
            />
            {errors.name && (
              <span className="error-text">{errors.name}</span>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email address"
              disabled={isSubmitting}
              autoComplete="email"
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              disabled={isSubmitting}
              autoComplete="new-password"
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
            <small className="form-hint">
              Password must contain at least 6 characters, including uppercase, lowercase, and numbers
            </small>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password <span className="required">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirm your password"
              disabled={isSubmitting}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <button 
              className="login-link"
              onClick={handleLoginRedirect}
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
