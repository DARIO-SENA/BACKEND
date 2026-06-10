const { Client } = require('pg');
const c = new Client({ connectionString: 'postgres://postgres:postgres@localhost:5432/DARIO' });
c.connect().then(() => {
  return c.query("SELECT id, nombre, email FROM usuarios WHERE email = 'dario@email.com'");
}).then(r => {
  console.log(JSON.stringify(r.rows[0]));
  return c.end();
}).catch(e => { console.error(e.message); process.exit(1); });
