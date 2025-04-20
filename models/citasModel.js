// models/citasModel.js
const { sql, poolPromise } = require('../config/dbConfig');

exports.createCita = async (paciente_id, medico_id, fecha_cita, motivo) => {
  const pool = await poolPromise;
  const query = `
    INSERT INTO citas (paciente_id, medico_id, fecha_cita, motivo)
    OUTPUT INSERTED.id
    VALUES (@paciente_id, @medico_id, @fecha_cita, @motivo)
  `;
  const result = await pool.request()
    .input('paciente_id', sql.Int, paciente_id)
    .input('medico_id', sql.Int, medico_id)
    .input('fecha_cita', sql.DateTime, fecha_cita)
    .input('motivo', sql.VarChar, motivo)
    .query(query);
  // recordset[0] es el objeto { id: ... }
  return result.recordset[0];
};

exports.getCitas = async (paciente_id) => {
  const pool = await poolPromise;
  let query = `
    SELECT 
      c.id, 
      c.fecha_cita, 
      c.motivo, 
      p.nombre      AS paciente_nombre, 
      p.apellido    AS paciente_apellido, 
      m.nombre      AS medico_nombre, 
      m.apellido    AS medico_apellido
    FROM citas c
    INNER JOIN pacientes p ON c.paciente_id = p.id
    INNER JOIN medicos   m ON c.medico_id   = m.id
  `;
  const request = pool.request();
  if (paciente_id) {
    query += ' WHERE c.paciente_id = @paciente_id';
    request.input('paciente_id', sql.Int, paciente_id);
  }
  const result = await request.query(query);
  // devolvemos siempre el array de filas
  return result.recordset;
};

exports.updateCita = async (id, paciente_id, medico_id, fecha_cita, motivo) => {
  const pool = await poolPromise;
  const query = `
    UPDATE citas 
    SET 
      paciente_id = @paciente_id,
      medico_id   = @medico_id,
      fecha_cita  = @fecha_cita,
      motivo      = @motivo
    WHERE id = @id
  `;
  await pool.request()
    .input('id', sql.Int, id)
    .input('paciente_id', sql.Int, paciente_id)
    .input('medico_id', sql.Int, medico_id)
    .input('fecha_cita', sql.DateTime, fecha_cita)
    .input('motivo', sql.VarChar, motivo)
    .query(query);

    return result.rowsAffected[0];
};

exports.deleteCita = async (id) => {
  const pool = await poolPromise;
  const query = 'DELETE FROM citas WHERE id = @id';
  await pool.request()
    .input('id', sql.Int, id)
    .query(query);
};
