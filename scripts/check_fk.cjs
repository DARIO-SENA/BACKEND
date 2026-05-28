const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/DARIO' });
(async () => {
  try {
    const { rows } = await pool.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_type
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name IN ('registros_entrenamiento', 'series_entrenamiento', 'ejercicios', 'rutinas')
      ORDER BY tc.table_name, tc.constraint_type
    `);
    console.log(rows.map(r => `  ${r.table_name}.${r.column_name} ${r.constraint_type} -> ${r.foreign_table_name}.${r.foreign_column_name}`).join('\n'));
  } catch (e) {
    console.error(e.message);
  } finally {
    await pool.end();
  }
})();
