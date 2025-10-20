require('dotenv').config();
const { User } = require('./src/models');

// Get user email from command line argument
const userEmail = process.argv[2] || 'hackn3y@gmail.com';
const newRole = process.argv[3] || 'admin';

(async () => {
  try {
    console.log(`Updating user ${userEmail} to role: ${newRole}...`);

    const user = await User.findOne({ where: { email: userEmail } });

    if (!user) {
      console.error(`✗ User ${userEmail} not found!`);
      process.exit(1);
    }

    console.log('✓ Found user:', {
      id: user.id,
      email: user.email,
      username: user.username,
      currentRole: user.role
    });

    await user.update({ role: newRole });

    console.log(`✓ Successfully updated ${userEmail} to role: ${newRole}`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
