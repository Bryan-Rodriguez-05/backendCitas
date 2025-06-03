// models/citasModel.js
const { sql, poolPromise } = require('../config/dbConfig');

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
    return result.recordset;
  },

  /**
   * Devuelve una cita por su id.
   */
  getCitaPorId: async (id) => {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT id, paciente_usuario_id, medico_usuario_id, fecha_cita, motivo, tipo
        FROM citas
        WHERE id = @id
      `);
    return result.recordset[0];
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
    return result.rowsAffected[0];
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
  },

  /**
   * (Opcional) Devuelve todas las citas (rol 'ADMIN').
   */
  getAllCitas: async () => {
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
    return result.recordset;
  }
};
