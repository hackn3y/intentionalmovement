/**
 * Migration Script: Add role column to Users table
 *
 * This script adds the missing 'role' column to the Users table in production PostgreSQL.
 * It's designed to be run safely on Railway.
 *
 * Usage:
 * 1. On Railway: railway run node add-role-column.js
 * 2. Or deploy and run as one-off command: node add-role-column.js
 */

const { Sequelize, DataTypes } = require('sequelize');

async function addRoleColumn() {
  console.log('=== ADD ROLE COLUMN MIGRATION ===');
  console.log('Starting migration...\n');

  // Initialize Sequelize with DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('✗ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('✓ DATABASE_URL found');

  const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: (msg) => console.log('  [DB]', msg),
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });

  try {
    // Test connection
    console.log('\n1. Testing database connection...');
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Check if column exists
    console.log('\n2. Checking if role column exists...');
    const [results] = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Users'
        AND column_name = 'role'
    `);

    if (results.length > 0) {
      console.log('✓ role column already exists - no migration needed');
      console.log('\n=== MIGRATION COMPLETE (No changes made) ===\n');
      await sequelize.close();
      process.exit(0);
    }

    console.log('✓ role column does not exist - proceeding with migration');

    // Add role column
    console.log('\n3. Adding role column to Users table...');
    await sequelize.query(`
      ALTER TABLE "Users"
      ADD COLUMN "role" VARCHAR(255)
      CHECK ("role" IN ('user', 'admin', 'moderator'))
      DEFAULT 'user'
    `);
    console.log('✓ role column added successfully');

    // Update existing users with default role
    console.log('\n4. Setting default role for existing users...');
    const [updateResult] = await sequelize.query(`
      UPDATE "Users"
      SET "role" = 'user'
      WHERE "role" IS NULL
    `);
    console.log(`✓ Updated ${updateResult.rowCount || 0} users with default role`);

    // Find users with admin emails and set them as admin
    console.log('\n5. Setting admin role for known admin users...');

    // List of admin emails (add your admin email here)
    const adminEmails = [
      'hackn3y@gmail.com',
      'admin@intentionalmovementcorp.com'
    ];

    if (adminEmails.length > 0) {
      const placeholders = adminEmails.map((_, i) => `$${i + 1}`).join(', ');
      const [adminResult] = await sequelize.query(
        `UPDATE "Users" SET "role" = 'admin' WHERE "email" IN (${placeholders})`,
        { bind: adminEmails }
      );
      console.log(`✓ Set admin role for ${adminResult.rowCount || 0} users`);
      console.log('  Admin emails checked:', adminEmails.join(', '));
    }

    // Create index on role column
    console.log('\n6. Creating index on role column...');
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "users_role" ON "Users" ("role")
    `);
    console.log('✓ Index created on role column');

    // Verify migration
    console.log('\n7. Verifying migration...');
    const [verifyResults] = await sequelize.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'Users'
        AND column_name = 'role'
    `);

    if (verifyResults.length > 0) {
      console.log('✓ Migration verified successfully');
      console.log('  Column details:', verifyResults[0]);
    } else {
      throw new Error('Migration verification failed - column not found');
    }

    // Show admin users
    console.log('\n8. Listing admin users...');
    const [adminUsers] = await sequelize.query(`
      SELECT id, email, username, role
      FROM "Users"
      WHERE role = 'admin'
    `);
    console.log(`✓ Found ${adminUsers.length} admin user(s):`);
    adminUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.username})`);
    });

    console.log('\n=== MIGRATION COMPLETE ===');
    console.log('✓ role column added successfully');
    console.log('✓ Default values set');
    console.log('✓ Admin users configured');
    console.log('\nNext steps:');
    console.log('1. Restart the backend service on Railway');
    console.log('2. The isAdmin middleware will now work correctly');
    console.log('3. Test admin dashboard login\n');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    console.error('Stack:', error.stack);

    try {
      await sequelize.close();
    } catch (closeError) {
      console.error('✗ Error closing connection:', closeError.message);
    }

    process.exit(1);
  }
}

// Run migration
addRoleColumn();
