require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

async function addSubscriptionColumns() {
  let sequelize;

  try {
    // Connect to production PostgreSQL database
    const DATABASE_URL = process.env.DATABASE_URL;

    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    sequelize = new Sequelize(DATABASE_URL, {
      dialect: 'postgres',
      logging: console.log,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });

    console.log('1. Testing connection to production database...\n');
    await sequelize.authenticate();
    console.log('✅ Connected to production database\n');

    console.log('2. Adding subscription columns to Users table...\n');

    // Add subscriptionTier column
    try {
      await sequelize.query(`
        ALTER TABLE "Users"
        ADD COLUMN IF NOT EXISTS "subscriptionTier" VARCHAR(255) DEFAULT 'free'
      `);
      console.log('✅ Added subscriptionTier column');
    } catch (err) {
      console.log('   subscriptionTier column may already exist:', err.message);
    }

    // Add subscriptionStatus column
    try {
      await sequelize.query(`
        ALTER TABLE "Users"
        ADD COLUMN IF NOT EXISTS "subscriptionStatus" VARCHAR(255) DEFAULT 'active'
      `);
      console.log('✅ Added subscriptionStatus column');
    } catch (err) {
      console.log('   subscriptionStatus column may already exist:', err.message);
    }

    // Add stripeSubscriptionId column
    try {
      await sequelize.query(`
        ALTER TABLE "Users"
        ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" VARCHAR(255)
      `);
      console.log('✅ Added stripeSubscriptionId column');
    } catch (err) {
      console.log('   stripeSubscriptionId column may already exist:', err.message);
    }

    // Add subscriptionStartDate column
    try {
      await sequelize.query(`
        ALTER TABLE "Users"
        ADD COLUMN IF NOT EXISTS "subscriptionStartDate" TIMESTAMP
      `);
      console.log('✅ Added subscriptionStartDate column');
    } catch (err) {
      console.log('   subscriptionStartDate column may already exist:', err.message);
    }

    // Add subscriptionEndDate column
    try {
      await sequelize.query(`
        ALTER TABLE "Users"
        ADD COLUMN IF NOT EXISTS "subscriptionEndDate" TIMESTAMP
      `);
      console.log('✅ Added subscriptionEndDate column');
    } catch (err) {
      console.log('   subscriptionEndDate column may already exist:', err.message);
    }

    // Add trialEndsAt column
    try {
      await sequelize.query(`
        ALTER TABLE "Users"
        ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP
      `);
      console.log('✅ Added trialEndsAt column');
    } catch (err) {
      console.log('   trialEndsAt column may already exist:', err.message);
    }

    // Add cancelAtPeriodEnd column
    try {
      await sequelize.query(`
        ALTER TABLE "Users"
        ADD COLUMN IF NOT EXISTS "cancelAtPeriodEnd" BOOLEAN DEFAULT false
      `);
      console.log('✅ Added cancelAtPeriodEnd column');
    } catch (err) {
      console.log('   cancelAtPeriodEnd column may already exist:', err.message);
    }

    console.log('\n3. Updating hackn3y@gmail.com with admin and premium privileges...\n');

    await sequelize.query(`
      UPDATE "Users"
      SET
        role = 'admin',
        "subscriptionTier" = 'premium',
        "subscriptionStatus" = 'active'
      WHERE email = 'hackn3y@gmail.com'
    `);

    console.log('✅ User updated successfully!\n');

    console.log('4. Verifying changes...\n');
    const [results] = await sequelize.query(`
      SELECT email, role, "subscriptionTier", "subscriptionStatus"
      FROM "Users"
      WHERE email = 'hackn3y@gmail.com'
    `);

    console.log('User details:');
    console.log(results[0]);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    if (sequelize) {
      await sequelize.close();
      console.log('\n✅ Database connection closed');
    }
  }
}

addSubscriptionColumns();
