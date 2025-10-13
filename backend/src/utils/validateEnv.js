const logger = require('./logger');

/**
 * Validates required environment variables on startup
 * Exits the process if critical variables are missing
 */
function validateEnv() {
  const errors = [];
  const warnings = [];

  // Critical environment variables (required for app to function)
  const criticalVars = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET
  };

  // Database variables (at least one method must be configured)
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const hasIndividualDbVars = !!(
    process.env.DB_HOST &&
    process.env.DB_NAME &&
    process.env.DB_USER
  );

  if (!hasDatabaseUrl && !hasIndividualDbVars) {
    errors.push('Database configuration missing. Provide either DATABASE_URL or individual DB_* variables.');
  }

  // Check critical variables
  Object.entries(criticalVars).forEach(([key, value]) => {
    if (!value) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters long for security');
  }

  // Important but optional variables (features may not work without them)
  const optionalVars = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    APP_URL: process.env.APP_URL
  };

  Object.entries(optionalVars).forEach(([key, value]) => {
    if (!value) {
      warnings.push(`Optional environment variable not set: ${key}`);
    }
  });

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET === 'your-secret-key-here' ||
        process.env.JWT_SECRET === 'default-secret') {
      errors.push('JWT_SECRET must be changed from default value in production');
    }

    if (!process.env.DATABASE_URL && process.env.DB_DIALECT === 'sqlite') {
      warnings.push('SQLite is not recommended for production. Consider using PostgreSQL.');
    }

    if (!process.env.APP_URL) {
      warnings.push('APP_URL should be set in production for proper link generation');
    }
  }

  // Log results
  if (errors.length > 0) {
    logger.error('Environment validation failed:');
    errors.forEach(error => logger.error(`  ❌ ${error}`));

    if (warnings.length > 0) {
      logger.warn('Warnings:');
      warnings.forEach(warning => logger.warn(`  ⚠️  ${warning}`));
    }

    logger.error('Server cannot start with missing required environment variables');
    process.exit(1);
  }

  if (warnings.length > 0) {
    logger.warn('Environment validation warnings:');
    warnings.forEach(warning => logger.warn(`  ⚠️  ${warning}`));
  }

  logger.info('✓ Environment validation passed');

  // Log configuration summary
  logger.info('Configuration summary:');
  logger.info(`  Environment: ${process.env.NODE_ENV}`);
  logger.info(`  Port: ${process.env.PORT}`);
  logger.info(`  Database: ${hasDatabaseUrl ? 'DATABASE_URL' : 'Individual DB vars'}`);
  logger.info(`  Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}`);
  logger.info(`  CORS Origin: ${process.env.CORS_ORIGIN || 'Default'}`);
}

module.exports = validateEnv;
