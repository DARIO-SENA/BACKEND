import { Queue, Worker } from 'bullmq';
import { redisConfig } from '../../../config/redis.js';
import pool from '../../../config/db.js';
import { priorizarTareasDelDia } from '../ia.service.js';

export const colaCoach = new Queue('coach-diario', {
  connection: redisConfig,
  defaultJobOptions: { attempts: 2, removeOnComplete: 100 },
});

export const programarCoachDiario = async () => {
  const { rows: usuarios } = await pool.query('SELECT id FROM usuarios');
  const ahora = new Date();
  const target = new Date(ahora);
  target.setHours(6, 0, 0, 0);

  if (target <= ahora) target.setDate(target.getDate() + 1);

  const baseDelay = target.getTime() - ahora.getTime();
  const ventanaMinutos = 30;

  for (const usuario of usuarios) {
    const stagger = Math.floor(Math.random() * ventanaMinutos * 60 * 1000);
    await colaCoach.add(
      'coach-matutino',
      { usuarioId: usuario.id },
      { delay: baseDelay + stagger, jobId: `coach-${usuario.id}-${target.toISOString().split('T')[0]}` }
    );
  }
};

try {
  const worker = new Worker('coach-diario', async (job) => {
    const { usuarioId } = job.data;
    try {
      const prioridades = await priorizarTareasDelDia(usuarioId);
      const total = prioridades.length;
      const primera = prioridades[0]?.titulo || 'ninguna';

      await pool.query(
        `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo)
         VALUES ($1, $2, $3, 'ia')`,
        [usuarioId, 'Buenos dias, aqui estan tus prioridades',
         `Tienes ${total} tareas para hoy. Empieza con: "${primera}"`]
      );
      console.log(`Coach diario enviado a usuario ${usuarioId}`);
    } catch (err) {
      console.error(`Error coach diario usuario ${usuarioId}:`, err.message);
    }
  }, { connection: redisConfig });

  worker.on('completed', job => console.log(`Coach diario completado: ${job.id}`));
  worker.on('failed', (job, err) => console.error(`Coach diario fallo: ${err.message}`));
} catch (err) {
  console.error('💥 Error creando worker coach diario:', err.message);
}
