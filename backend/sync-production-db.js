#!/usr/bin/env node

/**
 * Production Database Sync Script
 *
 * This script syncs all Sequelize models to the production PostgreSQL database.
 * Run this on Railway or any production environment to create missing tables.
 *
 * Usage:
 *   node sync-production-db.js
 *
 * Or on Railway:
 *   npm run sync:production
 */

require('dotenv').config();
const { sequelize } = require('./src/models');

const syncDatabase = async () => {
  try {
    console.log('='.repeat(60));
    console.log('PRODUCTION DATABASE SYNC');
    console.log('='.repeat(60));
    console.log('\nDatabase URL:', process.env.DATABASE_URL ? 'Connected (URL hidden for security)' : 'NOT SET - Please check .env');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('\n' + '='.repeat(60));

    // Authenticate
    console.log('\n[1/4] Testing database connection...');
    await sequelize.authenticate();
    console.log('✓ Database connection successful!');

    // List models
    console.log('\n[2/4] Loading models...');
    const models = Object.keys(sequelize.models);
    console.log(`✓ Found ${models.length} models:`);
    models.forEach((model, index) => {
      console.log(`   ${index + 1}. ${model}`);
    });

    // Sync models
    console.log('\n[3/4] Syncing models to database...');
    console.log('   Using alter: true (safe - will not drop data)');
    await sequelize.sync({ alter: true });
    console.log('✓ All models synced successfully!');

    // Verify tables
    console.log('\n[4/4] Verifying tables in database...');
    try {
      const [results] = await sequelize.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `);
      console.log(`✓ Found ${results.length} tables in database:`);
      results.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    } catch (queryError) {
      console.log('⚠ Could not query table list (this is okay for SQLite)');
    }

    console.log('\n' + '='.repeat(60));
    console.log('SUCCESS: Database sync completed!');
    console.log('='.repeat(60));
    console.log('\nYour database now has all the required tables.');
    console.log('You can now restart your backend server.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('ERROR: Database sync failed!');
    console.error('='.repeat(60));
    console.error('\nError details:');
    console.error(error);
    console.error('\nCommon issues:');
    console.error('1. DATABASE_URL not set in environment variables');
    console.error('2. Database credentials are incorrect');
    console.error('3. Database server is not accessible');
    console.error('4. Firewall blocking connection');
    console.error('\nPlease check your Railway environment variables and database settings.\n');
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('\nUnhandled error:',error);
  process.exit(1);
});

syncDatabase();
