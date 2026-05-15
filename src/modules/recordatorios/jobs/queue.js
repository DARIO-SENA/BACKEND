import { Queue, QueueEvents } from 'bullmq';
import { redisConfig } from '../../../config/redis.js';

// ─── COLA PRINCIPAL ─────────────────────────────
export const colaRecordatorios = new Queue('recordatorios', {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

// ─── EVENTOS DE LA COLA ─────────────────────────
const eventos = new QueueEvents('recordatorios', {
  connection: redisConfig,
});

eventos.on('completed', ({ jobId }) => {
  console.log(`✅ Job ${jobId} completado`);
});

eventos.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Job ${jobId} falló: ${failedReason}`);
});

// ─── AGREGAR JOB ───────────────────────────────
export const agregarJob = async (datos, fechaHora) => {
  try {
    const now = Date.now();
    const target = new Date(fechaHora).getTime();

    const delay = Math.max(0, target - now);

    const job = await colaRecordatorios.add(
      'enviar-recordatorio',
      datos,
      {
        delay,
        jobId: `rec-${datos.recordatorioId}`,
      }
    );

    return job;

  } catch (error) {
    console.error("❌ ERROR AGREGANDO JOB:", error);
    throw error;
  }
};

// ─── CANCELAR JOB ──────────────────────────────
export const cancelarJob = async (recordatorioId) => {
  const job = await colaRecordatorios.getJob(`rec-${recordatorioId}`);
  if (job) {
    await job.remove();
  }
};
