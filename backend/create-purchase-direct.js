require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Use DATABASE_URL from environment or command line argument
// Default to local SQLite database
const DATABASE_URL = process.argv[2] || process.env.DATABASE_URL || path.join(__dirname, 'database.sqlite');

if (!DATABASE_URL) {
  console.log('❌ Usage: node create-purchase-direct.js <DATABASE_URL>');
  console.log('Or set DATABASE_URL in .env file');
  process.exit(1);
}

console.log('🔌 Connecting to database...');

// Connect to database
const isProduction = DATABASE_URL.includes('railway.app') || process.argv.includes('--production');
const isPostgres = DATABASE_URL.includes('postgres');
const isSQLite = !isPostgres;

const sequelize = new Sequelize(
  isSQLite ? {
    dialect: 'sqlite',
    storage: DATABASE_URL,
    logging: false
  } : DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: isProduction ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  }
);

// Define minimal models
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, primaryKey: true },
  email: DataTypes.STRING,
  username: DataTypes.STRING,
  displayName: DataTypes.STRING,
  firebaseUid: DataTypes.STRING,
  role: DataTypes.STRING
}, { tableName: 'Users' });

const Program = sequelize.define('Program', {
  id: { type: DataTypes.UUID, primaryKey: true },
  title: DataTypes.STRING,
  slug: DataTypes.STRING,
  price: DataTypes.DECIMAL
}, { tableName: 'Programs' });

const Purchase = sequelize.define('Purchase', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  userId: DataTypes.UUID,
  programId: DataTypes.UUID,
  status: DataTypes.STRING,
  amount: DataTypes.DECIMAL,
  stripePaymentIntentId: DataTypes.STRING,
  metadata: DataTypes.TEXT
}, { tableName: 'Purchases' });

Purchase.belongsTo(Program, { foreignKey: 'programId', as: 'program' });
Purchase.belongsTo(User, { foreignKey: 'userId', as: 'user' });

async function createPurchase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const userEmail = 'hackn3y@gmail.com';
    const programSlug = 'own-your-sale';

    // Find user
    const user = await User.findOne({
      where: { email: userEmail }
    });

    if (!user) {
      console.log('❌ User not found:', userEmail);
      process.exit(1);
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    // Find program
    const program = await Program.findOne({
      where: { slug: programSlug }
    });

    if (!program) {
      console.log('❌ Program not found:', programSlug);
      process.exit(1);
    }

    console.log('\n✅ Program found:', {
      id: program.id,
      title: program.title,
      price: `$${program.price}`
    });

    // Check if purchase already exists
    const existingPurchase = await Purchase.findOne({
      where: {
        userId: user.id,
        programId: program.id
      }
    });

    if (existingPurchase) {
      console.log('\n⚠️  Purchase already exists:', {
        id: existingPurchase.id,
        status: existingPurchase.status,
        amount: `$${existingPurchase.amount}`,
        createdAt: existingPurchase.createdAt
      });
      console.log('\n✅ User already has access to this program!');
      await sequelize.close();
      return;
    }

    // Create purchase
    console.log('\n📦 Creating purchase...');
    const purchase = await Purchase.create({
      userId: user.id,
      programId: program.id,
      status: 'completed',
      amount: program.price,
      stripePaymentIntentId: 'admin-created-direct',
      metadata: JSON.stringify({
        createdBy: 'admin-script',
        note: 'Manually created via direct database script'
      })
    });

    console.log('\n✅ Purchase created successfully!', {
      id: purchase.id,
      status: purchase.status,
      amount: `$${purchase.amount}`,
      createdAt: purchase.createdAt
    });

    console.log('\n🎉 User now has access to "' + program.title + '"!');
    console.log('📱 The program should now appear in Settings → My Programs on the app');

    await sequelize.close();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createPurchase();
