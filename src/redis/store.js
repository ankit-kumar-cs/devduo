import redis from 'redis';
import { RedisStore } from 'connect-redis';
export const connectRedis = async () => {
    const redisPort = process.env.REDIS_PORT || '6379';
    try {
        const client = redis.createClient({
            url: `redis://localhost:${redisPort}`
        });
        await client.connect();
        console.log('Connected to Redis successfully');
        return client;
    } catch (error) {
        console.error('Error connecting to Redis:', error);
        throw error;
    }
}

export const createRedisStore = (client, storeName) => {
    if (!client) {
        throw new Error('Redis client is required to create RedisStore');
    }

    try {
        const store = new RedisStore({ client, prefix: `${storeName}:` });
        console.log(`Redis store ${storeName} created successfully`);
        return store;
    } catch (error) {
        console.error(`Error creating Redis store ${storeName}:`, error);
        throw error;
    }
}