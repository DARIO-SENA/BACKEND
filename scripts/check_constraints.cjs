const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/DARIO' });
(async () => {
  try {
    const { rows } = await pool.query(`
      SELECT conname, consrc, contype
      FROM pg_constraint
      WHERE conrelid = 'recordatorios'::regclass
    `);
    console.log(rows.map(r => `  ${r.conname} (${r.contype}): ${r.consrc || '(no pg constraint src)'}`).join('\n'));
  } catch (e) { console.error(e.message); } finally { await pool.end(); }
})();
