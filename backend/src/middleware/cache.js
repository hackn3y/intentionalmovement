/**
 * Simple in-memory caching middleware for API responses
 * Caches GET requests for a specified duration
 */

const cache = new Map();
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Cache middleware factory
 * @param {number} duration - Cache duration in milliseconds
 * @returns {Function} Express middleware function
 */
function cacheMiddleware(duration = DEFAULT_CACHE_DURATION) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for authenticated user-specific endpoints
    const skipPaths = ['/api/users/me', '/api/messages', '/api/notifications'];
    if (skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse && cachedResponse.expiresAt > Date.now()) {
      // Set cache headers
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', `public, max-age=${Math.floor(duration / 1000)}`);
      return res.json(cachedResponse.data);
    }

    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to cache the response
    res.json = function(data) {
      // Cache the response
      cache.set(key, {
        data,
        expiresAt: Date.now() + duration
      });

      // Set cache headers
      res.set('X-Cache', 'MISS');
      res.set('Cache-Control', `public, max-age=${Math.floor(duration / 1000)}`);

      return originalJson(data);
    };

    next();
  };
}

/**
 * Clear all cache entries
 */
function clearCache() {
  cache.clear();
}

/**
 * Clear cache entries matching a pattern
 * @param {string} pattern - Pattern to match against cache keys
 */
function clearCachePattern(pattern) {
  const regex = new RegExp(pattern);
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

/**
 * Cleanup expired cache entries
 * Run periodically to prevent memory leaks
 */
function cleanupExpiredCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (value.expiresAt <= now) {
      cache.delete(key);
    }
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupExpiredCache, 10 * 60 * 1000);

module.exports = {
  cacheMiddleware,
  clearCache,
  clearCachePattern,
  cleanupExpiredCache
};
