const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'ID of the user who performed the action'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Type of action performed (e.g., user.delete, post.hide, program.update)'
    },
    resourceType: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Type of resource affected (user, post, program, etc.)'
    },
    resourceId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID of the affected resource'
    },
    changes: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON object containing before/after values'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional context (IP address, user agent, etc.)'
    },
    requestId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Request ID for correlation with application logs'
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium',
      comment: 'Severity level of the action'
    },
    status: {
      type: DataTypes.ENUM('success', 'failure', 'partial'),
      defaultValue: 'success',
      comment: 'Status of the action'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Error message if action failed'
    }
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false, // Audit logs should never be updated
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['action']
      },
      {
        fields: ['resourceType', 'resourceId']
      },
      {
        fields: ['createdAt']
      },
      {
        fields: ['severity']
      }
    ]
  });

  return AuditLog;
};
