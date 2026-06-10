import 'dotenv/config';
import pool from './src/config/db.js';
try {
  const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'usuarios' ORDER BY ordinal_position");
  console.log('=== Columnas de usuarios ===');
  cols.rows.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));

  const users = await pool.query('SELECT id, email, nombre, usuario FROM usuarios LIMIT 5');
  console.log('\n=== Usuarios existentes ===');
  console.table(users.rows);
} catch (e) {
  console.error('Error:', e.message);
}
await pool.end();
