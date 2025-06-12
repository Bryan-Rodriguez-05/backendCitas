// config/redisClient.js
const { createClient } = require('redis');

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',  // IPv4 explícito
    port: Number(process.env.REDIS_PORT || 6379),
    family: 4                                     // Fuerza IPv4
  }
});

redisClient.on('error', err => console.error('Redis Client Error', err));

(async () => {
  await redisClient.connect();
  console.log('✅ Conectado a Redis en 127.0.0.1:6379 (IPv4)');
})();

module.exports = redisClient;
