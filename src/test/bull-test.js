import { Queue } from 'bullmq';

const q = new Queue('recordatorios', {
  connection: { host: 'localhost', port: 6379 }
});

await q.add('test', { hola: 'mundo' });

console.log("JOB ENVIADO");