/**
 * Global Error Handler Middleware
 * Catches and processes all errors in a centralized manner
 * Provides consistent error response format across the application
 */

/**
 * Custom Error Classes for better error handling
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

class DuplicateError extends AppError {
  constructor(field) {
    super(`Duplicate ${field} found`, 400);
  }
}

/**
 * Mongoose Duplicate Key Error Handler
 * Handles MongoDB duplicate key errors (e.g., duplicate email)
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} '${value}' already exists. Please use a different ${field}.`;
  return new DuplicateError(field);
};

/**
 * Mongoose Validation Error Handler
 * Handles Mongoose schema validation errors
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(val => val.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new ValidationError(message);
};

/**
 * Mongoose Cast Error Handler
 * Handles invalid ObjectID format errors
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new ValidationError(message);
};

/**
 * Development Error Response
 * Sends detailed error information in development environment
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

/**
 * Production Error Response
 * Sends sanitized error information in production environment
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        type: err.constructor.name,
        statusCode: err.statusCode
      }
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      error: {
        type: 'InternalServerError',
        statusCode: 500
      }
    });
  }
};

/**
 * Global Error Handler Middleware
 * Processes all errors and sends appropriate responses
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error for debugging
  console.error(`Error ${err.statusCode}: ${err.message}`);
  console.error(err.stack);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific Mongoose errors
    if (err.code === 11000) error = handleDuplicateKeyError(error);
    if (err.name === 'ValidationError') error = handleValidationError(error);
    if (err.name === 'CastError') error = handleCastError(error);

    sendErrorProd(error, res);
  }
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to automatically catch and forward errors
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  DuplicateError,
  globalErrorHandler,
  catchAsync
};
