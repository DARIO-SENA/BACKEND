const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const DB_URL = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const args = process.argv.slice(2).join(' ');
const cmd = `npx pg-migrate ${args} -u "${DB_URL}"`;

try {
  execSync(cmd, { stdio: 'inherit', env: process.env });
} catch {
  process.exit(1);
}
