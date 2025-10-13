const { AuditLog } = require('../models');
const logger = require('../utils/logger');

/**
 * Creates an audit log entry
 * @param {Object} params - Audit log parameters
 * @param {string} params.userId - ID of user who performed the action
 * @param {string} params.action - Action performed (e.g., 'user.delete', 'post.hide')
 * @param {string} params.resourceType - Type of resource (user, post, program, etc.)
 * @param {string} params.resourceId - ID of the affected resource
 * @param {Object} params.changes - Before/after values
 * @param {Object} params.metadata - Additional context (IP, user agent, etc.)
 * @param {string} params.requestId - Request ID for correlation
 * @param {string} params.severity - Severity level (low, medium, high, critical)
 * @param {string} params.status - Status of action (success, failure, partial)
 * @param {string} params.errorMessage - Error message if action failed
 */
async function createAuditLog(params) {
  try {
    await AuditLog.create({
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId || null,
      changes: params.changes || null,
      metadata: params.metadata || null,
      requestId: params.requestId || null,
      severity: params.severity || 'medium',
      status: params.status || 'success',
      errorMessage: params.errorMessage || null
    });

    logger.info('Audit log created', {
      action: params.action,
      userId: params.userId,
      resourceType: params.resourceType,
      resourceId: params.resourceId
    });
  } catch (error) {
    // Don't throw error - audit logging should never break the main flow
    logger.error('Failed to create audit log:', {
      error: error.message,
      params
    });
  }
}

/**
 * Express middleware to automatically log admin actions
 * Only logs actions from users with admin role
 */
function auditAdminActions(options = {}) {
  const {
    action,
    resourceType,
    severity = 'medium',
    extractResourceId = (req) => req.params.id,
    extractChanges = null
  } = options;

  return async (req, res, next) => {
    // Skip if not an admin
    if (!req.user || req.user.role !== 'admin') {
      return next();
    }

    // Capture the original res.json to log after successful response
    const originalJson = res.json.bind(res);

    res.json = async function(data) {
      // Only log on successful responses (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const resourceId = extractResourceId(req);
        const changes = extractChanges ? extractChanges(req, data) : null;

        await createAuditLog({
          userId: req.user.id,
          action: action || `${resourceType}.${req.method.toLowerCase()}`,
          resourceType,
          resourceId,
          changes,
          metadata: {
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            method: req.method,
            url: req.url
          },
          requestId: req.requestId,
          severity,
          status: 'success'
        });
      }

      return originalJson(data);
    };

    next();
  };
}

module.exports = {
  createAuditLog,
  auditAdminActions
};
