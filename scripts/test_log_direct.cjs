const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/DARIO' });
(async () => {
  try {
    // Find a real exercise
    const { rows: exercises } = await pool.query("SELECT id, nombre FROM ejercicios LIMIT 5");
    console.log('Exercises:', exercises);
    if (exercises.length === 0) {
      console.log('No exercises found. Creating test data...');
      // Find a routine
      const { rows: routines } = await pool.query("SELECT id, nombre FROM rutinas LIMIT 1");
      console.log('Routines:', routines);
      if (routines.length === 0) {
        console.log('No routines exist yet. Create one first in the UI.');
        return;
      }
      console.log('Cannot test without exercises');
      return;
    }

    const ej = exercises[0];
    console.log(`\nTesting with ejercicio_id=${ej.id}, nombre=${ej.nombre}`);

    // Test the full INSERT flow
    const registro = await pool.query(
      `INSERT INTO registros_entrenamiento (usuario_id, ejercicio_id, rutina_id, fecha, notas)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [38, ej.id, null, new Date(), null]
    );
    console.log('Registro created:', registro.rows[0]);

    const registroId = registro.rows[0].id;

    // Insert a series
    const serie = await pool.query(
      `INSERT INTO series_entrenamiento (registro_id, numero_serie, repeticiones, peso_kg, rpe)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [registroId, 1, 10, 20.5, null]
    );
    console.log('Serie created:', serie.rows[0]);

    // Cleanup
    await pool.query('DELETE FROM series_entrenamiento WHERE registro_id = $1', [registroId]);
    await pool.query('DELETE FROM registros_entrenamiento WHERE id = $1', [registroId]);
    console.log('\nTest PASSED: INSERT works correctly');
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await pool.end();
  }
})();
