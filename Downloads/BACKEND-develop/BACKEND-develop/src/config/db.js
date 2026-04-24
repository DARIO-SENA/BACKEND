import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "DARIO",
  password: "Nicolasarias200506_",
  port: 5432,
});

export default pool;
pool.query('SELECT NOW()')
  .then(res => console.log('🟢 DB conectada:', res.rows[0]))
  .catch(err => console.error('🔴 Error DB:', err));