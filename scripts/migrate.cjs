const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const args = process.argv.slice(2).join(' ');
const cmd = `npx node-pg-migrate ${args}`;

try {
  execSync(cmd, { stdio: 'inherit', env: process.env });
} catch {
  process.exit(1);
}
