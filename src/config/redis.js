import Redis from 'ioredis';

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times > 10) {
      console.error('[Redis] Máximo de reintentos alcanzado. No se reconectará.');
      return null;
    }
    const delay = Math.min(times * 200, 5000);
    console.warn(`[Redis] Reintentando conexión en ${delay}ms (intento ${times}/10)`);
    return delay;
  },
};

let client = null;

const createClient = () => {
  const c = new Redis(redisConfig);
  c.on('error', (err) => {
    console.error('[Redis] Error:', err.message);
  });
  c.on('connect', () => {
    console.log('[Redis] Conectado');
  });
  c.on('reconnecting', () => {
    console.warn('[Redis] Reconectando...');
  });
  return c;
};

export const getRedisClient = () => {
  if (!client || client.status === 'end' || client.status === 'close') {
    client = createClient();
  }
  return client;
};
