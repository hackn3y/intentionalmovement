#!/usr/bin/env node

/**
 * FORCE SYNC DATABASE - AUTOMATIC (NO CONFIRMATION)
 *
 * This script will DROP ALL TABLES and recreate them from scratch.
 * Only use this if your database is in a bad state or completely empty.
 *
 * ⚠️ WARNING: THIS WILL DELETE ALL DATA IN YOUR DATABASE ⚠️
 *
 * Usage on Railway:
 *   railway run node force-sync-db-auto.js
 *
 * Or via npm:
 *   npm run force:sync:auto
 */

require('dotenv').config();
const { sequelize } = require('./src/models');

const forceSyncDatabase = async () => {
  try {
    console.log('='.repeat(60));
    console.log('⚠️  FORCE DATABASE SYNC - THIS WILL DELETE ALL DATA ⚠️');
    console.log('='.repeat(60));
    console.log('\nDatabase:', process.env.DATABASE_URL ? 'PostgreSQL (Production)' : 'SQLite (Development)');
    console.log('Environment:', process.env.NODE_ENV || 'development');

    // Test connection
    console.log('\n[1/3] Testing database connection...');
    await sequelize.authenticate();
    console.log('✓ Database connection successful!');

    // Show what will be affected
    console.log('\n[2/3] Preparing to drop and recreate all tables...');
    const models = Object.keys(sequelize.models);
    console.log(`This will affect ${models.length} models: ${models.join(', ')}`);
    console.log('\n⚠️  ALL DATA WILL BE PERMANENTLY DELETED ⚠️\n');

    // Force sync - sync models in dependency order to avoid foreign key errors
    console.log('[3/3] Force syncing database (dropping and recreating all tables)...');

    // First, drop all tables to start fresh using raw SQL (Sequelize.drop() has bugs)
    try {
      await sequelize.query('DROP SCHEMA public CASCADE');
      await sequelize.query('CREATE SCHEMA public');
      await sequelize.query('GRANT ALL ON SCHEMA public TO public');
      console.log('✓ Dropped all tables');
    } catch (dropError) {
      console.log('⚠ Could not drop schema (may not exist yet)');
    }

    // Then sync models in the correct order (parent tables first)
    const modelOrder = [
      'User',           // Must be first (parent of many tables)
      'Post',           // Parent of Comment, Like
      'Comment',
      'Like',
      'Follow',
      'Message',
      'Program',        // Parent of Purchase, Progress, ProgramReview
      'Purchase',
      'Progress',
      'Achievement',    // Parent of UserAchievement
      'UserAchievement',
      'Challenge',      // Parent of ChallengeParticipant
      'ChallengeParticipant',
      'Subscription',
      'Report',
      'ProgramReview',
      'AuditLog',
      'DailyContent',   // Parent of DailyCheckIn
      'UserStreak',     // References User
      'DailyCheckIn'    // References User and DailyContent
    ];

    for (const modelName of modelOrder) {
      if (sequelize.models[modelName]) {
        await sequelize.models[modelName].sync();
        console.log(`  ✓ Created ${modelName} table`);
      }
    }

    console.log('✓ Database force synced successfully!');

    // Verify
    try {
      const [results] = await sequelize.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `);
      console.log(`\n✓ Created ${results.length} tables:`);
      results.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    } catch (queryError) {
      console.log('⚠ Could not query table list (this is okay for SQLite)');
    }

    console.log('\n' + '='.repeat(60));
    console.log('SUCCESS: Database has been reset and all tables created!');
    console.log('='.repeat(60));
    console.log('\n⚠️  IMPORTANT: You now need to:');
    console.log('1. Create an admin user');
    console.log('2. Re-seed any necessary data');
    console.log('3. Restart your Railway application\n');

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('ERROR: Force sync failed!');
    console.error('='.repeat(60));
    console.error('\nError details:');
    console.error(error);
    console.error('\nTroubleshooting:');
    console.error('1. Check DATABASE_URL is set correctly');
    console.error('2. Ensure database server is accessible');
    console.error('3. Verify you have permission to drop/create tables\n');
    process.exit(1);
  }
};

// Run immediately without confirmation
forceSyncDatabase();
