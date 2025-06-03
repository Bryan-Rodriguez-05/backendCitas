// models/especialidadesModel.js
const { sql, poolPromise } = require('../config/dbConfig');

module.exports = {
  /**
   * Devuelve todas las especialidades (para pacientes, médicos y administradores).
   */
  getEspecialidades: async () => {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`SELECT id, nombre FROM especialidades ORDER BY nombre`);
    return result.recordset;
  },

  /**
   * Crea una nueva especialidad. Devuelve el id generado.
   */
  createEspecialidad: async (nombre) => {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('nombre', sql.VarChar, nombre)
      .query(`
        INSERT INTO especialidades (nombre)
        VALUES (@nombre);
        SELECT SCOPE_IDENTITY() AS id;
      `);
    return result.recordset[0].id;
  },

  /**
   * Actualiza el nombre de una especialidad.
   */
  updateEspecialidad: async (id, nombre) => {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.VarChar, nombre)
      .query(`
        UPDATE especialidades
        SET nombre = @nombre
        WHERE id = @id
      `);
  },

  /**
   * Elimina una especialidad. Asegúrate de que no haya médicos o citas vinculadas (por FK).
   */
  deleteEspecialidad: async (id) => {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM especialidades
        WHERE id = @id
      `);
  }
};
