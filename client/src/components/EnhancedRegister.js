import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield,
  CheckCircle,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import './EnhancedLogin.css';

/**
 * Enhanced Register Component with Next-Level UI
 * Features: Advanced styling, icons, toast notifications, micro-interactions
 */
const EnhancedRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [success, setSuccess] = useState(false);
  const [floatingElements, setFloatingElements] = useState([]);

  const navigate = useNavigate();

  // Generate random floating elements for background
  useEffect(() => {
    const elements = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 40 + 20,
      duration: Math.random() * 3 + 2
    }));
    setFloatingElements(elements);
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength <= 2) return '#ef4444';
    if (strength <= 3) return '#f59e0b';
    if (strength <= 4) return '#10b981';
    return '#22c55e';
  };

  const getPasswordStrengthText = () => {
    const strength = getPasswordStrength();
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await userAPI.createUser({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: 'user'
      });

      toast.success('Account created successfully!', { id: 'register' });
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setPasswordStrength(0);
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage, { id: 'register' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  return (
    <div className="enhanced-register-container">
      <Toaster position="top-right" />
      
      {/* Floating background elements */}
      {floatingElements.map((element) => (
        <div
          key={element.id}
          className="floating-element"
          style={{
            position: 'absolute',
            width: `${element.size}px`,
            height: `${element.size}px`,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            top: `${element.y}%`,
            left: `${element.x}%`,
            animation: `float ${element.duration}s ease-in-out infinite`
          }}
        />
      ))}

      <div className="register-card">
        {/* Header with animated icon */}
        <div className="register-header">
          <div className="header-icon">
            <Sparkles />
          </div>
          <h1>Create Account</h1>
          <p>Join us and start your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Name Field */}
          <div className="form-group">
            <label>
              <User size={16} className="label-icon" />
              Full Name
              <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors({ ...errors, name: '' });
              }}
              onFocus={() => handleFocus('name')}
              onBlur={handleBlur}
              className={`form-input ${errors.name ? 'error' : ''} ${focusedField === 'name' ? 'focused' : ''}`}
              disabled={isSubmitting}
            />
            {errors.name && (
              <div className="error-message">
                <AlertCircle className="error-icon" />
                {errors.name}
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label>
              <Mail size={16} className="label-icon" />
              Email Address
              <span className="required">*</span>
            </label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setErrors({ ...errors, email: '' });
              }}
              onFocus={() => handleFocus('email')}
              onBlur={handleBlur}
              className={`form-input ${errors.email ? 'error' : ''} ${focusedField === 'email' ? 'focused' : ''}`}
              disabled={isSubmitting}
            />
            {errors.email && (
              <div className="error-message">
                <AlertCircle className="error-icon" />
                {errors.email}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label>
              <Lock size={16} className="label-icon" />
              Password
              <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setErrors({ ...errors, password: '' });
                  setPasswordStrength(getPasswordStrength());
                }}
                onFocus={() => handleFocus('password')}
                onBlur={handleBlur}
                className={`form-input ${errors.password ? 'error' : ''} ${focusedField === 'password' ? 'focused' : ''}`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{ backgroundColor: getPasswordStrengthColor(), width: `${(getPasswordStrength() / 5) * 100}%` }}
                  />
                </div>
                <span className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                  {getPasswordStrengthText()}
                </span>
              </div>
            )}
            
            {errors.password && (
              <div className="error-message">
                <AlertCircle className="error-icon" />
                {errors.password}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label>
              <Lock size={16} className="label-icon" />
              Confirm Password
              <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  setErrors({ ...errors, confirmPassword: '' });
                }}
                onFocus={() => handleFocus('confirmPassword')}
                onBlur={handleBlur}
                className={`form-input ${errors.confirmPassword ? 'error' : ''} ${focusedField === 'confirmPassword' ? 'focused' : ''}`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="error-message">
                <div className="error-icon">
                  <AlertCircle />
                </div>
                {errors.confirmPassword}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-btn"
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner"></div>
                Creating Account...
              </>
            ) : (
              <>
                <CheckCircle />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <button
              onClick={handleLoginRedirect}
              className="login-link"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRegister;
