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

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);

  try {
    const dbResult = await pool.query('SELECT NOW()');
    console.log('🟢 DB conectada:', dbResult.rows[0]);
  } catch (err) {
    console.error('🔴 Error DB:', err.message);
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
  imprimirRutas(app);
});