require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
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
  displayName: DataTypes.STRING,
  firebaseUid: DataTypes.STRING,
  password: DataTypes.STRING,
  role: DataTypes.STRING
}, { tableName: 'Users' });

async function checkUser() {
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

    console.log('User details:');
    console.log('  Email:', user.email);
    console.log('  Username:', user.username);
    console.log('  Firebase UID:', user.firebaseUid);
    console.log('  Has password:', !!user.password);
    console.log('  Password hash (first 50 chars):', user.password ? user.password.substring(0, 50) + '...' : 'null');
    console.log('  Role:', user.role);

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUser();
