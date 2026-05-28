const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/DARIO' });
(async () => {
  try {
    await pool.query(`ALTER TABLE habitos ADD COLUMN IF NOT EXISTS categoria VARCHAR(50) DEFAULT NULL`);
    console.log('OK: column categoria added to habitos');
  } catch (e) { console.error(e.message); } finally { await pool.end(); }
})();
