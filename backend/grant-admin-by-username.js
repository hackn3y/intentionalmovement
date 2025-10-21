// Script to grant admin privileges by username (works on both local and production)
require('dotenv').config();
const { User } = require('./src/models');
const { sequelize } = require('./src/models');

async function grantAdminByUsername(username) {
  try {
    console.log('Connecting to database...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Using DATABASE_URL (production)' : 'Using local SQLite');
    await sequelize.authenticate();
    console.log('Connected successfully');

    console.log(`\nLooking for user with username: ${username}`);
    const user = await User.findOne({ where: { username } });

    if (!user) {
      console.error(`❌ User not found with username: ${username}`);
      console.log('\nAvailable users:');
      const users = await User.findAll({
        attributes: ['email', 'username', 'role', 'displayName'],
        order: [['createdAt', 'DESC']],
        limit: 20
      });
      users.forEach(u => console.log(`  - @${u.username} (${u.email}) - ${u.displayName} - Role: ${u.role || 'user'}`));
      process.exit(1);
    }

    console.log(`\nFound user:`);
    console.log(`  Username: @${user.username}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Display Name: ${user.displayName || 'N/A'}`);
    console.log(`  Current role: ${user.role || 'user'}`);

    if (user.role === 'admin') {
      console.log('\n✅ User already has admin role!');
    } else {
      user.role = 'admin';
      await user.save();
      console.log(`\n✅ Successfully granted admin role to @${user.username} (${user.email})`);
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error granting admin privileges:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Get username from command line argument
const username = process.argv[2];

if (!username) {
  console.log('Usage: node grant-admin-by-username.js <username>');
  console.log('Example: node grant-admin-by-username.js hackn3y_e28ar');
  process.exit(1);
}

console.log('=== Grant Admin Privileges by Username ===');
console.log(`Target username: @${username}`);
console.log('');

grantAdminByUsername(username);
