import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MIGRATIONS_TABLE = '_migrations';

const migrations = [
  { file: 'fixes.sql', name: '001_fixes' },
  { file: 'indexes.sql', name: '002_indexes' },
];

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

export async function runMigrations() {
  console.log('\n📦 Ejecutando migraciones de base de datos...');

  try {
    await ensureMigrationsTable();
  } catch (err) {
    console.error('🔴 Error creando tabla de migraciones:', err.message);
    return;
  }

  for (const m of migrations) {
    try {
      if (await isApplied(m.name)) {
        console.log(`   ⏭️  ${m.name} — ya aplicada`);
        continue;
      }

      const sqlPath = join(__dirname, m.file);
      const raw = readFileSync(sqlPath, 'utf-8');
      const sql = raw.split('\n').filter(l => !l.trim().startsWith('\\')).join('\n');

      console.log(`   ▶️  ${m.name} — ejecutando...`);
      await pool.query(sql);
      await markApplied(m.name);
      console.log(`   ✅ ${m.name} — aplicada`);
    } catch (err) {
      console.error(`   ❌ ${m.name} — ERROR: ${err.message}`);
    }
  }

  console.log('✅ Migraciones finalizadas\n');
}
