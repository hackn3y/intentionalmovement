# Seeding Production Database

This guide explains how to add the "Own Your Sale" program and daily content to your production database on Railway.

## What Was Created

1. **Own Your Sale Program** - $777 sales mastery program
2. **30 Days of Daily Content** - Quotes, tips, challenges, affirmations, and reflections

## Files Created

- `seed-own-your-sale.js` - Node.js seed script (for local or Railway CLI)
- `seed-production.sql` - SQL script (for direct database access)

## Option 1: Using Railway CLI (Recommended)

Run the Node.js seed script through Railway CLI:

```bash
cd backend
railway run node seed-own-your-sale.js
```

This will:
- Connect to production database
- Add "Own Your Sale" program if it doesn't exist
- Add 30 days of daily content (skips duplicates based on date)

## Option 2: Direct SQL Execution

If Railway CLI doesn't work, you can run SQL directly:

1. Go to Railway dashboard: https://railway.app/
2. Select your project: "disciplined-beauty"
3. Click on the "Postgres-r98w" service
4. Click "Data" tab
5. Click "Query" or connect with a PostgreSQL client
6. Run the SQL in `seed-production.sql`

## Option 3: Using PostgreSQL Client

Connect directly to the database:

```bash
# Get connection details from Railway dashboard
psql postgresql://postgres:[PASSWORD]@[HOST]:5432/railway

# Then copy-paste the SQL from seed-production.sql
```

## Verification

After seeding, verify the data:

### Check Program

```sql
SELECT title, price, category, "isPublished", "isFeatured"
FROM "Programs"
WHERE slug = 'own-your-sale';
```

Should return:
- Title: "Own Your Sale"
- Price: 777.00
- Category: insurance
- isPublished: true
- isFeatured: true

### Check Daily Content

```sql
SELECT COUNT(*), MIN(date), MAX(date)
FROM daily_contents
WHERE "isActive" = true;
```

Should return 30 rows with dates spanning 30 days from today.

### Test API Endpoints

Once seeded, test these endpoints:

1. **Get Today's Daily Content**
   ```
   GET https://intentionalmovement-production.up.railway.app/api/daily-content/today
   ```

2. **Get All Programs**
   ```
   GET https://intentionalmovement-production.up.railway.app/api/programs
   ```

3. **Get Own Your Sale Program**
   ```
   GET https://intentionalmovement-production.up.railway.app/api/programs/own-your-sale
   ```

## Troubleshooting

### "Module not found" Error

If you get module errors when running the seed script:
```bash
cd backend
npm install
railway run node seed-own-your-sale.js
```

### Connection Error

If you can't connect to the database:
1. Check that DATABASE_URL is set in Railway environment variables
2. Verify the Postgres service is running
3. Try the SQL option instead

### Data Already Exists

The scripts are safe to run multiple times:
- Programs: Checks for existing slug, only creates if missing
- Daily Content: Uses `INSERT OR IGNORE` / `ON CONFLICT DO NOTHING` for dates

## Next Steps

After successful seeding:

1. **Restart Backend Service** - May help refresh any cached data
2. **Clear Mobile App Cache** - Reload the mobile app
3. **Test Programs Tab** - Should show "Own Your Sale" program
4. **Test Daily Content** - Should show today's content in the app

## Support

If you encounter issues:
1. Check Railway logs: `railway logs --service intentionalmovement`
2. Verify database connection: Look for "Database connection established" in logs
3. Check for SQL errors in Railway's Postgres logs
