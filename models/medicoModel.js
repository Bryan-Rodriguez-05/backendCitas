// models/medicoModel.js
const { sql, poolPromise } = require('../config/dbConfig');

exports.getMedicosByEspecialidad = async (especialidad_id) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('especialidad_id', sql.Int, especialidad_id)
    .query(`
      SELECT 
        id, 
        nombre, 
        apellido 
      FROM Medicos 
      WHERE especialidad_id = @especialidad_id
    `);
  return result.recordset;
};
