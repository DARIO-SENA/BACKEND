// src/services/jobs/queue.js

import { Queue, QueueEvents } from 'bullmq';

export const conexionRedis = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

export const colaRecordatorios = new Queue('recordatorios', {
  connection: conexionRedis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

const eventos = new QueueEvents('recordatorios', { connection: conexionRedis });
eventos.on('completed', ({ jobId }) => console.log(`✅ Job ${jobId} completado`));
eventos.on('failed',    ({ jobId, failedReason }) => console.error(`❌ Job ${jobId} falló: ${failedReason}`));

/**
 * Agrega un recordatorio a la cola con delay calculado
 * @param {Object} datos - Payload del job
 * @param {Date}   fechaHora - Cuándo ejecutar
 */
export const agregarJob = async (datos, fechaHora) => {
  const delay = Math.max(0, new Date(fechaHora).getTime() - Date.now());
  return colaRecordatorios.add('enviar-recordatorio', datos, {
    delay,
    jobId: `rec-${datos.recordatorioId}`, // evita duplicados
  });
};

/**
 * Cancela un job existente antes de reprogramar
 * @param {number} recordatorioId
 */
export const cancelarJob = async (recordatorioId) => {
  const job = await colaRecordatorios.getJob(`rec-${recordatorioId}`);
  if (job) await job.remove();
};
