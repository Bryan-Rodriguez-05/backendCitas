// models/especialidadesModel.js
const { sql, poolPromise } = require('../config/dbConfig');
// const redisClient = require('../config/redisClient');  // Comentamos esta línea para desactivar Redis

module.exports = {
  /**
   * Devuelve todas las especialidades (para pacientes, médicos y administradores).
   */
  getEspecialidades: async () => {
    // Eliminar todo el código relacionado con Redis
    // const cacheKey = 'especialidades:all';
    // const cached = await redisClient.get(cacheKey);
    // if (cached) {
    //   return JSON.parse(cached);
    // }

    const pool = await poolPromise;
    const result = await pool.request()
      .query(`SELECT id, nombre FROM especialidades ORDER BY nombre`);
    const especialidades = result.recordset;

    // Si no usas Redis, simplemente no lo guardes en caché.
    // await redisClient.setEx(cacheKey, 300, JSON.stringify(especialidades));

    return especialidades;
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
    const newId = result.recordset[0].id;

    // Si no usas Redis, simplemente no lo invalides.
    // await redisClient.del('especialidades:all');
    
    return newId;
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

    // Si no usas Redis, simplemente no lo invalides.
    // await redisClient.del('especialidades:all');
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

    // Si no usas Redis, simplemente no lo invalides.
    // await redisClient.del('especialidades:all');
  }
};
