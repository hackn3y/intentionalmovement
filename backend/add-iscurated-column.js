const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

console.log('Opening database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Database opened successfully');
});

// Add isCurated column to Posts table
db.run(
  `ALTER TABLE Posts ADD COLUMN isCurated INTEGER DEFAULT 0`,
  (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('Column isCurated already exists, skipping...');
      } else {
        console.error('Error adding isCurated column:', err);
        db.close();
        process.exit(1);
      }
    } else {
      console.log('Successfully added isCurated column to Posts table');
    }

    // Create index for isCurated
    db.run(
      `CREATE INDEX IF NOT EXISTS posts_is_curated ON Posts (isCurated)`,
      (err) => {
        if (err) {
          console.error('Error creating isCurated index:', err);
        } else {
          console.log('Successfully created index on isCurated column');
        }

        // Create composite index for isCurated + createdAt
        db.run(
          `CREATE INDEX IF NOT EXISTS posts_is_curated_created_at ON Posts (isCurated, createdAt)`,
          (err) => {
            if (err) {
              console.error('Error creating composite index:', err);
            } else {
              console.log('Successfully created composite index on isCurated and createdAt');
            }

            // Verify the changes
            db.all(
              `PRAGMA table_info(Posts)`,
              (err, rows) => {
                if (err) {
                  console.error('Error getting table info:', err);
                } else {
                  const curatedColumn = rows.find(row => row.name === 'isCurated');
                  if (curatedColumn) {
                    console.log('\n✅ Verification: isCurated column exists!');
                    console.log('Column details:', curatedColumn);
                  } else {
                    console.log('\n❌ Verification failed: isCurated column not found');
                  }
                }

                db.close((err) => {
                  if (err) {
                    console.error('Error closing database:', err);
                  } else {
                    console.log('\nDatabase closed successfully');
                    console.log('Migration complete!');
                  }
                });
              }
            );
          }
        );
      }
    );
  }
);
