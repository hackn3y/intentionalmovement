require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const path = require('path');
const axios = require('axios');

const DATABASE_PATH = path.join(__dirname, 'database.sqlite');
const API_URL = 'http://localhost:3001/api';

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

async function debugPasswordChange() {
  try {
    await sequelize.authenticate();
    console.log('=== PASSWORD CHANGE DEBUG ===\n');

    // Step 1: Check initial state
    console.log('STEP 1: Check initial database state');
    let user = await User.findOne({ where: { email: 'hackn3y@gmail.com' } });
    const initialHash = user.password;
    console.log('Initial password hash:', initialHash.substring(0, 40));

    const initialTest = await bcrypt.compare('Password1', initialHash);
    console.log('Can authenticate with Password1:', initialTest);
    console.log('');

    // Step 2: Login to get token
    console.log('STEP 2: Login to get auth token');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'hackn3y@gmail.com',
      password: 'Password1'
    });
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    console.log('');

    // Step 3: Change password via API
    console.log('STEP 3: Change password via API');
    const changeResponse = await axios.put(
      `${API_URL}/users/change-password`,
      {
        currentPassword: 'Password1',
        newPassword: 'TestPassword123'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('API Response:', changeResponse.data);
    console.log('');

    // Step 4: Check database state IMMEDIATELY after API call
    console.log('STEP 4: Check database state IMMEDIATELY after API call');
    await user.reload(); // Reload from database
    const afterApiHash = user.password;
    console.log('Password hash after API call:', afterApiHash.substring(0, 40));
    console.log('Hash changed:', initialHash !== afterApiHash);
    console.log('');

    // Step 5: Test the new hash directly
    console.log('STEP 5: Test the new password hash directly');
    const testNewPassword = await bcrypt.compare('TestPassword123', afterApiHash);
    const testOldPassword = await bcrypt.compare('Password1', afterApiHash);
    console.log('Can authenticate with TestPassword123:', testNewPassword);
    console.log('Can authenticate with Password1:', testOldPassword);
    console.log('');

    // Step 6: Try manual bcrypt hash
    console.log('STEP 6: Create manual hash of TestPassword123');
    const manualHash = await bcrypt.hash('TestPassword123', 10);
    console.log('Manual hash:', manualHash.substring(0, 40));
    const manualTest = await bcrypt.compare('TestPassword123', manualHash);
    console.log('Manual hash works with TestPassword123:', manualTest);
    console.log('');

    // Step 7: Compare the hashes
    console.log('STEP 7: Hash comparison');
    console.log('DB hash length:', afterApiHash.length);
    console.log('Manual hash length:', manualHash.length);
    console.log('DB hash prefix:', afterApiHash.substring(0, 7));
    console.log('Manual hash prefix:', manualHash.substring(0, 7));

    // Check if there are any special characters or encoding issues
    const dbHashBuffer = Buffer.from(afterApiHash, 'utf8');
    const manualHashBuffer = Buffer.from(manualHash, 'utf8');
    console.log('DB hash buffer length:', dbHashBuffer.length);
    console.log('Manual hash buffer length:', manualHashBuffer.length);
    console.log('');

    // Step 8: Try login with new password
    console.log('STEP 8: Try login with new password via API');
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: 'hackn3y@gmail.com',
        password: 'TestPassword123'
      });
      console.log('✅ Login with new password SUCCESS');
    } catch (error) {
      console.log('❌ Login with new password FAILED');
      console.log('Error:', error.response?.data?.message);
    }
    console.log('');

    // Step 9: Check database one more time
    console.log('STEP 9: Final database check');
    await user.reload();
    const finalHash = user.password;
    console.log('Final password hash:', finalHash.substring(0, 40));
    console.log('Same as after API call:', finalHash === afterApiHash);

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    await sequelize.close();
    process.exit(1);
  }
}

debugPasswordChange();
