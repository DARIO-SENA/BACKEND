import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "dario",
  password: "Nicolasarias200506_",
  port: 5432,
});

export default pool;