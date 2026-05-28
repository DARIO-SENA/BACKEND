const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/DARIO' });
(async () => {
  try {
    const { rows } = await pool.query("SELECT id, email, nombre FROM usuarios LIMIT 5");
    console.log(rows.map(r => `id=${r.id} email=${r.email} nombre=${r.nombre}`).join('\n'));
  } catch (e) {
    console.error(e.message);
  } finally {
    await pool.end();
  }
})();
