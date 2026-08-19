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
import { getRedisClient } from './config/redis.js';
import logger from './config/logger.js';

const REQUIRED_ENV = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_NAME', 'JWT_SECRET', 'REDIS_HOST'];
const missing = REQUIRED_ENV.filter(key => !process.env[key]);
if (missing.length > 0) {
  logger.error(`Faltan variables de entorno requeridas: ${missing.join(', ')}`);
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  logger.warn('OPENAI_API_KEY no configurada. El módulo IA no estará disponible.');
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

const gracefulShutdown = async (signal) => {
  logger.info(`Señal ${signal} recibida. Cerrando conexiones...`);
  try {
    await worker.close();
    await colaRecordatorios.close();
    await colaCoach.close();
    await colaRevision.close();
    const redis = getRedisClient();
    if (redis) await redis.quit();
    await pool.end();
    logger.info('Conexiones cerradas correctamente');
    process.exit(0);
  } catch (err) {
    logger.error('Error durante shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const PORT = process.env.PORT || 3000;

import { imprimirRutas } from './utils/routes.logger.js';
import { runMigrations } from '../database/migrate.js';

app.listen(PORT, async () => {
  logger.info(`Servidor corriendo en puerto ${PORT}`);

  try {
    const dbResult = await pool.query('SELECT NOW()');
    logger.info('DB conectada:', { now: dbResult.rows[0] });
  } catch (err) {
    logger.error('Error DB:', err.message);
  }

  await runMigrations();

  await iniciarScheduler();
  try {
    await programarCoachDiario();
  } catch (err) {
    logger.error('Error programando coach diario:', err.message);
  }
  try {
    await programarRevisionSemanal();
  } catch (err) {
    logger.error('Error programando revisión semanal:', err.message);
  }
  iniciarSchedulerMetas();

  cron.schedule('0 8 * * 1', async () => {
    try {
      logger.info('Ejecutando envio de resumenes semanales...');
      await enviarResumenesPendientes();
    } catch (err) {
      logger.error('Error en envio de resumenes semanales:', err.message);
    }
  });

  imprimirRutas(app);
});
