require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const path = require('path');

// Use local SQLite database
const DATABASE_PATH = path.join(__dirname, 'database.sqlite');

console.log('🔌 Connecting to database:', DATABASE_PATH);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DATABASE_PATH,
  logging: false
});

// Define User model
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, primaryKey: true },
  email: DataTypes.STRING,
  username: DataTypes.STRING,
  password: DataTypes.STRING,
}, {
  tableName: 'Users',
  timestamps: false
});

// Add comparePassword method
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

    const testPasswords = ['Password1', 'Password123'];

    for (const testPassword of testPasswords) {
      console.log('\nTesting password:', testPassword);
      const isValid = await user.comparePassword(testPassword);
      console.log('Password is valid:', isValid);

      if (isValid) {
        console.log('\n✅ Password matches:', testPassword);
        break;
      }
    }

    console.log('\n❌ Neither password matched!');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testPassword();
