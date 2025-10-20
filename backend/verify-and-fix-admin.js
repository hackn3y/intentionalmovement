/**
 * Verify and Fix Admin Role Script
 *
 * This script:
 * 1. Checks if role column exists
 * 2. Verifies admin users
 * 3. Sets admin role for hackn3y@gmail.com if needed
 */

const { Sequelize } = require('sequelize');

async function verifyAndFixAdmin() {
  console.log('=== VERIFY AND FIX ADMIN ROLE ===\n');

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('✗ DATABASE_URL not set');
    process.exit(1);
  }

  const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });

  try {
    await sequelize.authenticate();
    console.log('✓ Connected to database\n');

    // Check if role column exists
    console.log('1. Checking role column...');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'Users' AND column_name = 'role'
    `);

    if (columns.length === 0) {
      console.log('✗ role column does NOT exist');
      console.log('Run: node add-role-column.js first\n');
      process.exit(1);
    }

    console.log('✓ role column exists');
    console.log('  Type:', columns[0].data_type);
    console.log('  Default:', columns[0].column_default);

    // Check all users and their roles
    console.log('\n2. Checking all users...');
    const [users] = await sequelize.query(`
      SELECT id, email, username, role
      FROM "Users"
      ORDER BY "createdAt"
    `);

    console.log(`✓ Found ${users.length} user(s):\n`);
    users.forEach(user => {
      const roleStatus = user.role === 'admin' ? '✓ ADMIN' :
                         user.role === 'moderator' ? '◆ MODERATOR' :
                         user.role ? `○ ${user.role}` : '✗ NO ROLE';
      console.log(`  ${roleStatus} - ${user.email} (${user.username})`);
    });

    // Set admin role for hackn3y@gmail.com if not already set
    console.log('\n3. Ensuring hackn3y@gmail.com has admin role...');
    const [result] = await sequelize.query(`
      UPDATE "Users"
      SET "role" = 'admin'
      WHERE "email" = 'hackn3y@gmail.com'
      AND ("role" IS NULL OR "role" != 'admin')
      RETURNING id, email, username, role
    `);

    if (result.length > 0) {
      console.log('✓ Updated hackn3y@gmail.com to admin role');
    } else {
      console.log('✓ hackn3y@gmail.com already has admin role');
    }

    // Show final admin users
    console.log('\n4. Current admin users:');
    const [admins] = await sequelize.query(`
      SELECT id, email, username, role
      FROM "Users"
      WHERE role = 'admin'
    `);

    if (admins.length === 0) {
      console.log('✗ NO ADMIN USERS FOUND!');
    } else {
      console.log(`✓ ${admins.length} admin user(s):\n`);
      admins.forEach(admin => {
        console.log(`  - ${admin.email} (${admin.username})`);
      });
    }

    console.log('\n=== VERIFICATION COMPLETE ===');
    console.log('\nNext steps:');
    console.log('1. Restart backend service on Railway');
    console.log('2. Login to admin dashboard with: hackn3y@gmail.com');
    console.log('3. Should now have full admin access\n');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

verifyAndFixAdmin();
