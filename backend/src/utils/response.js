/**
 * Standardized API Response Utility
 * Provides consistent response formatting across all endpoints
 */

/**
 * Success response helper
 * @param {object} res - Express response object
 * @param {*} data - Data to return
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    error: null,
    timestamp: new Date().toISOString()
  });
};

/**
 * Error response helper
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} error - Additional error details (optional)
 */
const error = (res, message = 'An error occurred', statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    error: error || message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Created response helper (201)
 * @param {object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 */
const created = (res, data, message = 'Resource created successfully') => {
  return success(res, data, message, 201);
};

/**
 * No content response helper (204)
 * @param {object} res - Express response object
 */
const noContent = (res) => {
  return res.status(204).send();
};

/**
 * Bad request response helper (400)
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {*} validationErrors - Validation errors (optional)
 */
const badRequest = (res, message = 'Bad request', validationErrors = null) => {
  return error(res, message, 400, validationErrors);
};

/**
 * Unauthorized response helper (401)
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const unauthorized = (res, message = 'Unauthorized') => {
  return error(res, message, 401);
};

/**
 * Forbidden response helper (403)
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const forbidden = (res, message = 'Forbidden') => {
  return error(res, message, 403);
};

/**
 * Not found response helper (404)
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const notFound = (res, message = 'Resource not found') => {
  return error(res, message, 404);
};

/**
 * Conflict response helper (409)
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const conflict = (res, message = 'Conflict') => {
  return error(res, message, 409);
};

/**
 * Internal server error response helper (500)
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {*} errorDetails - Error details
 */
const serverError = (res, message = 'Internal server error', errorDetails = null) => {
  return error(res, message, 500, errorDetails);
};

/**
 * Paginated response helper
 * @param {object} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @param {string} message - Success message
 */
const paginated = (res, data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    data,
    message,
    error: null,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  success,
  error,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
  paginated
};
