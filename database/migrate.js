import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MIGRATIONS_TABLE = '_migrations';

const FULL_DB_MIGRATION = '001_full_db';

async function isFreshDatabase() {
  try {
    const { rows } = await pool.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios'`
    );
    return rows.length === 0;
  } catch {
    return true;
  }
}

const migrations = [];

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "${MIGRATIONS_TABLE}" (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

async function isApplied(name) {
  const { rows } = await pool.query(
    `SELECT 1 FROM "${MIGRATIONS_TABLE}" WHERE name = $1`,
    [name]
  );
  return rows.length > 0;
}

async function markApplied(name) {
  await pool.query(
    `INSERT INTO "${MIGRATIONS_TABLE}" (name) VALUES ($1) ON CONFLICT DO NOTHING`,
    [name]
  );
}

async function markFailed(name) {
  await pool.query(
    `DELETE FROM "${MIGRATIONS_TABLE}" WHERE name = $1`,
    [name]
  );
}

async function runSingleMigration(m) {
  if (await isApplied(m.name)) {
    console.log(`   ⏭️  ${m.name} — ya aplicada`);
    return;
  }

  const sqlPath = join(__dirname, m.file);
  const sql = readFileSync(sqlPath, 'utf-8');

  console.log(`   ▶️  ${m.name} — ejecutando...`);
  await pool.query(sql);
  await markApplied(m.name);
  console.log(`   ✅ ${m.name} — aplicada`);
}

export async function runMigrations() {
  console.log('\n📦 Ejecutando migraciones de base de datos...');

  try {
    await ensureMigrationsTable();
  } catch (err) {
    console.error('🔴 Error creando tabla de migraciones:', err.message);
    return;
  }

  if (await isFreshDatabase()) {
    migrations.push({ file: 'DARIODB.sql', name: FULL_DB_MIGRATION });
    console.log('   🆕 Base de datos vacía — aplicando esquema completo');
  } else {
    console.log('   🟢 Base de datos existente — omitiendo esquema completo');
  }

  for (const m of migrations) {
    try {
      await runSingleMigration(m);
    } catch (err) {
      console.error(`   ❌ ${m.name} — ERROR: ${err.message}`);
    }
  }

  console.log('✅ Migraciones finalizadas\n');
}
