import Redis from 'ioredis';

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
};

let client = null;

export const getRedisClient = () => {
  if (!client) {
    client = new Redis(redisConfig);
    client.on('error', (err) => {
      console.error('Redis error:', err.message);
    });
  }
  return client;
};
