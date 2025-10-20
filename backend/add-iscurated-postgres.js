require('dotenv').config();
const { Sequelize } = require('sequelize');

// Get DATABASE_URL from environment (Railway provides this)
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL environment variable not set');
  console.log('This script requires a PostgreSQL connection string');
  process.exit(1);
}

console.log('Connecting to PostgreSQL database...');

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

async function migrate() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Posts'
      AND column_name = 'isCurated'
    `);

    if (results.length > 0) {
      console.log('⚠️  Column isCurated already exists, skipping...');
      await sequelize.close();
      return;
    }

    console.log('Adding isCurated column to Posts table...');

    // Add the column
    await sequelize.query(`
      ALTER TABLE "Posts"
      ADD COLUMN "isCurated" BOOLEAN DEFAULT false NOT NULL
    `);
    console.log('✅ Added isCurated column');

    // Create index on isCurated
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "posts_is_curated_idx"
      ON "Posts" ("isCurated")
    `);
    console.log('✅ Created index on isCurated');

    // Create composite index on isCurated and createdAt
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "posts_is_curated_created_at_idx"
      ON "Posts" ("isCurated", "createdAt")
    `);
    console.log('✅ Created composite index on isCurated and createdAt');

    // Verify the column exists
    const [verification] = await sequelize.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'Posts'
      AND column_name = 'isCurated'
    `);

    if (verification.length > 0) {
      console.log('\n✅ Verification: isCurated column exists!');
      console.log('Column details:', verification[0]);
    } else {
      console.log('\n❌ Verification failed: isCurated column not found');
    }

    console.log('\n🎉 Migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the migration
migrate();
