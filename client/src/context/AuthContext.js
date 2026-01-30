import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

/**
 * Authentication Context
 * Manages user authentication state throughout the application
 */

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING'
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

/**
 * AuthProvider component
 * Provides authentication state and actions to child components
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Initialize authentication state on app load
   * Check if user is already logged in from localStorage
   */
  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = authAPI.getCurrentUser();
        const isAuthenticated = authAPI.isAuthenticated();

        if (isAuthenticated && currentUser) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: currentUser
          });
        } else {
          // Clear any invalid stored data
          authAPI.logout();
          dispatch({
            type: AUTH_ACTIONS.SET_LOADING,
            payload: false
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authAPI.logout();
        dispatch({
          type: AUTH_ACTIONS.SET_LOADING,
          payload: false
        });
      }
    };

    initAuth();
  }, []);

  /**
   * Login function
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Login result
   */
  const login = async (email, password) => {
    console.log('AuthContext: Starting login process');
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const user = await authAPI.login(email, password);
      console.log('AuthContext: Login successful, user:', user);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: user
      });
      console.log('AuthContext: State updated successfully');
      
      return { success: true, user };
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      
      // Don't clear auth state on login failure - let user try again
      // Just return the error without changing the auth state
      const errorMessage = error.response?.data?.message || 'Login failed';
      
      // Only dispatch failure if we want to show error in state
      // For now, let the component handle the error display
      // dispatch({
      //   type: AUTH_ACTIONS.LOGIN_FAILURE,
      //   payload: errorMessage
      // });
      
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    authAPI.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  /**
   * Clear error function
   */
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  /**
   * Update user data in state
   * @param {Object} userData - Updated user data
   */
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: userData
    });
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    ...state,
    login,
    logout,
    clearError,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
