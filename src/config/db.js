import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  ssl: {rejectUnauthorized: false}
});

export default pool;

pool.query("SELECT NOW()")
  .then(res => console.log("🟢 DB conactada: ", res.rows[0]))
  .catch(err => console.error("🔴 Error DB:", err));
