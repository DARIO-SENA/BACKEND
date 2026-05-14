import { Worker } from 'bullmq';
import { redisConfig } from '../../../config/redis.js';
import pool from '../../../config/db.js';

const procesarNotificacionMeta = async (job) => {
  const { metaId, usuarioId, titulo, fecha_fin } = job.data;

  try {
    const check = await pool.query(
      `SELECT 1 FROM notificaciones
       WHERE usuario_id = $1 AND titulo = $2
       AND creado_en >= CURRENT_DATE`,
      [usuarioId, `Meta por vencer: ${titulo}`]
    );

    if (check.rows.length > 0) return;

    await pool.query(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo)
       VALUES ($1, $2, $3, 'app')`,
      [
        usuarioId,
        `Meta por vencer: ${titulo}`,
        `Tu meta "${titulo}" vence el ${new Date(fecha_fin).toLocaleDateString()}. Llevas un ${job.data.progreso}% de progreso.`
      ]
    );

    console.log(`✅ Notificación meta creada: ${titulo} (usuario ${usuarioId})`);
  } catch (error) {
    console.error('Error procesando notificación meta:', error.message);
  }
};

const worker = new Worker(
  'metas-notificaciones',
  procesarNotificacionMeta,
  {
    connection: redisConfig,
    concurrency: 5,
  }
);

worker.on('ready', () => console.log('🚀 Worker metas-notificaciones listo'));
worker.on('completed', (job) => console.log('🎯 Meta job completado:', job.id));
worker.on('failed', (job, err) => console.error('❌ Meta job falló:', job?.id, err.message));

export default worker;
