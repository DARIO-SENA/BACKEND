import 'dotenv/config';
import pool from './src/config/db.js';
import bcrypt from 'bcrypt';

try {
  const users = await pool.query('SELECT id, email, password FROM usuarios');
  for (const u of users.rows) {
    const match = await bcrypt.compare('password', u.password);
    console.log(`Email: ${u.email}, password match: ${match}`);
  }
} catch (e) {
  console.error('Error:', e.message);
}
await pool.end();
