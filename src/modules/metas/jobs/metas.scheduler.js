import pool from '../../../config/db.js';
import { colaMetas } from './metas.queue.js';
import logger from '../../../config/logger.js';

export const revisarMetasProximasAVencer = async () => {
  try {
    const { rows } = await pool.query(
      `SELECT m.id, m.usuario_id, m.titulo, m.progreso, m.fecha_fin
       FROM metas m
       WHERE m.estado = 'en_progreso'
         AND m.fecha_fin IS NOT NULL
         AND m.fecha_fin <= CURRENT_DATE + INTERVAL '3 days'
         AND m.fecha_fin >= CURRENT_DATE
         AND m.progreso < 100
         AND NOT EXISTS (
           SELECT 1 FROM notificaciones n
           WHERE n.usuario_id = m.usuario_id
             AND n.titulo LIKE '%' || m.titulo || '%'
             AND n.creado_en >= CURRENT_DATE
         )`
    );

    for (const meta of rows) {
      await colaMetas.add(
        'meta-proxima-vencer',
        {
          metaId: meta.id,
          usuarioId: meta.usuario_id,
          titulo: meta.titulo,
          fecha_fin: meta.fecha_fin,
          progreso: meta.progreso,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        }
      );
    }

    if (rows.length > 0) {
      logger.info(`${rows.length} meta(s) próxima(s) a vencer encolada(s)`);
    }
  } catch (err) {
    logger.error('Error revisando metas próximas a vencer:', err.message);
  }
};

const programarProximaRevision = () => {
  setTimeout(async () => {
    await revisarMetasProximasAVencer();
    programarProximaRevision();
  }, 60 * 60 * 1000);
};

export const iniciarSchedulerMetas = () => {
  revisarMetasProximasAVencer().then(() => {
    programarProximaRevision();
  }).catch(() => {
    programarProximaRevision();
  });
  logger.info('Scheduler de metas iniciado (revisión cada hora)');
};
