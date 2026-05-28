const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/DARIO' });
(async () => {
  try {
    await pool.query(`ALTER TABLE habitos ADD COLUMN IF NOT EXISTS dias_semana JSONB DEFAULT '[]'::jsonb`);
    await pool.query(`ALTER TABLE habitos ADD COLUMN IF NOT EXISTS hora_programada TIME DEFAULT NULL`);
    console.log('OK: columns dias_semana + hora_programada added to habitos');
  } catch (e) { console.error(e.message); } finally { await pool.end(); }
})();
