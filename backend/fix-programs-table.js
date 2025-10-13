const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Adding instructorName column to Programs table...');

db.run(`ALTER TABLE Programs ADD COLUMN instructorName VARCHAR(255) DEFAULT 'Intentional Movement'`, (err) => {
  if (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('Column instructorName already exists');
    } else {
      console.error('Error adding column:', err.message);
    }
  } else {
    console.log('Successfully added instructorName column');
  }

  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    }
    console.log('Database connection closed');
  });
});
