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
 * Features: Advanced animations, icons, toast notifications, micro-interactions
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

  /**
   * Handle input changes with validation
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Validate form with enhanced feedback
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      toast.error('Please enter your email', { id: 'validation' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      toast.error('Please enter a valid email address', { id: 'validation' });
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      toast.error('Please enter your password', { id: 'validation' });
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      toast.error('Password must be at least 6 characters', { id: 'validation' });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission with loading states
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    toast.loading('Signing in...', { id: 'login' });

    try {
      console.log('Attempting login with:', formData.email);
      
      // Use AuthContext login method
      const result = await authAPI.login(formData.email, formData.password);
      console.log('Login result:', result);
      
      if (result) {
        toast.success('Welcome back! 🎉', { id: 'login' });
        console.log('Login successful, redirecting to dashboard...');
        
        // Force redirect using window.location
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        console.error('Login failed: No result returned');
        toast.error('Login failed - Please check your credentials', { id: 'login' });
        setLoginSuccess(false);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error types with specific messages
      let errorMessage = 'Login failed - Please try again';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const serverMessage = error.response.data?.message;
        
        switch (status) {
          case 400:
            errorMessage = serverMessage || 'Invalid email or password format';
            break;
          case 401:
            errorMessage = 'Invalid email or password - Please check your credentials';
            break;
          case 403:
            errorMessage = 'Access denied - You do not have permission to login';
            break;
          case 404:
            errorMessage = 'User not found - Please check your email';
            break;
          case 429:
            errorMessage = 'Too many login attempts - Please try again later';
            break;
          case 500:
            errorMessage = 'Server error - Please try again later';
            break;
          default:
            errorMessage = serverMessage || 'Login failed - Please try again';
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error - Please check your internet connection';
      } else {
        // Other error
        errorMessage = error.message || 'Login failed - Please try again';
      }
      
      toast.error(errorMessage, { id: 'login' });
      setLoginSuccess(false);
      
      // Clear password field for security
      setFormData(prev => ({
        ...prev,
        password: ''
      }));
      
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle register redirect
   */
  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="enhanced-login-container"
    >
      <Toaster position="top-center" />
      
      {/* Floating background elements */}
      {floatingElements.map((element) => (
        <motion.div
          key={element.id}
          className="floating-element"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: `${element.size}px`,
            height: `${element.size}px`
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="login-card"
      >
        {/* Header with animated icon */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="login-header"
        >
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
            <Shield />
          </motion.div>
          <h1>Welcome Back</h1>
          <p>Sign in to access your account</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Field */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="form-group"
          >
            <label className="form-label">
              <Mail className="label-icon" />
              Email Address
              <span className="required">*</span>
            </label>
            <motion.div
              animate={{
                scale: focusedField === 'email' ? 1.02 : 1
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email address"
                disabled={isSubmitting}
              />
            </motion.div>
            <AnimatePresence>
              {errors.email && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="error-message"
                >
                  <AlertCircle className="error-icon" />
                  {errors.email}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="form-group"
          >
            <label className="form-label">
              <Lock className="label-icon" />
              Password
              <span className="required">*</span>
            </label>
            <motion.div
              animate={{
                scale: focusedField === 'password' ? 1.02 : 1
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className="password-input-wrapper"
            >
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </motion.div>
            <AnimatePresence>
              {errors.password && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="error-message"
                >
                  <AlertCircle className="error-icon" />
                  {errors.password}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
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
                <ArrowRight />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="login-footer"
        >
          <p>
            Don't have an account?{' '}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRegisterRedirect}
              className="register-link"
            >
              Sign up here
            </motion.button>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedLogin;
