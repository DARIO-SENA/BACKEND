const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/DARIO' });
(async () => {
  try {
    // Test inserting with a JS Date object for a date column
    const result = await pool.query(
      `INSERT INTO registros_entrenamiento (usuario_id, ejercicio_id, rutina_id, fecha, notas)
       VALUES (1, 1, 1, $1, 'test')
       RETURNING *`,
      [new Date()]
    );
    console.log('OK:', result.rows[0]);
    // Cleanup
    await pool.query('DELETE FROM registros_entrenamiento WHERE notas = $1', ['test']);
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await pool.end();
  }
})();
