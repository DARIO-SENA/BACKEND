import { getRedisClient } from '../../config/redis.js';

export const obtenerCache = async (llave) => {
  try {
    const c = getRedisClient();
    const data = await c.get(`ia:cache:${llave}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const guardarCache = async (llave, valor, ttl = 3600) => {
  try {
    const c = getRedisClient();
    await c.setex(`ia:cache:${llave}`, ttl, JSON.stringify(valor));
  } catch {
  }
};
