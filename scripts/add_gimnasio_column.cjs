const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/DARIO' });
(async () => {
  try {
    await pool.query(`ALTER TABLE plantillas_bloques ADD COLUMN gimnasio_rutina_id INTEGER REFERENCES rutinas(id) ON DELETE SET NULL`);
    console.log('OK: column gimnasio_rutina_id added to plantillas_bloques');
  } catch (e) { console.error(e.message); } finally { await pool.end(); }
})();
