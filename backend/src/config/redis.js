const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (error) => {
	console.error('Redis client error:', error.message);
});

async function connectRedis() {
	if (!redisClient.isOpen) {
		await redisClient.connect();
		console.log('Connected to Redis');
	}
}

module.exports = {
	redisClient,
	connectRedis
};
