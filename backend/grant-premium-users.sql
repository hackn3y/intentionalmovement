-- Grant premium subscription and Own Your Sale program purchase to specific users
-- Run this SQL script to give hackn3y@gmail.com and briellemceowen@gmail.com max subscription + program

-- First, get the user IDs and program ID (we'll need these for the inserts)
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    program_id UUID;
    current_time TIMESTAMP;
    period_end TIMESTAMP;
BEGIN
    -- Set current time and period end (1 year from now)
    current_time := NOW();
    period_end := NOW() + INTERVAL '1 year';

    -- Get user IDs
    SELECT id INTO user1_id FROM "Users" WHERE email = 'hackn3y@gmail.com' LIMIT 1;
    SELECT id INTO user2_id FROM "Users" WHERE email = 'briellemceowen@gmail.com' LIMIT 1;

    -- Get Own Your Sale program ID
    SELECT id INTO program_id FROM "Programs" WHERE slug = 'own-your-sale' LIMIT 1;

    -- Check if users exist
    IF user1_id IS NULL THEN
        RAISE EXCEPTION 'User hackn3y@gmail.com not found';
    END IF;

    IF user2_id IS NULL THEN
        RAISE EXCEPTION 'User briellemceowen@gmail.com not found';
    END IF;

    IF program_id IS NULL THEN
        RAISE EXCEPTION 'Own Your Sale program not found';
    END IF;

    -- Insert or update subscription for user 1 (hackn3y@gmail.com)
    INSERT INTO "Subscriptions" (
        id,
        "userId",
        tier,
        status,
        "currentPeriodStart",
        "currentPeriodEnd",
        "createdAt",
        "updatedAt"
    ) VALUES (
        gen_random_uuid(),
        user1_id,
        'premium',
        'active',
        current_time,
        period_end,
        current_time,
        current_time
    )
    ON CONFLICT ("userId")
    DO UPDATE SET
        tier = 'premium',
        status = 'active',
        "currentPeriodEnd" = period_end,
        "updatedAt" = current_time;

    -- Insert or update subscription for user 2 (briellemceowen@gmail.com)
    INSERT INTO "Subscriptions" (
        id,
        "userId",
        tier,
        status,
        "currentPeriodStart",
        "currentPeriodEnd",
        "createdAt",
        "updatedAt"
    ) VALUES (
        gen_random_uuid(),
        user2_id,
        'premium',
        'active',
        current_time,
        period_end,
        current_time,
        current_time
    )
    ON CONFLICT ("userId")
    DO UPDATE SET
        tier = 'premium',
        status = 'active',
        "currentPeriodEnd" = period_end,
        "updatedAt" = current_time;

    -- Insert program purchase for user 1 (if not exists)
    INSERT INTO "Purchases" (
        id,
        "userId",
        "programId",
        amount,
        currency,
        status,
        "createdAt",
        "updatedAt"
    ) VALUES (
        gen_random_uuid(),
        user1_id,
        program_id,
        777.00,
        'USD',
        'completed',
        current_time,
        current_time
    )
    ON CONFLICT DO NOTHING;

    -- Insert program purchase for user 2 (if not exists)
    INSERT INTO "Purchases" (
        id,
        "userId",
        "programId",
        amount,
        currency,
        status,
        "createdAt",
        "updatedAt"
    ) VALUES (
        gen_random_uuid(),
        user2_id,
        program_id,
        777.00,
        'USD',
        'completed',
        current_time,
        current_time
    )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Successfully granted premium subscription and Own Your Sale program to both users!';
    RAISE NOTICE 'User 1 ID: %', user1_id;
    RAISE NOTICE 'User 2 ID: %', user2_id;
    RAISE NOTICE 'Program ID: %', program_id;
END $$;

-- Verify the changes
SELECT
    u.email,
    u."displayName",
    s.tier as subscription_tier,
    s.status as subscription_status,
    s."currentPeriodEnd" as subscription_expires,
    COUNT(p.id) as program_purchases
FROM "Users" u
LEFT JOIN "Subscriptions" s ON u.id = s."userId"
LEFT JOIN "Purchases" p ON u.id = p."userId" AND p.status = 'completed'
WHERE u.email IN ('hackn3y@gmail.com', 'briellemceowen@gmail.com')
GROUP BY u.id, u.email, u."displayName", s.tier, s.status, s."currentPeriodEnd";
