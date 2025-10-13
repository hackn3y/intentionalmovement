const { v4: uuidv4 } = require('uuid');

/**
 * Middleware to add unique request ID to each request
 * This ID is used for tracking requests through logs and error handling
 */
function requestIdMiddleware(req, res, next) {
  // Generate a unique request ID
  const requestId = req.headers['x-request-id'] || uuidv4();

  // Attach to request object for use in controllers and other middleware
  req.requestId = requestId;

  // Add to response headers for client tracking
  res.setHeader('X-Request-ID', requestId);

  // Continue to next middleware
  next();
}

module.exports = requestIdMiddleware;
