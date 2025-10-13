require('dotenv').config();
const { sequelize } = require('../models');
const logger = require('../utils/logger');

const runMigrations = async () => {
  try {
    logger.info('Starting database migrations...');

    // Authenticate connection
    await sequelize.authenticate();
    logger.info('Database connection established.');

    // Sync all models - use force:false to prevent data loss
    await sequelize.sync({ force: false });
    logger.info('Database migrations completed successfully.');

    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
