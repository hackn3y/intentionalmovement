/**
 * Find user by username or email - simplified version
 */

require('dotenv').config();
const { User } = require('./src/models');

async function findUser(searchTerm) {
  try {
    console.log('Searching for user:', searchTerm);
    console.log('Database:', process.env.DATABASE_URL ? 'Using DATABASE_URL' : 'Using individual DB vars');

    const users = await User.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { username: searchTerm },
          { email: searchTerm }
        ]
      },
      attributes: ['id', 'email', 'username', 'stripeCustomerId']
    });

    if (users.length === 0) {
      console.log('No users found');
    } else {
      console.log(`Found ${users.length} user(s):\n`);
      users.forEach(user => {
        console.log(`Username: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`ID: ${user.id}`);
        console.log(`Stripe Customer ID: ${user.stripeCustomerId || 'NULL'}`);
        console.log('---');
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

const searchTerm = process.argv[2];
if (!searchTerm) {
  console.log('Usage: node find-user.js <username-or-email>');
  process.exit(1);
}

findUser(searchTerm);