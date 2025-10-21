// Script to grant admin privileges to a specific user
require('dotenv').config();
const { User } = require('./src/models');
const { sequelize } = require('./src/models');

async function grantAdmin(email) {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully');

    console.log(`Looking for user with email: ${email}`);
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      console.log('Available users:');
      const users = await User.findAll({ attributes: ['email', 'username', 'role'] });
      users.forEach(u => console.log(`  - ${u.email} (${u.username}) - Role: ${u.role}`));
      process.exit(1);
    }

    console.log(`Found user: ${user.username} (${user.email})`);
    console.log(`Current role: ${user.role}`);

    if (user.role === 'admin') {
      console.log('✅ User already has admin role!');
    } else {
      user.role = 'admin';
      await user.save();
      console.log(`✅ Successfully granted admin role to ${user.username} (${user.email})`);
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error granting admin privileges:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2] || 'hackn3y@gmail.com';

console.log('=== Grant Admin Privileges ===');
console.log(`Target email: ${email}`);
console.log('');

grantAdmin(email);
