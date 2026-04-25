import { createClient } from 'redis';

const client = createClient({ url: 'redis://localhost:6379' });

client.on('error', (err) => console.error('Redis error:', err));

await client.connect();

const pong = await client.ping();
console.log("RESPUESTA REDIS:", pong);

await client.quit();