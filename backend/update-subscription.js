const {User} = require('./src/models');

(async () => {
  try {
    const user = await User.findOne({ where: { username: 'hackna3y' } });

    if (!user) {
      console.log('User hackna3y not found. Checking all usernames...');
      const allUsers = await User.findAll({ attributes: ['username', 'email', 'subscriptionTier'] });
      console.log('Available users:');
      allUsers.forEach(u => {
        console.log(`  - ${u.username} (${u.email}): ${u.subscriptionTier}`);
      });
    } else {
      console.log('Found user:', user.username, user.email);
      console.log('Current tier:', user.subscriptionTier);
      await user.update({
        subscriptionTier: 'premium',
        subscriptionStatus: 'active'
      });
      console.log('Updated to premium subscription!');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
})();
