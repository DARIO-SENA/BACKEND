const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/DARIO' });
(async () => {
  try {
    // Test just the Date conversion
    const { rows } = await pool.query('SELECT $1::date AS d', [new Date()]);
    console.log('Date works:', rows[0].d);
    
    // Test with a date string
    const { rows: r2 } = await pool.query("SELECT $1::date AS d", ['2026-05-27']);
    console.log('String works:', r2[0].d);
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await pool.end();
  }
})();
