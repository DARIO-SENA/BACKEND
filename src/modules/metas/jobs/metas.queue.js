import { Queue, QueueEvents } from 'bullmq';
import { redisConfig } from '../../../config/redis.js';

export const colaMetas = new Queue('metas-notificaciones', {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

const eventos = new QueueEvents('metas-notificaciones', {
  connection: redisConfig,
});

eventos.on('completed', ({ jobId }) => {
  console.log(`✅ Meta Job ${jobId} completado`);
});

eventos.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Meta Job ${jobId} falló: ${failedReason}`);
});
