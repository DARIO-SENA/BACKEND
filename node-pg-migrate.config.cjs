const url = process.env.DATABASE_URL;
const databaseUrl = url
  ? { connectionString: url }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'DARIO',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
    };

module.exports = {
  databaseUrl,
  migrationsDir: 'migrations',
  migrationFileLanguage: 'cjs',
  direction: 'up',
};
