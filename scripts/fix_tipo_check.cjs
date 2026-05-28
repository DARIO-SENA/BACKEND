const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/DARIO' });
(async () => {
  try {
    await pool.query(`ALTER TABLE recordatorios DROP CONSTRAINT recordatorios_tipo_check`);
    await pool.query(`ALTER TABLE recordatorios ADD CONSTRAINT recordatorios_tipo_check CHECK (tipo IN ('agenda', 'habito', 'manual', 'push', 'whatsapp', 'email'))`);
    console.log('OK: constraint updated');
  } catch (e) { console.error(e.message); } finally { await pool.end(); }
})();
