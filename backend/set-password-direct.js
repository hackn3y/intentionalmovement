require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const path = require('path');

// Use local SQLite database or provide DATABASE_URL
const DATABASE_URL = process.argv[2] || path.join(__dirname, 'database.sqlite');
const NEW_PASSWORD = process.argv[3] || 'Password1';

const isPostgres = DATABASE_URL.includes('postgres');
const isProduction = DATABASE_URL.includes('railway.app');

console.log('🔌 Connecting to database...');
console.log('📝 New password will be:', NEW_PASSWORD);

const sequelize = new Sequelize(
  isPostgres ? {
    url: DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    dialectOptions: isProduction ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  } : {
    dialect: 'sqlite',
    storage: DATABASE_URL,
    logging: false
  }
);

// Define User model
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, primaryKey: true },
  email: DataTypes.STRING,
  username: DataTypes.STRING,
  password: DataTypes.STRING,
}, { tableName: 'Users' });

async function setPassword() {
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

    console.log('Found user:', user.email);
    console.log('Current password hash:', user.password ? user.password.substring(0, 50) + '...' : 'null');

    // Hash new password
    console.log('\n🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

    // Update password
    await user.update({ password: hashedPassword });

    console.log('✅ Password updated successfully!');
    console.log('New password hash:', hashedPassword.substring(0, 50) + '...');

    // Verify password works
    const isValid = await bcrypt.compare(NEW_PASSWORD, hashedPassword);
    console.log('\n✓ Password verification:', isValid ? 'SUCCESS' : 'FAILED');

    if (isValid) {
      console.log(`\n🎉 You can now log in with:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${NEW_PASSWORD}`);
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

setPassword();
