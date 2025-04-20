const { poolPromise } = require('../config/dbConfig');

exports.getEspecialidades = async () => {
  // Espera a que la conexión esté lista
  const pool = await poolPromise;
  // Ejecuta la consulta para obtener todas las especialidades
  const result = await pool.request()
    .query('SELECT * FROM Especialidades');
  return result.recordset;
};
