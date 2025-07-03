// config/redisClient.js
// Comenta todo el bloque de código que crea la conexión con Redis si no deseas usarlo completamente

// const { createClient } = require('redis');

// const redisClient = createClient({
//   socket: {
//     host: process.env.REDIS_HOST || '127.0.0.1',
//     port: Number(process.env.REDIS_PORT || 6379),
//     family: 4
//   }
// });

// redisClient.on('error', err => console.error('Redis Client Error', err));

// (async () => {
//   await redisClient.connect();
//   console.log('✅ Conectado a Redis en 127.0.0.1:6379 (IPv4)');
// })();

// module.exports = redisClient;  // Comenta esta línea si deseas desactivar Redis
