require('dotenv').config();
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env file');
  process.exit(1);
}

(async () => {
  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Update the admin user password
    db.run(
      'UPDATE Users SET password = ? WHERE email = ?',
      [hashedPassword, adminEmail],
      function(err) {
        if (err) {
          console.error('Error updating admin password:', err.message);
          db.close();
          process.exit(1);
        }

        if (this.changes === 0) {
          console.log(`No user found with email: ${adminEmail}`);
          console.log('Creating admin user...');

          // Create admin user if doesn't exist
          db.run(
            'INSERT INTO Users (email, username, password, role, isEmailVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [adminEmail, 'admin', hashedPassword, 'admin', true, new Date().toISOString(), new Date().toISOString()],
            function(err) {
              if (err) {
                console.error('Error creating admin user:', err.message);
              } else {
                console.log(`✓ Successfully created admin user: ${adminEmail}`);
              }
              db.close();
            }
          );
        } else {
          console.log(`✓ Successfully updated password for ${adminEmail}`);
          db.close();
        }
      }
    );
  } catch (error) {
    console.error('Error:', error.message);
    db.close();
    process.exit(1);
  }
})();
