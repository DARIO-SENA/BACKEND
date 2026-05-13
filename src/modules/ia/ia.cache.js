import Redis from 'ioredis';
import { redisConfig } from '../../config/redis.js';

let client = null;

const conectar = () => {
  if (!client) {
    client = new Redis(redisConfig);
    client.on('error', () => {
      client = null;
    });
  }
  return client;
};

export const obtenerCache = async (llave) => {
  try {
    const c = conectar();
    const data = await c.get(`ia:cache:${llave}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const guardarCache = async (llave, valor, ttl = 3600) => {
  try {
    const c = conectar();
    await c.setex(`ia:cache:${llave}`, ttl, JSON.stringify(valor));
  } catch {
  }
};
