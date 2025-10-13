const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Creates a per-user rate limiter middleware
 * Uses user ID when authenticated, otherwise falls back to IP address
 *
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.message - Error message to return when limit is exceeded
 * @returns {Function} Express middleware
 */
function createUserRateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    max = 100, // 100 requests per window default
    message = 'Too many requests, please try again later.'
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers

    // Key generator: use user ID if authenticated, otherwise use IP
    keyGenerator: (req) => {
      if (req.user && req.user.id) {
        return `user:${req.user.id}`;
      }
      return `ip:${req.ip || req.connection.remoteAddress}`;
    },

    // Handler for when limit is exceeded
    handler: (req, res) => {
      const identifier = req.user?.id ? `user ${req.user.id}` : `IP ${req.ip}`;

      logger.warn('Rate limit exceeded', {
        requestId: req.requestId,
        identifier,
        url: req.url,
        method: req.method
      });

      res.status(429).json({
        error: message,
        requestId: req.requestId,
        retryAfter: res.getHeader('Retry-After')
      });
    },

    // Skip rate limiting for certain conditions
    skip: (req) => {
      // Skip rate limiting for admins
      if (req.user && req.user.role === 'admin') {
        return true;
      }
      return false;
    }
  });
}

/**
 * Predefined rate limiters for common use cases
 */

// Strict rate limiter for authentication endpoints (to prevent brute force)
const authRateLimit = createUserRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: 'Too many authentication attempts, please try again later.'
});

// Standard rate limiter for API endpoints
const apiRateLimit = createUserRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  message: 'Too many requests, please slow down.'
});

// Lenient rate limiter for read-only endpoints
const readRateLimit = createUserRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again shortly.'
});

// Strict rate limiter for create/update endpoints
const writeRateLimit = createUserRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many write operations, please slow down.'
});

module.exports = {
  createUserRateLimit,
  authRateLimit,
  apiRateLimit,
  readRateLimit,
  writeRateLimit
};
