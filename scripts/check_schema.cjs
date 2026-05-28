const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/DARIO' });
(async () => {
  try {
    const tables = ['registros_entrenamiento', 'series_entrenamiento', 'ejercicios', 'rutinas'];
    for (const table of tables) {
      console.log(`\n=== ${table} ===`);
      const { rows } = await pool.query(
        `SELECT column_name, data_type, is_nullable, column_default 
         FROM information_schema.columns 
         WHERE table_name = $1 
         ORDER BY ordinal_position`,
        [table]
      );
      console.log(rows.map(c => `  ${c.column_name} ${c.data_type}${c.is_nullable === 'YES' ? '' : ' NOT NULL'}${c.column_default ? ' DEFAULT ' + c.column_default : ''}`).join('\n'));
    }
  } catch (e) {
    console.error(e.message);
  } finally {
    await pool.end();
  }
})();
