const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node make-admin.js <email>');
  console.log('Example: node make-admin.js user@example.com');
  console.log('\nListing all users:');

  db.all('SELECT id, email, username, role FROM Users ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) {
      console.error('Error:', err.message);
      db.close();
      return;
    }

    if (rows.length === 0) {
      console.log('No users found.');
    } else {
      console.log('\n--- All Users ---');
      rows.forEach((row, index) => {
        console.log(`${index + 1}. Email: ${row.email}, Username: ${row.username}, Role: ${row.role}`);
      });
      console.log('\nTo make a user admin, run:');
      console.log('node make-admin.js <email>');
    }

    db.close();
  });
} else {
  // Update user role to admin
  db.run('UPDATE Users SET role = ? WHERE email = ?', ['admin', email], function(err) {
    if (err) {
      console.error('Error updating user:', err.message);
      db.close();
      return;
    }

    if (this.changes === 0) {
      console.log(`No user found with email: ${email}`);
    } else {
      console.log(`✓ Successfully updated ${email} to admin role!`);
    }

    db.close();
  });
}
