// models/citasModel.js
const { sql, poolPromise } = require('../config/dbConfig');
// const redisClient = require('../config/redisClient');  // Comenta esta línea para desactivar Redis

module.exports = {
  /**
   * Crea una nueva cita. Devuelve el id de la cita insertada.
   */
  createCita: async (paciente_usuario_id, medico_usuario_id, fecha_cita, motivo, tipo) => {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('paciente_usuario_id', sql.Int, paciente_usuario_id)
      .input('medico_usuario_id', sql.Int, medico_usuario_id)
      .input('fecha_cita', sql.DateTime, fecha_cita)
      .input('motivo', sql.VarChar, motivo)
      .input('tipo', sql.VarChar, tipo)
      .query(`
        INSERT INTO citas (paciente_usuario_id, medico_usuario_id, fecha_cita, motivo, tipo)
        VALUES (@paciente_usuario_id, @medico_usuario_id, @fecha_cita, @motivo, @tipo);
        SELECT SCOPE_IDENTITY() AS id;
      `);
    return result.recordset[0].id;
  },

  /**
   * Devuelve todas las citas de un paciente dado (rol 'PACIENTE').
   */
  getCitasPorPaciente: async (paciente_usuario_id) => {
    // Eliminar el uso de Redis para caché
    // const cacheKey = `citas:paciente:${paciente_usuario_id}`;
    // const cached = await redisClient.get(cacheKey);
    // if (cached) {
    //   return JSON.parse(cached);
    // }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('paciente_usuario_id', sql.Int, paciente_usuario_id)
      .query(`
        SELECT
          c.id,
          c.fecha_cita,
          c.motivo,
          c.tipo,
          m.nombre AS medico_nombre,
          m.apellido AS medico_apellido,
          e.nombre AS especialidad
        FROM citas c
        INNER JOIN medicos m ON c.medico_usuario_id = m.usuario_id
        INNER JOIN especialidades e ON m.especialidad_id = e.id
        WHERE c.paciente_usuario_id = @paciente_usuario_id
        ORDER BY c.fecha_cita DESC
      `);
    const citas = result.recordset;

    // Si no usas Redis, simplemente no lo guardes en caché.
    // await redisClient.setEx(cacheKey, 300, JSON.stringify(citas));

    return citas;
  },

  /**
   * Devuelve una cita por su id.
   */
  getCitaPorId: async (id) => {
    // Eliminar el uso de Redis para caché
    // const cacheKey = `cita:${id}`;
    // const cached = await redisClient.get(cacheKey);
    // if (cached) {
    //   return JSON.parse(cached);
    // }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT id, paciente_usuario_id, medico_usuario_id, fecha_cita, motivo, tipo
        FROM citas
        WHERE id = @id
      `);
    const cita = result.recordset[0] || null;

    // Si no usas Redis, no es necesario guardarlo en caché.
    // if (cita) {
    //   await redisClient.setEx(cacheKey, 300, JSON.stringify(cita));
    // }
    
    return cita;
  },

  /**
   * Actualiza los campos fecha_cita, motivo y tipo de una cita.
   * Devuelve el número de filas afectadas (1 si actualizó, 0 si no).
   */
  updateCita: async (id, fecha_cita, motivo, tipo) => {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('fecha_cita', sql.DateTime, fecha_cita)
      .input('motivo', sql.VarChar, motivo)
      .input('tipo', sql.VarChar, tipo)
      .query(`
        UPDATE citas
        SET fecha_cita = @fecha_cita,
            motivo     = @motivo,
            tipo       = @tipo
        WHERE id = @id
      `);
    const rows = result.rowsAffected[0];

    if (rows > 0) {
      // Si no usas Redis, no es necesario invalidar el caché.
      // await redisClient.del(`cita:${id}`);
      // await redisClient.del('citas:all');
    }
    return rows;
  },

  /**
   * Elimina una cita por id.
   */
  deleteCita: async (id) => {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM citas
        WHERE id = @id
      `);

    // Si no usas Redis, no es necesario invalidar el caché.
    // await redisClient.del(`cita:${id}`);
    // await redisClient.del('citas:all');
  },

  /**
   * (Opcional) Devuelve todas las citas (rol 'ADMIN').
   */
  getAllCitas: async () => {
    // Eliminar el uso de Redis para caché
    // const cacheKey = 'citas:all';
    // const cached = await redisClient.get(cacheKey);
    // if (cached) {
    //   return JSON.parse(cached);
    // }

    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT
          c.id,
          c.fecha_cita,
          c.motivo,
          c.tipo,
          p.nombre AS paciente_nombre,
          p.apellido AS paciente_apellido,
          m.nombre AS medico_nombre,
          m.apellido AS medico_apellido,
          e.nombre AS especialidad
        FROM citas c
        INNER JOIN pacientes p ON c.paciente_usuario_id = p.usuario_id
        INNER JOIN medicos m ON c.medico_usuario_id = m.usuario_id
        INNER JOIN especialidades e ON m.especialidad_id = e.id
        ORDER BY c.fecha_cita DESC
      `);
    const citas = result.recordset;

    // Si no usas Redis, no es necesario guardarlo en caché.
    // await redisClient.setEx(cacheKey, 300, JSON.stringify(citas));

    return citas;
  }
};
