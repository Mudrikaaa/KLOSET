// ============================================================================
// One-command database setup for a fresh OR existing Kloset database.
//
//   node scripts/setup_db.js
//
// Runs, in order and idempotently:
//   1. db/bootstrap_001_current_schema.sql  (CREATE IF NOT EXISTS — no drops)
//   2. db/migration_001_profile_expansion.sql
//   3. db/migration_002_garment_expansion.sql
//   4. db/seed_001_outfit_catalog.sql       (fixed UUIDs, ON CONFLICT DO NOTHING)
//
// Uses DATABASE_URL from the environment (backend/.env locally, or the
// Render env var when run in a Render shell / one-off job). SSL is enabled
// automatically for non-local hosts so it works against Render Postgres
// from a laptop too.
//
// NEVER add schema.legacy.sql to this list — it DROPs every table.
// ============================================================================
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Aborting.');
  process.exit(1);
}

const isLocal = /localhost|127\.0\.0\.1/.test(url);
const pool = new Pool({
  connectionString: url,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

const FILES = [
  'bootstrap_001_current_schema.sql',
  'migration_001_profile_expansion.sql',
  'migration_002_garment_expansion.sql',
  'seed_001_outfit_catalog.sql',
];

(async () => {
  const host = new URL(url).host;
  console.log(`Setting up Kloset schema on ${host} (ssl: ${!isLocal})`);
  for (const file of FILES) {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'db', file), 'utf8');
    process.stdout.write(`  running ${file} ... `);
    await pool.query(sql);
    console.log('ok');
  }
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM outfit_catalog');
  console.log(`Done. outfit_catalog has ${rows[0].n} outfits.`);
  await pool.end();
})().catch((err) => {
  console.error('\nSetup failed:', err.message);
  process.exit(1);
});
