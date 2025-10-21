-- Grant admin privileges to hackn3y_e28ar on Railway production database
-- Run this in Railway's PostgreSQL console

-- First, check if the user exists and their current role
SELECT id, username, email, "displayName", role, "createdAt"
FROM "Users"
WHERE username = 'hackn3y_e28ar' OR email = 'hackn3y@gmail.com'
ORDER BY "createdAt" DESC;

-- Grant admin role to hackn3y_e28ar
UPDATE "Users"
SET role = 'admin', "updatedAt" = NOW()
WHERE username = 'hackn3y_e28ar';

-- Verify the update
SELECT id, username, email, "displayName", role, "updatedAt"
FROM "Users"
WHERE username = 'hackn3y_e28ar';

-- Show all admin users to confirm
SELECT username, email, "displayName", role
FROM "Users"
WHERE role = 'admin'
ORDER BY "createdAt" DESC;
