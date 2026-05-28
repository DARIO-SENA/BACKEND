const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/DARIO' });
(async () => {
  try {
    const { rows } = await pool.query(
      "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'series_entrenamiento' ORDER BY ordinal_position"
    );
    console.log(rows.map(c => `${c.column_name} ${c.data_type} ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`).join('\n'));
  } catch (e) {
    console.error(e.message);
  } finally {
    await pool.end();
  }
})();
