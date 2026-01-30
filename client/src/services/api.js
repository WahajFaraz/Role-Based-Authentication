import axios from 'axios';

// Create axios instance with base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add Basic Authentication headers
 */
api.interceptors.request.use(
  (config) => {
    // Get credentials from localStorage
    const credentials = localStorage.getItem('authCredentials');
    if (credentials) {
      config.headers.Authorization = `Basic ${credentials}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle common errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we're not on the login page (to prevent reload loop)
      if (window.location.pathname !== '/login') {
        // Clear credentials on unauthorized access
        localStorage.removeItem('authCredentials');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API calls
 */
export const authAPI = {
  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} User profile data
   */
  login: async (email, password) => {
    try {
      console.log('API: Starting login process for:', email);
      
      const credentials = btoa(`${email}:${password}`);
      localStorage.setItem('authCredentials', credentials);
      console.log('API: Credentials stored in localStorage');
      
      const response = await api.get('/users/profile');
      console.log('API: Profile response:', response.data);
      
      const userData = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('API: User data stored in localStorage');
      
      return userData;
    } catch (error) {
      console.error('API: Login error:', error);
      // Clear credentials on error but don't redirect - let the component handle it
      localStorage.removeItem('authCredentials');
      localStorage.removeItem('user');
      
      // Don't throw the error to prevent page reload
      // Instead, return null or throw a controlled error
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('authCredentials');
    localStorage.removeItem('user');
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} User data or null
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('authCredentials');
  }
};

/**
 * User API calls
 */
export const userAPI = {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise} Created user data
   */
  createUser: async (userData) => {
    try {
      console.log('API: Creating user with data:', userData);
      const response = await api.post('/users', userData);
      console.log('API: User created successfully:', response.data);
      return response.data.data.user;
    } catch (error) {
      console.error('API: Error creating user:', error.response?.data || error);
      throw error;
    }
  },

  /**
   * Get all users with pagination
   * @param {Object} params - Query parameters
   * @returns {Promise} Users list with pagination
   */
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data.data;
  },

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise} User data
   */
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data.data.user;
  },

  /**
   * Update user by ID
   * @param {string} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} Updated user data
   */
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data.data.user;
  },

  /**
   * Get current user profile
   * @returns {Promise} Current user profile
   */
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data.data;
  },

  /**
   * Delete user by ID
   * @param {string} id - User ID
   * @returns {Promise} Deletion confirmation
   */
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

/**
 * Health check API
 */
export const healthAPI = {
  /**
   * Check API health status
   * @returns {Promise} Health status
   */
  checkHealth: async () => {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.data;
  }
};

export default api;
