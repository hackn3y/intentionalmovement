require('dotenv').config();
const { sequelize } = require('../models');
const logger = require('../utils/logger');

const runMigrations = async () => {
  try {
    logger.info('Starting database migrations...');
    logger.info('Database:', process.env.DATABASE_URL ? 'PostgreSQL (Production)' : 'SQLite (Development)');

    // Authenticate connection
    await sequelize.authenticate();
    logger.info('Database connection established.');

    // Log all models that will be synced
    const models = Object.keys(sequelize.models);
    logger.info(`Syncing ${models.length} models: ${models.join(', ')}`);

    // Sync all models with alter:true to update schema without dropping data
    // This is safer than force:true but will add/modify columns
    await sequelize.sync({ alter: true });
    logger.info('Database migrations completed successfully.');

    // Log tables that were created/updated
    const [results] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    logger.info('Tables in database:', results.map(r => r.table_name).join(', '));

    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    console.error('Full error:', error);
    process.exit(1);
  }
};

runMigrations();
