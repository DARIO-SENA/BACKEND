import Redis from 'ioredis';
import logger from './logger.js';

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times > 10) {
      logger.error('[Redis] Máximo de reintentos alcanzado. No se reconectará.');
      return null;
    }
    const delay = Math.min(times * 200, 5000);
    logger.warn(`[Redis] Reintentando conexión en ${delay}ms (intento ${times}/10)`);
    return delay;
  },
};

let client = null;

const createClient = () => {
  const c = new Redis(redisConfig);
  c.on('error', (err) => {
    logger.error('[Redis] Error:', err.message);
  });
  c.on('connect', () => {
    logger.info('[Redis] Conectado');
  });
  c.on('reconnecting', () => {
    logger.warn('[Redis] Reconectando...');
  });
  return c;
};

export const getRedisClient = () => {
  if (!client || client.status === 'end' || client.status === 'close') {
    client = createClient();
  }
  return client;
};
