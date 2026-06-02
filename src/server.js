import 'dotenv/config';

import { app } from "./app.js";
import './eventBus/setup.js';
import worker from './modules/recordatorios/jobs/reminder.processor.js';
import { iniciarScheduler } from './modules/recordatorios/jobs/scheduler.js';
import { colaRecordatorios } from './modules/recordatorios/jobs/queue.js';
import { colaCoach, programarCoachDiario } from './modules/ia/jobs/coach_diario.js';
import { colaRevision, programarRevisionSemanal } from './modules/ia/jobs/revision_semanal.js';
import './modules/metas/jobs/metas.notifier.js';
import { iniciarSchedulerMetas } from './modules/metas/jobs/metas.scheduler.js';
import { enviarResumenesPendientes } from './services/email.service.js';
import cron from 'node-cron';
import pool from './config/db.js';

const REQUIRED_ENV = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_NAME', 'JWT_SECRET', 'REDIS_HOST'];
const missing = REQUIRED_ENV.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Faltan variables de entorno requeridas: ${missing.join(', ')}`);
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY no configurada. El módulo IA no estará disponible.');
}

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  Señal ${signal} recibida. Cerrando conexiones...`);
  try {
    await worker.close();
    await colaRecordatorios.close();
    await colaCoach.close();
    await colaRevision.close();
    await pool.end();
    console.log('✅ Conexiones cerradas correctamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const PORT = process.env.PORT || 3000;

import { imprimirRutas } from './utils/routes.logger.js';
import { initTables as initRutinaTables } from './modules/rutina/rutina.service.js';
import { initGymTables } from './modules/gym/gym.service.js';
import { initLecturaTables } from './modules/lectura/lectura.service.js';
import { runMigrations } from '../database/migrate.js';

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);

  try {
    const dbResult = await pool.query('SELECT NOW()');
    console.log('🟢 DB conectada:', dbResult.rows[0]);
  } catch (err) {
    console.error('🔴 Error DB:', err.message);
  }

  await runMigrations();

  try {
    await initRutinaTables();
    console.log('🟢 Tablas de rutina inicializadas');
  } catch (err) {
    console.error('🔴 Error inicializando tablas de rutina:', err.message);
  }

  try {
    await initGymTables();
    console.log('🟢 Tablas de gym inicializadas');
  } catch (err) {
    console.error('🔴 Error inicializando tablas de gym:', err.message);
  }

  try {
    await initLecturaTables();
    console.log('🟢 Tablas de lectura inicializadas');
  } catch (err) {
    console.error('🔴 Error inicializando tablas de lectura:', err.message);
  }

  // Migration: link habitos with lectura_planes
  try {
    await pool.query(`
      ALTER TABLE habitos
      ADD COLUMN IF NOT EXISTS lectura_plan_id INTEGER REFERENCES lectura_planes(id) ON DELETE SET NULL
    `);
    console.log('🟢 Columna lectura_plan_id agregada a habitos');
  } catch (err) {
    console.error('🔴 Error en migración lectura_plan_id:', err.message);
  }

  await iniciarScheduler();
  try {
    await programarCoachDiario();
  } catch (err) {
    console.error('⚠️ Error programando coach diario:', err.message);
  }
  try {
    await programarRevisionSemanal();
  } catch (err) {
    console.error('⚠️ Error programando revisión semanal:', err.message);
  }
  iniciarSchedulerMetas();

  cron.schedule('0 8 * * 1', async () => {
    console.log('Ejecutando envio de resumenes semanales...');
    await enviarResumenesPendientes();
  });

  imprimirRutas(app);
});