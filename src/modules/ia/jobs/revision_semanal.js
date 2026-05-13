import { Queue, Worker } from 'bullmq';
import { redisConfig } from '../../../config/redis.js';
import pool from '../../../config/db.js';
import { generarResumen } from '../ia.service.js';

export const colaRevision = new Queue('revision-semanal', {
  connection: redisConfig,
  defaultJobOptions: { attempts: 2, removeOnComplete: 100 },
});

export const programarRevisionSemanal = async () => {
  const { rows: usuarios } = await pool.query('SELECT id FROM usuarios');
  const ahora = new Date();
  const target = new Date(ahora);

  // Proximo domingo a las 20:00
  const diasHastaDomingo = (7 - target.getDay()) % 7;
  target.setDate(target.getDate() + diasHastaDomingo);
  target.setHours(20, 0, 0, 0);

  if (target <= ahora) target.setDate(target.getDate() + 7);

  for (const usuario of usuarios) {
    await colaRevision.add(
      'revision-semanal',
      { usuarioId: usuario.id },
      { delay: target.getTime() - ahora.getTime(), jobId: `rev-${usuario.id}-${target.toISOString().split('T')[0]}` }
    );
  }
};

const worker = new Worker('revision-semanal', async (job) => {
  const { usuarioId } = job.data;
  try {
    const resumen = await generarResumen(usuarioId, 'semanal');

    await pool.query(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo)
       VALUES ($1, $2, $3, 'ia')`,
      [usuarioId, 'Tu resumen semanal DARIO esta listo', resumen.resumen]
    );
    console.log(`Revision semanal enviada a usuario ${usuarioId}`);
  } catch (err) {
    console.error(`Error revision semanal usuario ${usuarioId}:`, err.message);
  }
}, { connection: redisConfig });

worker.on('completed', job => console.log(`Revision semanal completada: ${job.id}`));
worker.on('failed', (job, err) => console.error(`Revision semanal fallo: ${err.message}`));
