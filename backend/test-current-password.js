require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const path = require('path');

const DATABASE_PATH = path.join(__dirname, 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DATABASE_PATH,
  logging: false
});

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, primaryKey: true },
  email: DataTypes.STRING,
  username: DataTypes.STRING,
  password: DataTypes.STRING,
}, {
  tableName: 'Users',
  timestamps: false
});

User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

async function testPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const user = await User.findOne({
      where: { email: 'hackn3y@gmail.com' }
    });

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('Testing password for:', user.email);
    console.log('Password hash:', user.password.substring(0, 60));

    const testPasswords = ['Password1', 'Password123', 'TestPassword123', 'NewPassword123'];

    for (const testPassword of testPasswords) {
      console.log('\nTesting password:', testPassword);
      const isValid = await user.comparePassword(testPassword);
      console.log('Password is valid:', isValid);

      if (isValid) {
        console.log('\n✅ Password matches:', testPassword);
        await sequelize.close();
        process.exit(0);
      }
    }

    console.log('\n❌ None of the test passwords matched!');
    console.log('\nLet me reset the password to "Password1" for testing...');

    // Reset password to Password1
    const hashedPassword = await bcrypt.hash('Password1', 10);
    await user.update({ password: hashedPassword });
    console.log('✅ Password reset to "Password1"');
    console.log('New hash:', hashedPassword.substring(0, 60));

    // Verify it works
    const verifyUser = await User.findOne({
      where: { email: 'hackn3y@gmail.com' }
    });
    const testReset = await verifyUser.comparePassword('Password1');
    console.log('Verification - Password1 works:', testReset);

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testPassword();
