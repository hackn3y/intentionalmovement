// Script to list all users in the database
require('dotenv').config();
const { User } = require('./src/models');
const { sequelize } = require('./src/models');

async function listUsers() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully\n');

    console.log('=== ALL USERS ===\n');
    const users = await User.findAll({
      attributes: ['id', 'email', 'username', 'displayName', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      console.log(`Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (@${user.username})`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Display Name: ${user.displayName || 'N/A'}`);
        console.log(`   Role: ${user.role || 'user'}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
      });
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
}

listUsers();
