-- Simple SQL Migration: Add role column to Users table
-- Run this in Railway's PostgreSQL Query tab

-- 1. Add role column (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Users' AND column_name = 'role'
    ) THEN
        ALTER TABLE "Users"
        ADD COLUMN "role" VARCHAR(255)
        CHECK ("role" IN ('user', 'admin', 'moderator'))
        DEFAULT 'user';

        RAISE NOTICE 'role column added successfully';
    ELSE
        RAISE NOTICE 'role column already exists';
    END IF;
END $$;

-- 2. Set default role for existing users
UPDATE "Users"
SET "role" = 'user'
WHERE "role" IS NULL;

-- 3. Set admin role for known admin users
UPDATE "Users"
SET "role" = 'admin'
WHERE "email" IN ('hackn3y@gmail.com', 'admin@intentionalmovementcorp.com');

-- 4. Create index on role column
CREATE INDEX IF NOT EXISTS "users_role" ON "Users" ("role");

-- 5. Verify migration
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'Users' AND column_name = 'role';

-- 6. Show admin users
SELECT id, email, username, role
FROM "Users"
WHERE role = 'admin';
