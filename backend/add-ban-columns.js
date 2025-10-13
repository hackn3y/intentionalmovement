const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Add ban-related columns
  const alterCommands = [
    "ALTER TABLE Users ADD COLUMN isBanned INTEGER DEFAULT 0",
    "ALTER TABLE Users ADD COLUMN banReason TEXT",
    "ALTER TABLE Users ADD COLUMN bannedAt DATETIME",
    "ALTER TABLE Users ADD COLUMN bannedBy TEXT"
  ];

  let completed = 0;
  let errors = [];

  alterCommands.forEach((sql, index) => {
    db.run(sql, (err) => {
      completed++;
      if (err) {
        // Column might already exist, which is fine
        if (err.message.includes('duplicate column name')) {
          console.log(`Column already exists: ${sql.split('COLUMN ')[1].split(' ')[0]}`);
        } else {
          errors.push({ sql, error: err.message });
        }
      } else {
        console.log(`✓ Successfully added column: ${sql.split('COLUMN ')[1].split(' ')[0]}`);
      }

      if (completed === alterCommands.length) {
        if (errors.length > 0) {
          console.error('\nErrors occurred:');
          errors.forEach(({ sql, error }) => {
            console.error(`  ${sql}: ${error}`);
          });
        } else {
          console.log('\nAll ban-related columns added successfully!');
        }
        db.close();
      }
    });
  });
});
