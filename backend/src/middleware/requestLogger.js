const logger = require('../utils/logger');

/**
 * Request/Response logging middleware
 * Logs incoming requests and outgoing responses with timing information
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log incoming request
  logger.info('Incoming request', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
  });

  // Capture the original res.json to log response
  const originalJson = res.json.bind(res);

  res.json = function(data) {
    const duration = Date.now() - startTime;

    // Log response
    logger.info('Outgoing response', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
    });

    return originalJson(data);
  };

  // Capture response finish event for non-JSON responses
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Only log if json() wasn't called (to avoid duplicate logs)
    if (res.json === originalJson) {
      logger.info('Response completed', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userId: req.user?.id,
      });
    }
  });

  next();
};

module.exports = requestLogger;
