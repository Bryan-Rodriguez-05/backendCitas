// config/dbConfig.js
const sql = require('mssql');

const config = {
  user: 'victoriakim',
  password: 'ssAyiyCWcp5pTTB',
  server: 'grupo04.database.windows.net',
  database: 'gestiondecitas',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// Aquí creamos un promise que se conecta una sola vez
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log(' Conectado a SQL Server');
    return pool;
  })
  .catch(err => {
    console.error(' Error de conexión a SQL Server:', err);
    throw err;
  });

module.exports = {
  sql,           // exportamos el módulo sql para tipos
  poolPromise   // exportamos la promesa del pool
};
