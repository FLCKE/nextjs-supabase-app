import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let redisAvailable = false;

/**
 * Get or create Redis client singleton
 * Uses REDIS_URL from environment, falls back to localhost:6379
 * Returns null if Redis is not available (graceful degradation)
 */
export async function getRedisClient(): Promise<RedisClientType | null> {
  if (redisClient && redisClient.isOpen) {
    redisAvailable = true;
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            console.error('Redis reconnection failed after 10 attempts');
            redisAvailable = false;
            return new Error('Max Redis retries reached');
          }
          return retries * 100;
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis client error:', err);
      redisAvailable = false;
    });

    redisClient.on('connect', () => {
      console.log('Redis client connected');
      redisAvailable = true;
    });

    redisClient.on('disconnect', () => {
      console.log('Redis client disconnected');
      redisAvailable = false;
    });

    await redisClient.connect();
    console.log('Redis connected successfully');
    redisAvailable = true;
    return redisClient;
  } catch (error) {
    // Graceful degradation: Redis is optional in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Redis not available, continuing without cache (development mode)');
    } else {
      console.error('Failed to connect to Redis:', error);
    }
    redisAvailable = false;
    return null;
  }
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redisAvailable && redisClient?.isOpen === true;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.disconnect();
    redisClient = null;
  }
}
