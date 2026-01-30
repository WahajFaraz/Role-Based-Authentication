import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Shield,
  Loader2,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import './EnhancedLogin.css';

/**
 * Enhanced Login Component with Comprehensive Error Handling
 * Prevents page reload on authentication errors and provides clear feedback
 * Features: Advanced styling, icons, toast notifications, micro-interactions
 */
const EnhancedLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [floatingElements, setFloatingElements] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Generate random floating elements
    const elements = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 30 + 20,
      duration: Math.random() * 20 + 10
    }));
    setFloatingElements(elements);
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authCredentials');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      navigate('/dashboard');
      return;
    }

    // Check for URL parameters (from registration success)
    const params = new URLSearchParams(location.search);
    if (params.get('registered') === 'true') {
      toast.success('Registration successful! Please login to continue.');
    }
  }, [navigate, location.search]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authAPI.login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });

      // Store credentials in localStorage
      localStorage.setItem('authCredentials', JSON.stringify(response.token));
      localStorage.setItem('user', JSON.stringify(response.user));

      toast.success('Login successful! Redirecting...', { id: 'login' });
      setLoginSuccess(true);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage, { id: 'login' });
      setLoginSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="enhanced-login-container">
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

      <div className="login-card">
        {/* Header with animated icon */}
        <div className="login-header">
          <div className="header-icon">
            <Shield />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
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
              onChange={handleInputChange}
              onFocus={() => handleFocus('email')}
              onBlur={handleBlur}
              className={`form-input ${errors.email ? 'error' : ''} ${focusedField === 'email' ? 'focused' : ''}`}
              disabled={isSubmitting}
              autoComplete="email"
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
                onChange={handleInputChange}
                onFocus={() => handleFocus('password')}
                onBlur={handleBlur}
                className={`form-input ${errors.password ? 'error' : ''} ${focusedField === 'password' ? 'focused' : ''}`}
                disabled={isSubmitting}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <div className="error-message">
                <AlertCircle className="error-icon" />
                {errors.password}
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
                <Loader2 className="animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <Zap />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="register-link"
            >
              Create Account
              <ArrowRight size={16} />
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLogin;
