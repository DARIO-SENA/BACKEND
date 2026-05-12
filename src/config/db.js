import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_POOL_MAX) || 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,

  ssl: process.env.DB_SSL === "true"
    ? { rejectUnauthorized: false }
    : false,
});

export default pool;

pool.query("SELECT NOW()")
  .then(res => console.log("🟢 DB conectada: ", res.rows[0]))
  .catch(err => console.error("🔴 Error DB:", err));
